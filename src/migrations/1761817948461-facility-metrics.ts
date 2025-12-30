import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacilityMetrics1761817948461 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
           CREATE OR REPLACE FUNCTION get_facility_shift_metrics (
                ARG_FACILITY_ID UUID,
                ARG_START_DATE DATE DEFAULT NULL,
                ARG_END_DATE DATE DEFAULT NULL
            ) RETURNS JSONB AS $$
            DECLARE
                result JSONB;
            BEGIN
                WITH shifts AS (
                    SELECT
                        s.id AS shift_id,
                        s.facility_id,
                        s.provider_id,
                        s.status,
                        s.start_date,
                        s.start_time,
                        s.cancelled_on,
                        c.id AS cert_id,
                        c.name AS cert_name,
                        c.abbreviation AS cert_abbr,
                        NULLIF(BTRIM(f.timezone), '') AS timezone,
                        s.temp_conf_at
                    FROM shift s
                    LEFT JOIN provider p ON p.id = s.provider_id
                    LEFT JOIN certificate c ON c.id = s.certificate_id
                    LEFT JOIN facility f ON f.id = s.facility_id
                    WHERE s.facility_id = arg_facility_id
                    AND s.deleted_at IS NULL
                    AND (arg_start_date IS NULL OR s.start_date::date >= arg_start_date)
                    AND (arg_end_date IS NULL OR s.start_date::date <= arg_end_date)
                ),
                totals AS (
                    SELECT COUNT(*) AS total_shifts FROM shifts
                ),
                per_license AS (
                    SELECT
                        s.cert_id,
                        COALESCE(s.cert_name, 'Unknown') AS cert_name,
                        COALESCE(s.cert_abbr, 'N/A') AS cert_abbr,

                        COUNT(DISTINCT s.provider_id) FILTER (WHERE s.status IN ('completed')) AS staff_count,
                        COUNT(*) AS entered_shift,
                        COUNT(*) FILTER (WHERE s.status IN ('scheduled','running_late')) AS filled_shifts,
                        COUNT(*) FILTER (WHERE s.status IN ('completed')) AS completed_shifts,
                        COUNT(*) FILTER (WHERE s.status = 'cancelled' AND s.temp_conf_at IS NOT NULL) AS booked_cancel,

                        -- Defensive: only use tz if it's valid; else fallback to UTC
                        COUNT(*) FILTER (
                            WHERE s.status = 'cancelled'
                            AND s.temp_conf_at IS NOT NULL
                            AND (
                                CASE
                                    WHEN s.timezone IS NOT NULL
                                        AND EXISTS (SELECT 1 FROM pg_timezone_names tzn WHERE tzn.name = s.timezone)
                                    THEN s.cancelled_on AT TIME ZONE s.timezone
                                    ELSE s.cancelled_on AT TIME ZONE 'UTC'
                                END
                            ) BETWEEN (s.start_date + s.start_time - INTERVAL '4 hours')
                                    AND   (s.start_date + s.start_time + INTERVAL '4 hours')
                        ) AS booked_cancel_4hr,

                    -- Rounded Cancel Rate
                        TO_CHAR(
                            ROUND(
                                COALESCE(
                                    CASE
                                        WHEN COUNT(*) FILTER (WHERE s.status IN ('scheduled','cancelled')) = 0 THEN 0
                                        ELSE (
                                            COUNT(*) FILTER (WHERE s.status = 'cancelled' AND s.temp_conf_at IS NOT NULL)::NUMERIC /
                                            NULLIF(COUNT(*) FILTER (WHERE s.status IN ('cancelled','scheduled','completed') AND s.temp_conf_at IS NOT NULL), 0)
                                        ) * 100
                                    END, 0
                                ), 0
                            ),
                            'FM9999990"%"'
                        ) AS cancel_rate,

                        -- Rounded Fill Rate
                        TO_CHAR(
                            ROUND(
                                COALESCE(
                                    CASE
                                        WHEN COUNT(*) FILTER (WHERE s.status IN ('open', 'requested', 'invite_sent', 'auto_scheduling', 'scheduled')) = 0 THEN 0
                                        ELSE (
                                            COUNT(*) FILTER (WHERE s.status IN ('scheduled','completed'))::NUMERIC /
                                            NULLIF(COUNT(*) FILTER (WHERE s.status IN ('open', 'requested', 'invite_sent', 'auto_scheduling', 'scheduled','completed'))::NUMERIC, 0)
                                        ) * 100
                                    END, 0
                                ), 0
                            ),
                            'FM9999990"%"'
                        ) AS fill_rate



                    FROM shifts s
                    GROUP BY s.cert_id, s.cert_name, s.cert_abbr
                )
                SELECT JSONB_BUILD_OBJECT(
                    'total_shifts', (SELECT total_shifts FROM totals),
                    'staff', COALESCE((
                        SELECT JSONB_AGG(
                            JSONB_BUILD_OBJECT(
                                'certificate_id', pl.cert_id,
                                'cert_name', pl.cert_name,
                                'cert_abbr', pl.cert_abbr,
                                'staff_count', pl.staff_count,
                                'entered_shifts', pl.entered_shift,
                                'filled_shifts', pl.filled_shifts,
                                'completed_shifts', pl.completed_shifts,
                                'booked_cancel', pl.booked_cancel,
                                'booked_cancel_4hr', pl.booked_cancel_4hr,
                                'cancellation_rate', pl.cancel_rate,
                                'fill_rate', pl.fill_rate
                            )
                        )
                        FROM per_license pl
                    ), '[]'::jsonb)
                )
                INTO result;

                RETURN result;
            END;
            $$ LANGUAGE PLPGSQL;

    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                DROP FUNCTION IF EXISTS get_facility_shift_metrics(UUID, DATE, DATE);
            `);
  }
}
