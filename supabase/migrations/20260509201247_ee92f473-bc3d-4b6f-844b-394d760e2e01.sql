
-- 1. Drop broadcast catch-all policies on public.messages
DROP POLICY IF EXISTS authenticated_can_receive_broadcast ON public.messages;
DROP POLICY IF EXISTS authenticated_can_send_broadcast ON public.messages;

-- 2. job_applications: add RESTRICTIVE policy to enforce email match on writes
DROP POLICY IF EXISTS "Restrict job_applications writes to candidate" ON public.job_applications;
CREATE POLICY "Restrict job_applications writes to candidate"
ON public.job_applications
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  OR public.user_owns_job_listing(job_listing_id)
  OR public.has_role(auth.uid(), 'helpadmin'::user_role)
)
WITH CHECK (
  candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- 3. user_subscriptions_flow: extend trigger to also block INSERT of paid plans by users
CREATE OR REPLACE FUNCTION public.protect_user_subscriptions_flow_tier_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('role', true) = 'service_role'
     OR public.has_role(auth.uid(), 'helpadmin'::user_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Users may only insert their own free baseline row
    IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
      RAISE EXCEPTION 'Cannot create subscription for another user';
    END IF;
    IF COALESCE(NEW.plan_price, 0) <> 0
       OR COALESCE(NEW.status, 'inactive') NOT IN ('inactive','free','trial') THEN
      RAISE EXCEPTION 'Not allowed to self-assign paid subscription tier';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.plan_name IS DISTINCT FROM OLD.plan_name
       OR NEW.plan_price IS DISTINCT FROM OLD.plan_price
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.end_date IS DISTINCT FROM OLD.end_date
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Not allowed to modify subscription tier fields';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS protect_user_subscriptions_flow_tier ON public.user_subscriptions_flow;
CREATE TRIGGER protect_user_subscriptions_flow_tier
BEFORE INSERT OR UPDATE ON public.user_subscriptions_flow
FOR EACH ROW
EXECUTE FUNCTION public.protect_user_subscriptions_flow_tier_fields();
