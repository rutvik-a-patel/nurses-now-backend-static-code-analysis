-- SEQUENCE: public.shift_time_number_seq

-- DROP SEQUENCE IF EXISTS public.shift_time_number_seq;

CREATE SEQUENCE IF NOT EXISTS public.shift_time_number_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.shift_time_number_seq
    OWNER TO postgres;

-- FUNCTION: public.generate_unique_shift_time_id()

-- DROP FUNCTION IF EXISTS public.generate_unique_shift_time_id();

CREATE OR REPLACE FUNCTION public.generate_unique_shift_time_id()
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    timestamp_part TEXT;
    random_part TEXT;
    new_shift_time_id TEXT;
BEGIN
    LOOP
        -- Generate shift_time number
        timestamp_part := to_char(CURRENT_TIMESTAMP, 'MMYY');
        random_part := nextval('shift_time_number_seq')::TEXT;
        -- Apply padding only if the sequence number is less than 1000
        IF CAST(random_part AS INTEGER) < 1000 THEN
            random_part := LPAD(random_part, 4, '0');
        END IF;
        new_shift_time_id := random_part;

        -- Check if the generated number already exists in the table
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM facility_shift_setting WHERE shift_time_id::text = new_shift_time_id::text
        );
    END LOOP;

    RETURN new_shift_time_id;
END;
$BODY$;

ALTER FUNCTION public.generate_unique_shift_time_id()
    OWNER TO postgres;
