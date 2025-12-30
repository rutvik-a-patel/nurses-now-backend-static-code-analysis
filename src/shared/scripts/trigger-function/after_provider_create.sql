-- FUNCTION: public.after_provider_create()

-- DROP FUNCTION IF EXISTS public.after_provider_create();

CREATE OR REPLACE FUNCTION public.after_provider_create()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
BEGIN
  INSERT INTO provider_analytics (
    id,
    provider_id,
    created_at,
    updated_at
  )
  VALUES (
      uuid_generate_v4(),
      NEW.id,
      NOW(),
      NOW()
  );
  RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.after_provider_create()
    OWNER TO postgres;
