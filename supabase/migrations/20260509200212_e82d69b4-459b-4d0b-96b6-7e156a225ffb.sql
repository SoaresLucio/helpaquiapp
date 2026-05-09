
-- Drop the buggy policy
DROP POLICY IF EXISTS "Users update own subscription flow non-tier fields" ON public.user_subscriptions_flow;

-- Restore simple owner update policy
CREATE POLICY "Users can update their own subscription flow"
ON public.user_subscriptions_flow
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger that blocks tier-field changes unless caller is service_role or helpadmin
CREATE OR REPLACE FUNCTION public.protect_user_subscriptions_flow_tier_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role'
     OR public.has_role(auth.uid(), 'helpadmin'::user_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.plan_name IS DISTINCT FROM OLD.plan_name
     OR NEW.plan_price IS DISTINCT FROM OLD.plan_price
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.end_date IS DISTINCT FROM OLD.end_date
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to modify subscription tier fields';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_subscriptions_flow_tier ON public.user_subscriptions_flow;
CREATE TRIGGER protect_user_subscriptions_flow_tier
BEFORE UPDATE ON public.user_subscriptions_flow
FOR EACH ROW
EXECUTE FUNCTION public.protect_user_subscriptions_flow_tier_fields();
