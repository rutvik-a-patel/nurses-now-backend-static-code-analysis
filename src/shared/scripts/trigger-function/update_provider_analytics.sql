-- FUNCTION: public.update_provider_analytics()
-- DROP FUNCTION IF EXISTS public.update_provider_analytics();
CREATE OR REPLACE FUNCTION public.update_provider_analytics () RETURNS trigger LANGUAGE 'plpgsql' COST 100 VOLATILE NOT LEAKPROOF AS $BODY$
DECLARE 
    total_shift_count INTEGER;
    shift_attended_count INTEGER;
    on_time_check_in_count INTEGER;
    on_time_rate_percentage NUMERIC;
    late_shift_percentage NUMERIC;
    late_shift_count INTEGER;
BEGIN
    IF NEW.provider_id IS NOT NULL THEN
        SELECT COUNT(s.id)::INTEGER
        INTO total_shift_count
        FROM shift s
        WHERE s.provider_id = NEW.provider_id AND s.is_orientation = false;

        SELECT COUNT(s.id)::INTEGER
        INTO shift_attended_count
        FROM shift s
        WHERE s.provider_id = NEW.provider_id
          AND s.status IN ('completed', 'un_submitted')
		  AND s.is_orientation = false;

        SELECT COUNT(s.id) FILTER (
            WHERE s.clock_in BETWEEN s.start_time - INTERVAL '10 minutes'
                              AND s.start_time + INTERVAL '10 minutes'
        )
        INTO on_time_check_in_count
        FROM shift s
        WHERE s.provider_id = NEW.provider_id
          AND s.status IN ('completed', 'un_submitted')
		  AND s.is_orientation = false;

        SELECT CASE
            WHEN COUNT(s.id) = 0 THEN 0
            ELSE (
                COUNT(s.id) FILTER (WHERE s.clock_in > s.start_time + INTERVAL '10 minutes')::FLOAT
                / COUNT(s.id)::FLOAT
            ) * 100
        END::NUMERIC
        INTO late_shift_percentage
        FROM shift s
        WHERE s.provider_id = NEW.provider_id
          AND s.status IN ('completed', 'un_submitted')
		  AND s.is_orientation = false;

        SELECT COUNT(s.id) FILTER (
            WHERE s.clock_in > s.start_time + INTERVAL '10 minutes'
        )::INTEGER
        INTO late_shift_count
        FROM shift s
        WHERE s.provider_id = NEW.provider_id
          AND s.status IN ('completed', 'un_submitted')
		  AND s.is_orientation = false;

        SELECT CASE
            WHEN COUNT(s.id) = 0 THEN 0
            ELSE (
                COUNT(s.id) FILTER (
                    WHERE (s.clock_in_date + s.clock_in) > 
                          (s.start_date + s.start_time + INTERVAL '10 minutes')
                )::FLOAT
                / COUNT(s.id)::FLOAT
            ) * 100
        END::NUMERIC
        INTO on_time_rate_percentage
        FROM shift s
        WHERE s.provider_id = NEW.provider_id
          AND s.status IN ('completed', 'un_submitted')
		  AND s.is_orientation = false;

        -- Update total_shift
        UPDATE provider_analytics
        SET total_shift = total_shift_count,
            shift_attended = shift_attended_count,
            on_time_check_in = on_time_check_in_count,
            on_time_rate = ROUND(on_time_rate_percentage, 2)::DOUBLE PRECISION,
            late_shift_ratio = ROUND(late_shift_percentage, 2)::DOUBLE PRECISION,
            late_shift = late_shift_count,
            attendance_score = (
                ROUND(
                    (
                        CASE
                            WHEN total_shift_count = 0 THEN 0
                            ELSE (shift_attended_count::FLOAT / total_shift_count::FLOAT) * 100
                        END
                    )::NUMERIC, 2
                )
            )::DOUBLE PRECISION
        WHERE provider_id = NEW.provider_id;

        INSERT INTO provider_late_shift (shift_id, provider_id)
SELECT NEW.id, NEW.provider_id
WHERE NEW.clock_in > NEW.start_time + INTERVAL '10 minutes'
ON CONFLICT (shift_id, provider_id) DO NOTHING;

    END IF;

    RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.update_provider_analytics () OWNER TO postgres;