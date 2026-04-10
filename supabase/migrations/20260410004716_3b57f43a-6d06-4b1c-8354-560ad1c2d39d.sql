
-- Fix 1: Prevent non-admins from setting is_admin=true on support_messages
CREATE POLICY "Non-admins cannot claim is_admin"
ON public.support_messages
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  is_admin = false
  OR has_role(auth.uid(), 'helpadmin'::user_role)
);

-- Fix 2: Restrict failed_login_attempts inserts to service_role only
DROP POLICY IF EXISTS "Service role can insert failed login attempts" ON public.failed_login_attempts;

CREATE POLICY "Service role inserts only"
ON public.failed_login_attempts
FOR INSERT
TO service_role
WITH CHECK (true);
