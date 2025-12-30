-- Trigger: update_provider_analytics_trigger

-- DROP TRIGGER IF EXISTS update_provider_analytics_trigger ON public.shift;

CREATE TRIGGER update_provider_analytics_trigger
AFTER INSERT OR UPDATE ON shift
FOR EACH ROW
EXECUTE FUNCTION update_provider_analytics();
