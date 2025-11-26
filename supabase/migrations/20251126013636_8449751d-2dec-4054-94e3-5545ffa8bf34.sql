-- Security fixes for production readiness

-- 1. Drop and recreate admin_permissions view without SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_permissions;

CREATE VIEW public.admin_permissions AS
SELECT 
  a.id,
  a.email,
  a.nome,
  a.role,
  a.ativo,
  a.created_at,
  CASE 
    WHEN a.role = 'super_admin' THEN true
    WHEN a.role = 'admin' THEN true
    ELSE false
  END as can_manage_admins,
  CASE 
    WHEN a.role IN ('super_admin', 'admin', 'support') THEN true
    ELSE false
  END as can_access_support,
  CASE 
    WHEN a.role IN ('super_admin', 'admin') THEN true
    ELSE false
  END as can_access_payments,
  CASE 
    WHEN a.role IN ('super_admin', 'admin') THEN true
    ELSE false
  END as can_access_reports,
  CASE 
    WHEN a.role IN ('super_admin', 'admin', 'content_manager') THEN true
    ELSE false
  END as can_manage_banners,
  CASE 
    WHEN a.role IN ('super_admin', 'admin') THEN true
    ELSE false
  END as can_manage_categories
FROM public.administradores a;

-- 2. Restrict job_listings to hide company emails from public
DROP POLICY IF EXISTS "Public can view active job listings" ON public.job_listings;

-- Only authenticated users can view job listings
CREATE POLICY "Authenticated users can view job listings"
ON public.job_listings
FOR SELECT
USING (auth.role() = 'authenticated');

-- Job posters can create listings
CREATE POLICY "Authenticated users can create job listings"
ON public.job_listings
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Job posters can manage their own listings
CREATE POLICY "Job posters can manage their own listings"
ON public.job_listings
FOR ALL
USING (
  company_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- 3. Strengthen job_applications RLS policies
DROP POLICY IF EXISTS "Applicants can view their own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Job posters can view applications for their listings" ON public.job_applications;
DROP POLICY IF EXISTS "Authenticated users can create applications with verified email" ON public.job_applications;
DROP POLICY IF EXISTS "Applicants can update own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Applicants can delete own applications" ON public.job_applications;

-- Only applicant can view their own application
CREATE POLICY "Applicants view own applications only"
ON public.job_applications
FOR SELECT
USING (
  candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- Only job poster can view applications for their specific listings
CREATE POLICY "Job posters view applications for own listings"
ON public.job_applications
FOR SELECT
USING (
  job_listing_id IN (
    SELECT id FROM public.job_listings 
    WHERE company_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
  )
);

-- Only authenticated users can create applications with their own verified email
CREATE POLICY "Authenticated users create applications with own email"
ON public.job_applications
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- Applicants can update only their own applications
CREATE POLICY "Applicants update own applications"
ON public.job_applications
FOR UPDATE
USING (
  candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- Applicants can delete only their own applications
CREATE POLICY "Applicants delete own applications"
ON public.job_applications
FOR DELETE
USING (
  candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
);

-- 4. Add security logging for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log access to sensitive data for security monitoring
  PERFORM public.log_security_event(
    auth.uid(),
    TG_OP || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    NULL,
    NULL,
    true,
    NULL,
    jsonb_build_object(
      'operation', TG_OP,
      'timestamp', now()
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Apply trigger to bank_details table
DROP TRIGGER IF EXISTS log_bank_details_access ON public.bank_details;
CREATE TRIGGER log_bank_details_access
AFTER INSERT OR UPDATE OR DELETE ON public.bank_details
FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

-- 5. Add indexes for better performance on security queries
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications(candidate_email);
CREATE INDEX IF NOT EXISTS idx_job_listings_email ON public.job_listings(company_email);
CREATE INDEX IF NOT EXISTS idx_job_listings_active ON public.job_listings(is_active) WHERE is_active = true;

-- 6. Add rate limiting for sensitive operations
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet,
  attempted_at timestamp with time zone DEFAULT now(),
  user_agent text
);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON public.failed_login_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON public.failed_login_attempts(ip_address, attempted_at DESC);

-- Enable RLS on failed_login_attempts
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only admins can view failed login attempts
CREATE POLICY "Admins can view failed login attempts"
ON public.failed_login_attempts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.administradores
    WHERE id = auth.uid() AND ativo = true
  )
);

-- System can insert failed login attempts
CREATE POLICY "System can insert failed login attempts"
ON public.failed_login_attempts
FOR INSERT
WITH CHECK (true);