
-- 1) profiles: rebind public SELECT policies to authenticated, add anon deny
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'helpadmin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));

CREATE POLICY "Deny anon access to profiles"
  ON public.profiles AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 2) job_applications: anon deny
CREATE POLICY "Deny anon access to job_applications"
  ON public.job_applications AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 3) user_subscriptions_flow: tighten RESTRICTIVE update to service_role/admin only
DROP POLICY IF EXISTS "Block regular user_subscriptions_flow updates" ON public.user_subscriptions_flow;
CREATE POLICY "Block regular user_subscriptions_flow updates"
  ON public.user_subscriptions_flow AS RESTRICTIVE FOR UPDATE TO authenticated
  USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
    OR has_role(auth.uid(), 'helpadmin'::user_role)
  )
  WITH CHECK (
    COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
    OR has_role(auth.uid(), 'helpadmin'::user_role)
  );

-- 4) user_locations: anon deny
CREATE POLICY "Deny anon access to user_locations"
  ON public.user_locations AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 5) empresa_profiles: anon deny
CREATE POLICY "Deny anon access to empresa_profiles"
  ON public.empresa_profiles AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 6) service_requests: anon deny
CREATE POLICY "Deny anon access to service_requests"
  ON public.service_requests AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 7) payment_methods: rebind to authenticated + anon deny
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.payment_methods;

CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON public.payment_methods FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON public.payment_methods FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Deny anon access to payment_methods"
  ON public.payment_methods AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

-- 8) pix_payments / pix_transactions: rebind + anon deny
DROP POLICY IF EXISTS "Users can view their own pix payments" ON public.pix_payments;
DROP POLICY IF EXISTS "Users can create their own pix payments" ON public.pix_payments;

CREATE POLICY "Users can view their own pix payments"
  ON public.pix_payments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pix payments"
  ON public.pix_payments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Deny anon access to pix_payments"
  ON public.pix_payments AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Users can view their own pix transactions" ON public.pix_transactions;
DROP POLICY IF EXISTS "Users can create their own pix transactions" ON public.pix_transactions;

CREATE POLICY "Users can view their own pix transactions"
  ON public.pix_transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pix transactions"
  ON public.pix_transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Deny anon access to pix_transactions"
  ON public.pix_transactions AS RESTRICTIVE FOR ALL TO anon
  USING (false) WITH CHECK (false);
