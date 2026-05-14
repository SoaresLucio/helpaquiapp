-- 1. Bloquear leitura direta de colunas de localização precisa em service_requests
-- Forçar uso do RPC get_service_request_precise_location
REVOKE SELECT (location_lat, location_lng, location_address) ON public.service_requests FROM authenticated;
REVOKE SELECT (location_lat, location_lng, location_address) ON public.service_requests FROM anon;

-- 2. security_audit_log: vincular SELECT a {authenticated}
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.security_audit_log;
CREATE POLICY "Users can view their own audit logs"
  ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Revogar EXECUTE em funções SECURITY DEFINER administrativas / internas
-- (mantém: respond_to_hire_proposal, mark_service_completed, can_create_request,
--  get_public_profile, get_public_reviews, get_service_request_precise_location,
--  has_role, check_rate_limit, insert_bank_details*, get_bank_details_decrypted,
--  check_request_limit, check_message_limit — chamadas pelo app autenticado)
REVOKE EXECUTE ON FUNCTION public.encrypt_sensitive_data(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrypt_sensitive_data(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_security_event(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_release_payment(uuid, boolean, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_has_role(text[]) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_user_subscription(uuid, uuid, text, timestamptz, timestamptz, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_cancellation_count(uuid) FROM PUBLIC, anon, authenticated;

-- Garantir que as funções de admin continuam executáveis pelo service_role (já é por default no Supabase, mas explícito)
GRANT EXECUTE ON FUNCTION public.admin_release_payment(uuid, boolean, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_all_users_admin() TO service_role;