-- Fix security vulnerability in job_applications table
-- Remove overly permissive policies and add proper access control

-- Drop existing policies
DROP POLICY IF EXISTS "Applicants can view own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated users can create applications" ON public.job_applications;

-- Create secure policies that properly restrict access to personal data

-- Policy 1: Only allow applicants to view their own applications
CREATE POLICY "Applicants can view their own applications"
ON public.job_applications
FOR SELECT
USING (
  candidate_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )::text
);

-- Policy 2: Allow job posters to view applications for their job listings only
CREATE POLICY "Job posters can view applications for their listings"
ON public.job_applications
FOR SELECT
USING (
  job_listing_id IN (
    SELECT id FROM public.job_listings 
    WHERE company_email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )::text
  )
);

-- Policy 3: Only authenticated users can create applications with their own email
CREATE POLICY "Authenticated users can create applications with verified email"
ON public.job_applications
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND candidate_email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )::text
);

-- Add logging for sensitive data access attempts
CREATE OR REPLACE FUNCTION public.log_job_application_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to job applications for security monitoring
  PERFORM public.log_security_event(
    auth.uid(),
    'job_application_access',
    'job_applications',
    NEW.id::text,
    NULL,
    NULL,
    true,
    NULL,
    jsonb_build_object(
      'candidate_email', NEW.candidate_email,
      'job_listing_id', NEW.job_listing_id,
      'access_type', TG_OP
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;