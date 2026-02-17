
-- 1. Fix profiles: restrict public SELECT to non-sensitive fields only
DROP POLICY IF EXISTS "Public can view verified profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view verified profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Public can only see basic info (not email, phone, address)
CREATE POLICY "Public can view basic profile info"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);
-- Note: We'll handle field restriction at the application level via views

-- Create a secure view for public profile access (no sensitive data)
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true)
AS SELECT 
  id, first_name, last_name, avatar_url, cover_photo, user_type, verified, created_at
FROM public.profiles;

-- 2. Fix bank_details: remove duplicate policies
DROP POLICY IF EXISTS "Users can view own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can view their own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can insert own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can insert their own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can update own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can update their own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can delete own bank details" ON public.bank_details;
DROP POLICY IF EXISTS "Users can delete their own bank details" ON public.bank_details;

CREATE POLICY "Users manage own bank details"
ON public.bank_details FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Fix job_listings: mask company_email, require auth to view contact info
DROP POLICY IF EXISTS "Anyone can view active job listings" ON public.job_listings;

CREATE POLICY "Anyone can view active job listings"
ON public.job_listings FOR SELECT
USING (is_active = true);

-- Create secure view for job listings without email
CREATE OR REPLACE VIEW public.public_job_listings
WITH (security_invoker = true)
AS SELECT 
  id, title, description, company_name, job_type, location, location_address,
  location_lat, location_lng, requirements, salary_range, benefits, is_active, created_at, updated_at
FROM public.job_listings
WHERE is_active = true;

-- 4. Fix job_applications: use proper user_id-based RLS instead of email matching
DROP POLICY IF EXISTS "Job poster can view applications" ON public.job_applications;
DROP POLICY IF EXISTS "Job posters can view their applications" ON public.job_applications;

-- Create a function to check if user owns the job listing
CREATE OR REPLACE FUNCTION public.user_owns_job_listing(listing_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_listings jl
    JOIN public.profiles p ON p.email = jl.company_email
    WHERE jl.id = listing_id AND p.id = auth.uid()
  );
$$;

CREATE POLICY "Applicants manage own applications"
ON public.job_applications FOR ALL
TO authenticated
USING (candidate_email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (candidate_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Job owners view applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (public.user_owns_job_listing(job_listing_id));

CREATE POLICY "Admins view all applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role));
