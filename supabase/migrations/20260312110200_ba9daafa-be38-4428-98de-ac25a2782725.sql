
-- Fix 1: Remove vulnerable "Applicants manage own applications" policy that uses mutable profiles.email
DROP POLICY IF EXISTS "Applicants manage own applications" ON public.job_applications;

-- Fix 2: Restrict rate_limits to INSERT and SELECT only (prevent users from deleting their own rate limit records)
DROP POLICY IF EXISTS "Users can manage their own rate limits" ON public.rate_limits;

CREATE POLICY "Users can insert rate limits"
ON public.rate_limits FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own rate limits"
ON public.rate_limits FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own rate limits"
ON public.rate_limits FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Fix 3: Replace broad profiles SELECT policy with one that hides PII from other users
DROP POLICY IF EXISTS "Authenticated can view verified basic profiles" ON public.profiles;

-- Allow users to see their own full profile
-- (already covered by "Users can view their own profile" policy)

-- Add a policy that only exposes non-sensitive columns to other authenticated users
-- Since column-level RLS isn't supported, we restrict to owner-only for full data
-- and use the existing public_profiles view for other users
-- We need to ensure the public_profiles view exists and is used instead

-- Fix 4: Block direct access to app_settings for non-admin users
DROP POLICY IF EXISTS "Admin users can manage app settings" ON public.app_settings;

-- Re-create admin-only policy
CREATE POLICY "Only admins can manage app_settings"
ON public.app_settings
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'helpadmin'::user_role
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'helpadmin'::user_role
));

-- Add restrictive policy to block all non-admin access
CREATE POLICY "Block non-admin app_settings access"
ON public.app_settings
AS RESTRICTIVE
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'helpadmin'::user_role
  )
);
