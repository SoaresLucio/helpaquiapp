
-- 1) ai_support_messages: bind to authenticated only
DROP POLICY IF EXISTS "Users can create AI messages" ON public.ai_support_messages;
DROP POLICY IF EXISTS "Users can view their own AI messages" ON public.ai_support_messages;
DROP POLICY IF EXISTS "Admins can view all AI messages" ON public.ai_support_messages;

CREATE POLICY "Users can create AI messages"
ON public.ai_support_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND conversation_id IN (
    SELECT id FROM public.ai_support_conversations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own AI messages"
ON public.ai_support_messages FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND conversation_id IN (
    SELECT id FROM public.ai_support_conversations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all AI messages"
ON public.ai_support_messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role));

-- Same for ai_support_conversations
DROP POLICY IF EXISTS "Users can create AI conversations" ON public.ai_support_conversations;
DROP POLICY IF EXISTS "Users can view their own AI conversations" ON public.ai_support_conversations;
DROP POLICY IF EXISTS "Admins can view all AI conversations" ON public.ai_support_conversations;

CREATE POLICY "Users can create AI conversations"
ON public.ai_support_conversations FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can view their own AI conversations"
ON public.ai_support_conversations FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Admins can view all AI conversations"
ON public.ai_support_conversations FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role));

-- 2) freelancer_offers: rebind to authenticated, add NOT NULL guards
DROP POLICY IF EXISTS "Freelancers can manage their own offers" ON public.freelancer_offers;
DROP POLICY IF EXISTS "Request owners can view offers on their requests" ON public.freelancer_offers;

CREATE POLICY "Freelancers can manage their own offers"
ON public.freelancer_offers FOR ALL TO authenticated
USING (auth.uid() IS NOT NULL AND auth.uid() = freelancer_id)
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = freelancer_id);

CREATE POLICY "Request owners can view offers on their requests"
ON public.freelancer_offers FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.service_requests sr
    WHERE sr.id = freelancer_offers.service_request_id
      AND sr.client_id = auth.uid()
  )
);

-- Block anon explicitly
CREATE POLICY "Deny anon access to freelancer_offers"
ON public.freelancer_offers AS RESTRICTIVE FOR ALL TO anon
USING (false) WITH CHECK (false);

-- 3) payment_logs: deny anon, restrict insert to admins only
DROP POLICY IF EXISTS "Users can view payment logs" ON public.payment_logs;
DROP POLICY IF EXISTS "Users can view relevant payment logs" ON public.payment_logs;

CREATE POLICY "Users can view their payment logs"
ON public.payment_logs FOR SELECT TO authenticated
USING (
  auth.uid() IS NOT NULL
  AND payment_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = payment_logs.payment_id
      AND (p.client_id = auth.uid() OR p.freelancer_id = auth.uid())
  )
);

CREATE POLICY "Deny anon access to payment_logs"
ON public.payment_logs AS RESTRICTIVE FOR ALL TO anon
USING (false) WITH CHECK (false);

CREATE POLICY "Block direct inserts on payment_logs"
ON public.payment_logs AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'helpadmin'::user_role));

-- 4) Revoke EXECUTE on sensitive SECURITY DEFINER functions from anon
REVOKE EXECUTE ON FUNCTION public.notify_freelancer_of_hire(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.respond_to_hire_proposal(uuid, boolean, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.mark_service_completed(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.increment_cancellation_count(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.insert_bank_details(uuid, text, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.insert_bank_details_encrypted(uuid, text, text, text, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_bank_details_decrypted(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_release_payment(uuid, boolean, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_public_profile(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_public_reviews(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_user_subscription(uuid, uuid, text, timestamptz, timestamptz, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.encrypt_sensitive_data(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.decrypt_sensitive_data(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.log_security_event(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM anon;

-- Grant to authenticated where appropriate
GRANT EXECUTE ON FUNCTION public.notify_freelancer_of_hire(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_hire_proposal(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_service_completed(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_cancellation_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_bank_details(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.insert_bank_details_encrypted(uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_bank_details_decrypted(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_reviews(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event(uuid, text, text, text, inet, text, boolean, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, text, text, inet, text, boolean, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_release_payment(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_admin() TO authenticated;
