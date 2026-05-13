-- 1) Fix subscription flow restrictive policies: replace bypassable current_setting('role')
--    with auth.jwt()->>'role' check (matches our hard rule and trigger guards).
DROP POLICY IF EXISTS "Block non-admin user_subscriptions_flow inserts" ON public.user_subscriptions_flow;
CREATE POLICY "Block non-admin user_subscriptions_flow inserts"
ON public.user_subscriptions_flow
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (
  COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
  OR public.has_role(auth.uid(), 'helpadmin'::user_role)
  OR (
    user_id = auth.uid()
    AND COALESCE(plan_price, 0) = 0
    AND COALESCE(status, 'inactive') IN ('inactive','free','trial')
  )
);

DROP POLICY IF EXISTS "Block regular user_subscriptions_flow updates" ON public.user_subscriptions_flow;
CREATE POLICY "Block regular user_subscriptions_flow updates"
ON public.user_subscriptions_flow
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
  OR public.has_role(auth.uid(), 'helpadmin'::user_role)
  OR user_id = auth.uid()
)
WITH CHECK (
  COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
  OR public.has_role(auth.uid(), 'helpadmin'::user_role)
  OR user_id = auth.uid()
);

-- 2) empresa_profiles: scope ALL policy to authenticated only (was {public})
DROP POLICY IF EXISTS "Users can manage their own empresa profile" ON public.empresa_profiles;
CREATE POLICY "Users can manage their own empresa profile"
ON public.empresa_profiles
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3) service_requests: collapse duplicate UPDATE policies and bind to authenticated only
DROP POLICY IF EXISTS "Clients can update own requests" ON public.service_requests;
DROP POLICY IF EXISTS "Clients can update their own requests" ON public.service_requests;
CREATE POLICY "Clients can update own requests"
ON public.service_requests
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);