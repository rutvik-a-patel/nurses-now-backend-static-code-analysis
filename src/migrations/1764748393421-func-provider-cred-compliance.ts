import { MigrationInterface, QueryRunner } from 'typeorm';

export class FuncProviderCredCompliance1764748393421
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS fn_check_provider_credentials(UUID[], UUID);
            CREATE OR REPLACE FUNCTION fn_check_provider_credentials(
                p_provider_ids UUID[],
                p_facility_id  UUID
            )
            RETURNS TABLE (
                status TEXT,
                staff TEXT,
                credential TEXT
            )
            LANGUAGE plpgsql
            AS $$
            DECLARE
                v_today DATE;
            BEGIN
                -- Get facility local date
                SELECT (CURRENT_TIMESTAMP AT TIME ZONE f.timezone)::date
                INTO v_today
                FROM facility f
                WHERE f.id = p_facility_id;

                RETURN QUERY
                WITH provider_list AS (
                    SELECT unnest(p_provider_ids) AS provider_id
                ),

                latest_credentials AS (
                    SELECT DISTINCT ON (pc.provider_id, pc.credential_id)
                        pc.provider_id,
                        pc.credential_id,
                        pc.expiry_date,
                        c.validate,
                        c.name AS credential_name,
                        CONCAT(p.first_name, ' ', p.last_name) AS provider_name
                    FROM provider_credential pc
                    JOIN credentials c ON c.id = pc.credential_id
                    JOIN provider p ON p.id = pc.provider_id
                    JOIN provider_list pl ON pl.provider_id = pc.provider_id
                    WHERE pc.is_other = false
                    ORDER BY pc.provider_id, pc.credential_id, pc.created_at DESC
                ),

                evaluated AS (
                    SELECT
                        lc.provider_id,
                        (
                            CASE
                                WHEN lc.expiry_date < v_today AND lc.validate = 'warn' THEN 'warn'
                                WHEN lc.expiry_date < v_today AND lc.validate = 'refuse' THEN 'refuse'
                                ELSE 'none'
                            END
                        )::TEXT AS status,
                        lc.provider_name::TEXT AS staff,
                        lc.credential_name::TEXT AS credential
                    FROM latest_credentials lc
                )
            -- RETURN
                SELECT
                    e.status,
                    e.staff,
                    e.credential
                FROM evaluated e
                WHERE e.status <> 'none';
            END;
            $$;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP FUNCTION IF EXISTS fn_check_provider_credentials(UUID[], UUID);
        `);
  }
}
