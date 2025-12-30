import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderAvailableByPreferenceSettingWithPermTempMessage1755609408879
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION FN_AVAILABILITY_OF_STAFF_WITH_TEMP_PERM_MESSAGE (
            P_PROVIDERS UUID[],
            P_DATES DATE[],
            P_FACILITY UUID,
            P_START TIME WITHOUT TIME ZONE,
            P_END TIME WITHOUT TIME ZONE
        ) RETURNS TABLE (
            NAME TEXT,
            PROVIDER_ID UUID,
            D DATE,
            TIME_CODE TEXT,
            GLOBAL_OK BOOLEAN,
            PROFILE_OK BOOLEAN,
            PROFILE_SOURCE TEXT,
            PROFILE_REASON TEXT,
            ORIENTATION_OK BOOLEAN,
            ORIENTATION_STATUS TEXT
        ) LANGUAGE 'sql' COST 100 STABLE PARALLEL UNSAFE ROWS 1000 AS $$
        WITH
        p AS (SELECT unnest(p_providers) AS pid),
        d AS (SELECT unnest(p_dates)     AS dd),

        req AS (
            SELECT
                p.pid AS provider_id,
                d.dd AS d
            FROM p CROSS JOIN d
        ),

        tmp AS (
        SELECT DISTINCT ON (pa.provider_id, pa.date)
            pa.provider_id,
            pa.date,
            lower(pa.status::text) AS status,
            pa.shift_time,
            (
            SELECT bool_and(COALESCE((pa.shift_time ->> code) = 'true', FALSE))
            FROM unnest(ARRAY['A','D','E','N','P']::text[]) AS code
            ) AS all_true
        FROM provider_availability pa
        WHERE pa.availability_type = 'temporary'
            AND pa.provider_id = ANY(p_providers)
            AND pa.date        = ANY(p_dates)
        ORDER BY pa.provider_id, pa.date, pa.created_at DESC
        ),

        perm AS (
        SELECT DISTINCT ON (pa.provider_id, lower(pa.day::text))
            pa.provider_id,
            lower(pa.day::text) AS dow,
            lower(pa.status::text) AS status,
            pa.shift_time,
            (
            SELECT bool_and(COALESCE((pa.shift_time ->> code) = 'true', FALSE))
            FROM unnest(ARRAY['A','D','E','N','P']::text[]) AS code
            ) AS all_true
        FROM provider_availability pa
        WHERE pa.availability_type = 'permanent'
            AND pa.provider_id = ANY(p_providers)
        ORDER BY pa.provider_id, lower(pa.day::text), pa.created_at DESC
        ),

        prov AS (
        SELECT
            p.id AS provider_id,
            p.shift_time AS global_shift,
            CONCAT(p.first_name, ' ', p.last_name) AS name,
            p.profile_progress,
            CASE
                WHEN fp.dnr_at IS NOT NULL AND fp.self_dnr_at IS NOT NULL THEN 'dnr_both'
                WHEN fp.dnr_at IS NOT NULL THEN 'dnr'
                WHEN fp.self_dnr_at IS NOT NULL THEN 'self'
                ELSE NULL
            END AS flag
        FROM provider p
        LEFT JOIN facility_provider fp
        ON fp.provider_id = p.id AND fp.facility_id = p_facility
        WHERE p.id = ANY(p_providers)
        AND p.profile_status != 'deleted'
        AND p.deleted_at IS NULL
        ),

        -- NEW: latest orientation per provider for this facility
        orient AS (
        SELECT DISTINCT ON (po.provider_id)
            po.provider_id,
            po.status::text AS status
        FROM provider_orientation po
        WHERE po.provider_id = ANY(p_providers)
            AND po.facility_id = p_facility
        ORDER BY po.provider_id, po.created_at DESC
        ),

        decision AS (
            SELECT
                prov.name AS name,
                r.provider_id,
                r.d,
                get_shift_time_code(p_start, p_end, p_facility) AS time_code,
                COALESCE((prov.global_shift ->> get_shift_time_code(p_start, p_end, p_facility)) = 'true', FALSE) AS global_ok,

                CASE
                WHEN prov.profile_progress <> 100 THEN 'PROFILE_PROGRESS_INCOMPLETE'
                    WHEN prov.flag = 'dnr' THEN 'DNR'
                    WHEN prov.flag = 'self' THEN 'SELF'
                    WHEN prov.flag = 'dnr_both' THEN 'DNR_BOTH'
                    WHEN t.provider_id IS NOT NULL THEN 'TEMP'
                    WHEN pm.provider_id IS NOT NULL THEN 'PERM'
                    ELSE 'NONE'
                END AS profile_source,

                CASE
                    WHEN prov.profile_progress <> 100 THEN 'PROFILE_PROGRESS_INCOMPLETE'
                    WHEN prov.flag = 'dnr' THEN 'DNR'
                    WHEN prov.flag = 'self' THEN 'SELF'
                    WHEN prov.flag = 'dnr_both' THEN 'DNR_BOTH'
                    WHEN t.provider_id IS NOT NULL THEN
                        CASE
                            WHEN t.shift_time IS NULL THEN 'TEMP_NULL'
                            WHEN t.all_true IS TRUE   THEN 'TEMP_ALL_TRUE'
                            WHEN COALESCE((t.shift_time ->> get_shift_time_code(p_start, p_end, p_facility)) = 'true', FALSE) THEN 'TEMP_CODE_TRUE'
                            ELSE 'TEMP_DENY'
                        END
                    WHEN pm.provider_id IS NOT NULL THEN
                        CASE
                            WHEN pm.status <> 'active' THEN 'PERM_INACTIVE'
                            WHEN pm.shift_time IS NULL THEN 'PERM_NULL'
                            WHEN pm.all_true IS TRUE   THEN 'PERM_ALL_TRUE'
                            WHEN COALESCE((pm.shift_time ->> get_shift_time_code(p_start, p_end, p_facility)) = 'true', FALSE) THEN 'PERM_CODE_TRUE'
                            ELSE 'PERM_DENY'
                        END
                    ELSE
                        'DEFAULT_ALLOW'
                END AS profile_reason,

                    -- NEW: orientation fields
                    COALESCE( (o.status = 'completed' OR f.orientation_enabled = false), FALSE ) AS orientation_ok,
                    COALESCE( o.status, 'none') AS orientation_status
            FROM req r
            LEFT JOIN tmp  t  ON t.provider_id = r.provider_id AND t.date = r.d
            LEFT JOIN perm pm ON pm.provider_id = r.provider_id AND pm.dow = lower(to_char(r.d, 'FMDay'))
            LEFT JOIN prov     ON prov.provider_id = r.provider_id
            LEFT JOIN orient o ON o.provider_id   = r.provider_id
            LEFT JOIN facility f ON f.id = p_facility
        )

        SELECT
        name,
        provider_id,
        d,
        time_code,
        global_ok,
        CASE
            WHEN profile_reason IN ('TEMP_INACTIVE','TEMP_NULL','TEMP_DENY',
                                    'PERM_INACTIVE','PERM_NULL','PERM_DENY',
                                    'PROFILE_PROGRESS_INCOMPLETE','DNR','SELF','DNR_BOTH')
                 OR profile_source IN ('DNR','SELF','DNR_BOTH')
            THEN FALSE
            ELSE TRUE
        END AS profile_ok,
        profile_source,
        profile_reason,
        orientation_ok,
        orientation_status
        FROM decision;
        $$;
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS FN_AVAILABILITY_OF_STAFF_WITH_TEMP_PERM_MESSAGE`,
    );
  }
}
