
-- Fix 1: Replace bypassable current_setting('role') with auth.jwt() role check
CREATE OR REPLACE FUNCTION public.protect_user_subscriptions_flow_tier_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
     OR public.has_role(auth.uid(), 'helpadmin'::user_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
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

CREATE OR REPLACE FUNCTION public.protect_payment_methods_sensitive_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
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
$function$;

CREATE OR REPLACE FUNCTION public.protect_profiles_sensitive_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
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
$function$;

-- Fix 2: Revoke EXECUTE on SECURITY DEFINER functions from anon (require authentication)
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_public_reviews(uuid, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_public_reviews(uuid, integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, user_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, user_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_has_role(text[]) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_has_role(text[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.can_create_request() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_create_request() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.user_owns_job_listing(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.user_owns_job_listing(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.increment_cancellation_count(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.increment_cancellation_count(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.mark_service_completed(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.mark_service_completed(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.respond_to_hire_proposal(uuid, boolean, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.respond_to_hire_proposal(uuid, boolean, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_release_payment(uuid, boolean, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_release_payment(uuid, boolean, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_all_users_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_bank_details_decrypted(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_bank_details_decrypted(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.insert_bank_details(uuid, text, text, text, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.insert_bank_details(uuid, text, text, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.insert_bank_details_encrypted(uuid, text, text, text, text, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.insert_bank_details_encrypted(uuid, text, text, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_user_subscription(uuid, uuid, text, timestamptz, timestamptz, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.update_user_subscription(uuid, uuid, text, timestamptz, timestamptz, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.encrypt_sensitive_data(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.decrypt_sensitive_data(text) FROM anon, public;

REVOKE EXECUTE ON FUNCTION public.log_security_event(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.log_security_event(uuid, text, text, text, inet, text, boolean, text, jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, text, text, inet, text, boolean, text, jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) TO authenticated;
