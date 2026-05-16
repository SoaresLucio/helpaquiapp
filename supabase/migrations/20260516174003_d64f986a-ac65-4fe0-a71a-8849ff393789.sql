
-- Tighten the "Job owners can read applicant resumes" storage policy
-- Remove LIKE pattern matching on resume_url (which was user-controlled) and
-- only allow exact equality against the canonical object name.
DROP POLICY IF EXISTS "Job owners can read applicant resumes" ON storage.objects;

CREATE POLICY "Job owners can read applicant resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1
    FROM public.job_applications ja
    JOIN public.job_listings jl ON jl.id = ja.job_listing_id
    WHERE jl.owner_id = auth.uid()
      AND (
        ja.resume_url = objects.name
        OR ja.resume_url = ('resumes/' || objects.name)
      )
  )
);
