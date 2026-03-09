
-- Auto-set owner_id on job_listings INSERT
CREATE OR REPLACE FUNCTION public.set_job_listing_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_job_listing_owner_trigger
  BEFORE INSERT ON public.job_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_listing_owner();
