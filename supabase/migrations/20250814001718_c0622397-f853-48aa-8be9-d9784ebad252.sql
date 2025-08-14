-- Fix security vulnerabilities in RLS policies and functions

-- 1. Fix job_applications RLS - restrict access to sensitive data
DROP POLICY IF EXISTS "job_applications_select_policy" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_insert_policy" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_delete_policy" ON public.job_applications;

-- Only allow job listing owners and applicants to view applications
CREATE POLICY "Job owners and applicants can view applications" 
ON public.job_applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM job_listings 
    WHERE job_listings.id = job_applications.job_listing_id 
    AND job_listings.created_by = auth.uid()
  )
  OR candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Allow authenticated users to create applications
CREATE POLICY "Authenticated users can create applications" 
ON public.job_applications FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Only allow applicants to update their own applications
CREATE POLICY "Applicants can update own applications" 
ON public.job_applications FOR UPDATE 
USING (candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Only allow job owners and applicants to delete applications
CREATE POLICY "Job owners and applicants can delete applications" 
ON public.job_applications FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM job_listings 
    WHERE job_listings.id = job_applications.job_listing_id 
    AND job_listings.created_by = auth.uid()
  )
  OR candidate_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- 2. Fix freelancer_service_offers - ensure proper user access
ALTER TABLE public.freelancer_service_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view active offers" ON public.freelancer_service_offers;
DROP POLICY IF EXISTS "Freelancers can manage their own offers" ON public.freelancer_service_offers;

-- Only allow viewing of active offers for authenticated users
CREATE POLICY "Authenticated users can view active offers" 
ON public.freelancer_service_offers FOR SELECT 
USING (auth.role() = 'authenticated' AND status = 'active');

-- Freelancers can only manage their own offers
CREATE POLICY "Freelancers can manage their own offers" 
ON public.freelancer_service_offers FOR ALL 
USING (freelancer_id = auth.uid())
WITH CHECK (freelancer_id = auth.uid());

-- 3. Fix insecure functions - add proper search_path
CREATE OR REPLACE FUNCTION public.get_bank_details_decrypted(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, bank_name text, account_type text, account_number text, branch text, document text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
    -- Verify user can only access their own bank details
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only view own bank details';
    END IF;
    
    -- Set encryption key
    PERFORM set_config('app.settings.encryption_key', 'helpaqui_encryption_key_2024', false);
    
    RETURN QUERY
    SELECT 
        bd.id,
        bd.user_id,
        decrypt_sensitive_data(bd.bank_name) as bank_name,
        decrypt_sensitive_data(bd.account_type) as account_type,
        decrypt_sensitive_data(bd.account_number) as account_number,
        decrypt_sensitive_data(bd.branch) as branch,
        decrypt_sensitive_data(bd.document) as document,
        bd.created_at,
        bd.updated_at
    FROM public.bank_details bd
    WHERE bd.user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_action text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_success boolean DEFAULT true, p_error_message text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id, 
    ip_address, user_agent, success, error_message, metadata
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_success, p_error_message, p_metadata
  );
END;
$function$;

-- 4. Add secure user validation function
CREATE OR REPLACE FUNCTION public.validate_user_access(p_user_id uuid, p_resource_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $function$
BEGIN
    -- Basic validation: user must be authenticated and accessing their own data
    IF auth.uid() IS NULL THEN
        RETURN false;
    END IF;
    
    -- User can only access their own resources
    IF p_user_id != auth.uid() THEN
        RETURN false;
    END IF;
    
    -- Log access attempt
    PERFORM log_security_event(
        auth.uid(), 
        'access_validation', 
        p_resource_type, 
        p_user_id::text,
        NULL,
        NULL,
        true
    );
    
    RETURN true;
END;
$function$;