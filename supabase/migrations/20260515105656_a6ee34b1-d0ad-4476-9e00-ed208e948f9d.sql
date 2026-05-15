-- Fix resumes bucket policy: replace substring LIKE match with exact-path equality
-- to prevent job owners from spoofing resume_url to access unrelated files.

DROP POLICY IF EXISTS "Job owners can read applicant resumes" ON storage.objects;

CREATE POLICY "Job owners can read applicant resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1
    FROM public.job_applications ja
    JOIN public.job_listings jl ON jl.id = ja.job_listing_id
    WHERE jl.owner_id = auth.uid()
      AND (
        ja.resume_url = objects.name
        OR ja.resume_url = 'resumes/' || objects.name
        OR ja.resume_url LIKE '%/storage/v1/object/%/resumes/' || objects.name
        OR ja.resume_url LIKE '%/storage/v1/object/%/resumes/' || objects.name || '?%'
      )
  )
);