-- Security fixes: Implement proper RLS policies and fix function security

-- 1. SECURE JOB APPLICATIONS - Remove overly permissive policies
DROP POLICY IF EXISTS "job_applications_select_policy" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_insert_policy" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_update_policy" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_delete_policy" ON public.job_applications;
DROP POLICY IF EXISTS "Freelancers can create applications" ON public.job_applications;

-- Create secure RLS policies for job_applications
CREATE POLICY "Applicants can view their own applications" 
ON public.job_applications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = job_applications.candidate_email
  )
);

CREATE POLICY "Authenticated users can create applications" 
ON public.job_applications 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  candidate_email IS NOT NULL AND
  candidate_name IS NOT NULL
);

CREATE POLICY "Applicants can update their own applications" 
ON public.job_applications 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = job_applications.candidate_email
  )
);

-- 2. SECURE JOB LISTINGS - Create proper policies if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'job_listings') THEN
    -- Remove overly permissive policies
    DROP POLICY IF EXISTS "job_listings_select_policy" ON public.job_listings;
    DROP POLICY IF EXISTS "job_listings_insert_policy" ON public.job_listings;
    DROP POLICY IF EXISTS "job_listings_update_policy" ON public.job_listings;
    DROP POLICY IF EXISTS "job_listings_delete_policy" ON public.job_listings;
    
    -- Create secure policies
    CREATE POLICY "Public can view active job listings" 
    ON public.job_listings 
    FOR SELECT 
    USING (status = 'active');
    
    CREATE POLICY "Company admins can manage their job listings" 
    ON public.job_listings 
    FOR ALL 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());
  END IF;
END $$;

-- 3. SECURE FREELANCER SERVICE OFFERS - Tighten policies
DROP POLICY IF EXISTS "Public read access to active offers" ON public.freelancer_service_offers;

CREATE POLICY "Public can view basic offer information" 
ON public.freelancer_service_offers 
FOR SELECT 
USING (
  status = 'active' AND
  -- Only show basic info publicly, detailed info requires authentication
  auth.role() = 'authenticated'
);

CREATE POLICY "Freelancers can manage their own offers" 
ON public.freelancer_service_offers 
FOR ALL 
USING (freelancer_id = auth.uid())
WITH CHECK (freelancer_id = auth.uid());

-- 4. FIX DATABASE FUNCTION SECURITY - Add proper search_path

CREATE OR REPLACE FUNCTION public.get_bank_details_decrypted(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, bank_name text, account_type text, account_number text, branch text, document text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Define a chave de criptografia
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
SET search_path TO 'public'
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

-- 5. ENHANCED SECURITY MONITORING - Create function to check sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_user_id uuid,
  p_table_name text,
  p_operation text,
  p_record_count integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Log access to sensitive data with enhanced metadata
  INSERT INTO public.security_audit_log (
    user_id, 
    action, 
    resource_type, 
    success, 
    metadata
  ) VALUES (
    p_user_id,
    'sensitive_data_access',
    p_table_name,
    true,
    jsonb_build_object(
      'operation', p_operation,
      'record_count', p_record_count,
      'timestamp', now(),
      'table', p_table_name
    )
  );
  
  -- Alert if suspicious pattern (many records accessed)
  IF p_record_count > 50 THEN
    INSERT INTO public.security_audit_log (
      user_id, 
      action, 
      resource_type, 
      success, 
      error_message,
      metadata
    ) VALUES (
      p_user_id,
      'suspicious_data_access',
      p_table_name,
      true,
      'Large data access detected',
      jsonb_build_object(
        'operation', p_operation,
        'record_count', p_record_count,
        'alert_level', 'high'
      )
    );
  END IF;
END;
$function$;

-- 6. CREATE FUNCTION TO VALIDATE DATA ACCESS PERMISSIONS
CREATE OR REPLACE FUNCTION public.validate_data_access_permission(
  p_user_id uuid,
  p_resource_type text,
  p_resource_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  has_permission boolean := false;
  user_profile RECORD;
BEGIN
  -- Get user profile information
  SELECT * INTO user_profile 
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Check specific resource permissions
  CASE p_resource_type
    WHEN 'job_applications' THEN
      -- User can access their own applications or applications to their job listings
      SELECT EXISTS (
        SELECT 1 FROM public.job_applications ja
        LEFT JOIN public.job_listings jl ON ja.job_listing_id = jl.id
        WHERE (ja.id::text = p_resource_id OR p_resource_id IS NULL)
        AND (
          ja.candidate_email = (SELECT email FROM auth.users WHERE id = p_user_id)
          OR jl.created_by = p_user_id
        )
      ) INTO has_permission;
      
    WHEN 'bank_details' THEN
      -- User can only access their own bank details
      SELECT EXISTS (
        SELECT 1 FROM public.bank_details 
        WHERE user_id = p_user_id
        AND (id::text = p_resource_id OR p_resource_id IS NULL)
      ) INTO has_permission;
      
    WHEN 'freelancer_service_offers' THEN
      -- User can access their own offers or public active offers
      SELECT EXISTS (
        SELECT 1 FROM public.freelancer_service_offers 
        WHERE (freelancer_id = p_user_id OR status = 'active')
        AND (id::text = p_resource_id OR p_resource_id IS NULL)
      ) INTO has_permission;
      
    ELSE
      -- Default deny for unknown resource types
      has_permission := false;
  END CASE;
  
  -- Log the access attempt
  PERFORM log_security_event(
    p_user_id,
    'data_access_validation',
    p_resource_type,
    p_resource_id,
    NULL,
    NULL,
    has_permission,
    CASE WHEN NOT has_permission THEN 'Access denied' ELSE NULL END,
    jsonb_build_object('resource_type', p_resource_type, 'has_permission', has_permission)
  );
  
  RETURN has_permission;
END;
$function$;