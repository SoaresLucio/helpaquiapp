-- Fix search path security issue in the log_job_application_access function
DROP FUNCTION IF EXISTS public.log_job_application_access();

CREATE OR REPLACE FUNCTION public.log_job_application_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;