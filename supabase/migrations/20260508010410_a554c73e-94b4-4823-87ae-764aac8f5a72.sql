
-- 1) Revoke EXECUTE from anon/public on sensitive SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.encrypt_sensitive_data(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.decrypt_sensitive_data(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.update_user_subscription(uuid, uuid, text, timestamptz, timestamptz, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_security_event(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.insert_bank_details(uuid, text, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.insert_bank_details_encrypted(uuid, text, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_bank_details_decrypted(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM anon, public;

-- Ensure authenticated still can call those that need it
GRANT EXECUTE ON FUNCTION public.get_all_users_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_bank_details_decrypted(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_bank_details_encrypted(uuid, text, text, text, text, text) TO authenticated;

-- 2) Realtime channel authorization: require authenticated users to subscribe
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_can_receive_broadcast" ON realtime.messages;
CREATE POLICY "authenticated_can_receive_broadcast"
ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_can_send_broadcast" ON realtime.messages;
CREATE POLICY "authenticated_can_send_broadcast"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);
