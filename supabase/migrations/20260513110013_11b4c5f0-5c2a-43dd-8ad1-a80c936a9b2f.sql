-- Harden profile updates so regular users cannot bypass moderation or verification state.
CREATE OR REPLACE FUNCTION public.protect_profiles_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role'
     OR public.has_role(auth.uid(), 'helpadmin'::user_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.verified IS DISTINCT FROM OLD.verified
       OR NEW.account_blocked IS DISTINCT FROM OLD.account_blocked
       OR NEW.cancellation_count IS DISTINCT FROM OLD.cancellation_count THEN
      RAISE EXCEPTION 'Not allowed to modify protected profile fields directly';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profiles_sensitive_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_profiles_sensitive_fields_trg ON public.profiles;
CREATE TRIGGER protect_profiles_sensitive_fields_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profiles_sensitive_fields();

-- Keep the owner update policy explicit while trigger enforces column-level protection.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Harden payment methods so regular users cannot alter card metadata, method type, or ownership.
CREATE OR REPLACE FUNCTION public.protect_payment_methods_sensitive_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role'
     OR public.has_role(auth.uid(), 'helpadmin'::user_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.card_last_four IS NOT NULL OR NEW.card_brand IS NOT NULL THEN
      RAISE EXCEPTION 'Card metadata may only be inserted via secure backend';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.method_type IS DISTINCT FROM OLD.method_type
       OR NEW.card_last_four IS DISTINCT FROM OLD.card_last_four
       OR NEW.card_brand IS DISTINCT FROM OLD.card_brand THEN
      RAISE EXCEPTION 'Not allowed to modify protected payment method fields directly';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_payment_methods_sensitive_fields() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS protect_payment_methods_sensitive_fields_trg ON public.payment_methods;
CREATE TRIGGER protect_payment_methods_sensitive_fields_trg
BEFORE INSERT OR UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.protect_payment_methods_sensitive_fields();

DROP POLICY IF EXISTS "Users can toggle their payment method flags" ON public.payment_methods;
CREATE POLICY "Users can toggle their payment method flags"
ON public.payment_methods
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly deny regular-user updates to subscription flow rows; admin/service flows remain protected by existing admin policy and trigger.
DROP POLICY IF EXISTS "Block regular user_subscriptions_flow updates" ON public.user_subscriptions_flow;
CREATE POLICY "Block regular user_subscriptions_flow updates"
ON public.user_subscriptions_flow
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING ((current_setting('role', true) = 'service_role') OR public.has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK ((current_setting('role', true) = 'service_role') OR public.has_role(auth.uid(), 'helpadmin'::user_role));

-- Ensure the existing tier-protection trigger is installed if earlier migrations did not attach it.
DROP TRIGGER IF EXISTS protect_user_subscriptions_flow_tier ON public.user_subscriptions_flow;
CREATE TRIGGER protect_user_subscriptions_flow_tier
BEFORE INSERT OR UPDATE ON public.user_subscriptions_flow
FOR EACH ROW EXECUTE FUNCTION public.protect_user_subscriptions_flow_tier_fields();