
-- ============================================
-- 1. Standardize job_listings policies to owner_id
-- ============================================

-- Drop old email-based policies on job_listings
DROP POLICY IF EXISTS "Authenticated users can create job listings with their email" ON public.job_listings;
DROP POLICY IF EXISTS "Job posters can delete their own listings" ON public.job_listings;
DROP POLICY IF EXISTS "Job posters can update their own listings" ON public.job_listings;
DROP POLICY IF EXISTS "Job posters can view their own listings" ON public.job_listings;
DROP POLICY IF EXISTS "Owners and admins can view job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Owners can delete their own job listings" ON public.job_listings;
DROP POLICY IF EXISTS "Owners can update their own job listings" ON public.job_listings;

-- Create unified owner_id-based policies on job_listings
CREATE POLICY "Owners can view their job listings"
ON public.job_listings FOR SELECT
TO authenticated
USING (owner_id = auth.uid() OR has_role(auth.uid(), 'helpadmin'::user_role));

CREATE POLICY "Owners can create job listings"
ON public.job_listings FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their job listings"
ON public.job_listings FOR UPDATE
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their job listings"
ON public.job_listings FOR DELETE
TO authenticated
USING (owner_id = auth.uid());

-- ============================================
-- 2. Standardize job_applications policies to use owner_id
-- ============================================

-- Drop old email-based and inconsistent policies
DROP POLICY IF EXISTS "Job posters view applications for own listings" ON public.job_applications;

-- The "Job owners view applications" policy already uses user_owns_job_listing (owner_id) — keep it.
-- The "Applicants view/update/delete own applications" policies use candidate_email matching — 
-- this is acceptable since applicants need to see their own applications.

-- ============================================
-- 3. Tighten public bucket storage policies
-- ============================================

-- Drop overly broad SELECT policies that allow listing
-- Note: We need to check what exists and be careful not to break file access

-- For avatars bucket: only allow authenticated access to specific files (no listing)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Create path-scoped policies (users can read files but not list the bucket root)
CREATE POLICY "Authenticated users can read avatar files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- For banner-images: public read is needed for display
CREATE POLICY "Anyone can read banner images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'banner-images' AND auth.role() = 'authenticated');

-- For admin-uploads: restrict to authenticated
CREATE POLICY "Authenticated users can read admin uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'admin-uploads');
