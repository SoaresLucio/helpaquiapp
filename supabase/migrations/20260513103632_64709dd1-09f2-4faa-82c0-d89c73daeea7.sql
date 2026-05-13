
-- 1. payment_methods: prevent users from modifying sensitive card display fields.
-- Replace user UPDATE policy with one that allows only toggling is_default/is_active.
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;

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

  IF TG_OP = 'UPDATE' THEN
    IF NEW.card_last_four IS DISTINCT FROM OLD.card_last_four
       OR NEW.card_brand IS DISTINCT FROM OLD.card_brand
       OR NEW.method_type IS DISTINCT FROM OLD.method_type
       OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      RAISE EXCEPTION 'Not allowed to modify card display fields directly';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Users may not self-register card display values; only service_role/admin can.
    IF NEW.card_last_four IS NOT NULL OR NEW.card_brand IS NOT NULL THEN
      RAISE EXCEPTION 'Card metadata may only be inserted via secure backend';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_payment_methods_sensitive_fields_trg ON public.payment_methods;
CREATE TRIGGER protect_payment_methods_sensitive_fields_trg
BEFORE INSERT OR UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.protect_payment_methods_sensitive_fields();

CREATE POLICY "Users can toggle their payment method flags"
ON public.payment_methods
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Remove support_messages and support_tickets from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.support_tickets;

-- 3. user_subscriptions_flow: explicit restrictive INSERT to deny non-admin/non-service_role
CREATE POLICY "Block non-admin user_subscriptions_flow inserts"
ON public.user_subscriptions_flow
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  current_setting('role', true) = 'service_role'
  OR public.has_role(auth.uid(), 'helpadmin'::user_role)
);

-- 4. ai_support_messages: explicit restrictive no-update/delete
CREATE POLICY "No updates to ai_support_messages"
ON public.ai_support_messages
AS RESTRICTIVE
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "No deletes to ai_support_messages"
ON public.ai_support_messages
AS RESTRICTIVE
FOR DELETE
TO authenticated, anon
USING (false);

-- 5. freelancer_service_offers: restrict to authenticated users only
DROP POLICY IF EXISTS "Users can view active service offers" ON public.freelancer_service_offers;
DROP POLICY IF EXISTS "Authenticated users can view active offers" ON public.freelancer_service_offers;
-- "Authenticated users can view active freelancer offers" already exists for authenticated role
