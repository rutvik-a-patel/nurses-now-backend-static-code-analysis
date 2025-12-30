-- SEQUENCE: public.document_number_seq

-- DROP SEQUENCE IF EXISTS public.document_number_seq;

CREATE SEQUENCE IF NOT EXISTS public.document_number_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    CACHE 1;

ALTER SEQUENCE public.document_number_seq
    OWNER TO postgres;

-- FUNCTION: public.generate_unique_document_id()

-- DROP FUNCTION IF EXISTS public.generate_unique_document_id();

CREATE OR REPLACE FUNCTION public.generate_unique_document_id()
    RETURNS text
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
DECLARE
    timestamp_part TEXT;
    random_part TEXT;
    new_document_id TEXT;
BEGIN
    LOOP
        -- Generate document number
        timestamp_part := to_char(CURRENT_TIMESTAMP, 'MMYY');
        random_part := nextval('document_number_seq')::TEXT;
        -- Apply padding only if the sequence number is less than 1000
        IF CAST(random_part AS INTEGER) < 100000 THEN
            random_part := LPAD(random_part, 6, '0');
        END IF;
        new_document_id := random_part;

        -- Check if the generated number already exists in the table
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM provider_credential WHERE document_id::text = new_document_id::text
        );
    END LOOP;

    RETURN new_document_id;
END;
$BODY$;

ALTER FUNCTION public.generate_unique_document_id()
    OWNER TO postgres;
