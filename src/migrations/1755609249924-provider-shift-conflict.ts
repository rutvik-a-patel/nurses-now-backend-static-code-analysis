import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProviderShiftConflict1755609249924 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    -- FUNCTION: public.fn_conflicting_shifts_bulk(uuid[], uuid, date[], time without time zone, time without time zone)
    -- DROP FUNCTION IF EXISTS public.fn_conflicting_shifts_bulk(uuid[], uuid, date[], time without time zone, time without time zone);

        CREATE OR REPLACE FUNCTION public.fn_conflicting_shifts_bulk(
            p_providers uuid[],
            p_facility uuid,
            p_dates date[],
            p_start time without time zone,
            p_end time without time zone,
            p_exclude_shift uuid DEFAULT NULL)
            RETURNS TABLE(provider_id uuid, start_date date, start_time time without time zone, end_time time without time zone, facility_id uuid) 
            LANGUAGE 'sql'
            COST 100
            STABLE PARALLEL UNSAFE
            ROWS 1000

        AS $BODY$
        WITH req AS (
        SELECT d::date AS d FROM unnest(p_dates) AS d
        ),
        p AS (
        SELECT pid::uuid AS pid FROM unnest(p_providers) AS pid
        ),
        combos AS (
        SELECT p.pid, r.d
        FROM p CROSS JOIN req r
        ),
        -- request end handling: '00:00' means full-day end; subtract 1s (half-open)
        req_ts AS (
        SELECT
            c.pid,
            c.d,
            make_timestamp(EXTRACT(YEAR FROM c.d)::int, EXTRACT(MONTH FROM c.d)::int, EXTRACT(DAY FROM c.d)::int,
                        EXTRACT(HOUR FROM p_start)::int, EXTRACT(MINUTE FROM p_start)::int, 0)  AS req_start_ts,
            make_timestamp(EXTRACT(YEAR FROM c.d)::int, EXTRACT(MONTH FROM c.d)::int, EXTRACT(DAY FROM c.d)::int,
                        EXTRACT(HOUR FROM CASE WHEN p_end = time '00:00' THEN time '23:59:59' ELSE p_end END)::int,
                        EXTRACT(MINUTE FROM CASE WHEN p_end = time '00:00' THEN time '23:59:59' ELSE p_end END)::int,
                        EXTRACT(SECOND FROM CASE WHEN p_end = time '00:00' THEN time '23:59:59' ELSE p_end END)::int) AS req_end_ts
        FROM combos c
        ),
        shifts AS (
        SELECT
            s.provider_id,
            s.start_date,
            s.start_time,
            CASE WHEN s.end_time = time '00:00' THEN time '23:59:59' ELSE s.end_time END AS end_time,
            s.facility_id
        FROM shift s
        JOIN p   ON s.provider_id = p.pid
        JOIN req ON s.start_date  = req.d
        WHERE s.status IN ('scheduled','ongoing')
        AND (p_exclude_shift IS NULL OR s.id != p_exclude_shift)
        ),
        calc AS (
        SELECT
            s.provider_id,
            s.start_date,
            s.start_time,
            s.end_time,
            s.facility_id,
            make_timestamp(EXTRACT(YEAR FROM s.start_date)::int, EXTRACT(MONTH FROM s.start_date)::int, EXTRACT(DAY FROM s.start_date)::int,
                        EXTRACT(HOUR FROM s.start_time)::int, EXTRACT(MINUTE FROM s.start_time)::int, EXTRACT(SECOND FROM s.start_time)::int) AS shift_start_ts,
            make_timestamp(EXTRACT(YEAR FROM s.start_date)::int, EXTRACT(MONTH FROM s.start_date)::int, EXTRACT(DAY FROM s.start_date)::int,
                        EXTRACT(HOUR FROM s.end_time)::int,   EXTRACT(MINUTE FROM s.end_time)::int,   EXTRACT(SECOND FROM s.end_time)::int)   AS shift_end_ts
        FROM shifts s
        ),
        -- apply +1h buffer to shift_end when facility differs
        calc2 AS (
        SELECT
            c2.*,
            CASE WHEN c2.facility_id <> p_facility THEN c2.shift_end_ts + interval '1 hour'
                ELSE c2.shift_end_ts
            END AS shift_buffer_end_ts
        FROM calc c2
        ),
        conflicts AS (
        SELECT
            c.provider_id,
            c.start_date,
            c.start_time,
            c.end_time,
            c.facility_id
        FROM calc2 c
        JOIN req_ts r
            ON r.pid = c.provider_id AND r.d = c.start_date
        WHERE
            r.req_start_ts < c.shift_buffer_end_ts   -- request starts before (end + buffer)
            AND
            r.req_end_ts   > c.shift_start_ts        -- request ends after shift start
        )
        SELECT * FROM conflicts;
        $BODY$;

        ALTER FUNCTION public.fn_conflicting_shifts_bulk(uuid[], uuid, date[], time without time zone, time without time zone)
            OWNER TO postgres;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.fn_conflicting_shifts_bulk`,
    );
  }
}
