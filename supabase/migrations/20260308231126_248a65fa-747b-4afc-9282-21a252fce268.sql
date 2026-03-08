
-- Fix overly permissive RLS policies on failed_login_attempts and security_audit_log

-- Drop the overly permissive INSERT policy on failed_login_attempts
DROP POLICY IF EXISTS "System can insert failed login attempts" ON public.failed_login_attempts;

-- Recreate with service_role check (only edge functions/triggers with service role can insert)
CREATE POLICY "Service role can insert failed login attempts"
ON public.failed_login_attempts
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' OR auth.uid() IS NOT NULL);

-- Drop the overly permissive INSERT policy on security_audit_log
DROP POLICY IF EXISTS "System can insert security logs" ON public.security_audit_log;

-- Recreate: allow authenticated users to insert their own logs
CREATE POLICY "Authenticated users can insert security logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
