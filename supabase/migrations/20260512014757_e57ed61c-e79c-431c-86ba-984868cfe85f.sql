
-- 1) Make admin-uploads bucket private
UPDATE storage.buckets SET public = false WHERE id = 'admin-uploads';

-- Add admin-only SELECT policy for admin-uploads (authenticated helpadmin only)
DROP POLICY IF EXISTS "admin_uploads_admin_select" ON storage.objects;
CREATE POLICY "admin_uploads_admin_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'helpadmin'::public.user_role));

DROP POLICY IF EXISTS "admin_uploads_admin_write" ON storage.objects;
CREATE POLICY "admin_uploads_admin_write"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'helpadmin'::public.user_role));

DROP POLICY IF EXISTS "admin_uploads_admin_update" ON storage.objects;
CREATE POLICY "admin_uploads_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'helpadmin'::public.user_role));

DROP POLICY IF EXISTS "admin_uploads_admin_delete" ON storage.objects;
CREATE POLICY "admin_uploads_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'helpadmin'::public.user_role));

-- 2) Tighten realtime broadcast policies: scope 'conversations' topic to participants
DROP POLICY IF EXISTS "Authenticated users can receive own conversation broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can receive own conversation broadcasts"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  (realtime.topic() LIKE 'messages-%' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = replace(realtime.topic(), 'messages-', '')
      AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
  ))
  OR (realtime.topic() LIKE 'conversation-%' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = replace(realtime.topic(), 'conversation-', '')
      AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
  ))
);

DROP POLICY IF EXISTS "Authenticated users can send own conversation broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can send own conversation broadcasts"
ON realtime.messages FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() LIKE 'messages-%' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = replace(realtime.topic(), 'messages-', '')
      AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
  ))
  OR (realtime.topic() LIKE 'conversation-%' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = replace(realtime.topic(), 'conversation-', '')
      AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
  ))
);

-- 3) Align failed_login_attempts admin SELECT to canonical has_role pattern
DROP POLICY IF EXISTS "Admins can view failed login attempts" ON public.failed_login_attempts;
CREATE POLICY "Admins can view failed login attempts"
ON public.failed_login_attempts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::public.user_role));

-- 4) Revoke EXECUTE from anon on SECURITY DEFINER functions that should require auth
REVOKE EXECUTE ON FUNCTION public.encrypt_sensitive_data(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decrypt_sensitive_data(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_user_type(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_payment_status(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.insert_bank_details(uuid, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.insert_bank_details_encrypted(uuid, text, text, text, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_bank_details_decrypted(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_user_subscription(uuid, uuid, text, timestamptz, timestamptz, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_security_event(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_security_event_enhanced(uuid, text, text, text, inet, text, boolean, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) FROM PUBLIC, anon;

-- Public profile/reviews remain executable by anon (intentionally public)
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_reviews(uuid, integer) TO anon, authenticated;
