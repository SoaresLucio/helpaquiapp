
-- Restrictive deny-anon on job_listings
DROP POLICY IF EXISTS "Deny anon access to job_listings" ON public.job_listings;
CREATE POLICY "Deny anon access to job_listings"
ON public.job_listings
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Restrictive deny-anon on app_configurations
DROP POLICY IF EXISTS "Deny anon access to app_configurations" ON public.app_configurations;
CREATE POLICY "Deny anon access to app_configurations"
ON public.app_configurations
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Restrictive policy on user_subscriptions: prevent non-admin authenticated users
-- from changing tier/status fields (defense-in-depth on top of existing trigger)
DROP POLICY IF EXISTS "Restrict tier field updates on user_subscriptions" ON public.user_subscriptions;
CREATE POLICY "Restrict tier field updates on user_subscriptions"
ON public.user_subscriptions
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'helpadmin'::user_role)
  OR user_id = auth.uid()
)
WITH CHECK (
  public.has_role(auth.uid(), 'helpadmin'::user_role)
  OR user_id = auth.uid()
);

-- Storage policies: resume owners can UPDATE and DELETE own files
DROP POLICY IF EXISTS "Resume owners can update own files" ON storage.objects;
CREATE POLICY "Resume owners can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'resumes'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Resume owners can delete own files" ON storage.objects;
CREATE POLICY "Resume owners can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);
