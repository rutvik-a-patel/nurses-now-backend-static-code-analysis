-- Trigger: after_provider_create

-- DROP TRIGGER IF EXISTS after_provider_create ON public."provider";

CREATE OR REPLACE TRIGGER after_provider_create
    AFTER INSERT
    ON public."provider"
    FOR EACH ROW
    EXECUTE FUNCTION public.after_provider_create();