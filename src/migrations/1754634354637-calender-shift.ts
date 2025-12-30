import { MigrationInterface, QueryRunner } from 'typeorm';

export class CalenderShift1754634354637 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION get_provider_shifts_for_month(
            provider_uuid UUID,
            facility_uuid UUID,
            start_date DATE,
            end_date DATE
        )
        RETURNS TABLE (
            "date" CHARACTER VARYING,
            shifts JSON
        )
        AS $$
        BEGIN
            RETURN QUERY
            WITH date_series AS (
                SELECT
                    GENERATE_SERIES(start_date, end_date, '1 day')::date AS "date"
            )
            SELECT
                ds.date::CHARACTER VARYING,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'id',
                            s.id,
                            'shift_id',
                            s.shift_id,
                            'start_time',
                            s.start_time,
                            'end_time',
                            s.end_time,
                            'is_orientation',
                            s.is_orientation,
                            'premium_rate',
                            s.premium_rate,
                            'status',
                            (CASE
                                WHEN pcs.id IS NOT NULL THEN 'cancelled'
                                ELSE s.status
                            END),
                            'certificate',
                            JSON_BUILD_OBJECT('id', c.id, 'name', c.name, 'abbreviation', c.abbreviation, 'text_color', c.text_color, 'background_color', c.background_color),
                            'speciality',
                            JSON_BUILD_OBJECT('id', sp.id, 'name', sp.name, 'abbreviation', sp.abbreviation, 'text_color', sp.text_color, 'background_color', sp.background_color),
                            'provider',
                            JSON_BUILD_OBJECT('id', p.id, 'name', p.first_name || ' ' || p.last_name, 'base_url', p.base_url, 'profile_image', p.profile_image)
                        )
                    ) FILTER (
                        WHERE
                            s.id IS NOT NULL
                    ),
                    '[]'
                ) AS shifts
            FROM
                date_series ds
                LEFT JOIN shift s ON date (s.start_date) = ds.date
                AND s.deleted_at IS NULL
                LEFT JOIN void_shift vs ON vs.shift_id = s.id
                AND vs.deleted_at IS NULL
                LEFT JOIN provider_cancelled_shift pcs ON pcs.shift_id = s.id
                AND pcs.deleted_at IS NULL
                LEFT JOIN certificate c ON s.certificate_id = c.id
                AND c.deleted_at IS NULL
                LEFT JOIN speciality sp ON s.speciality_id = sp.id
                AND sp.deleted_at IS NULL
                LEFT JOIN provider p ON (s.provider_id = p.id OR vs.provider_id = p.id OR pcs.provider_id = p.id)
            WHERE
                s.status IN ('scheduled', 'ongoing', 'completed', 'void', 'open', 'cancelled')
                AND s.facility_id = facility_uuid
                AND (
                    s.provider_id = provider_uuid
                    OR vs.provider_id = provider_uuid
                    OR pcs.provider_id = provider_uuid
                )
            GROUP BY
                ds.date
            ORDER BY
                ds.date;
        END;
        $$
        LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS get_provider_shifts_for_month`,
    );
  }
}
