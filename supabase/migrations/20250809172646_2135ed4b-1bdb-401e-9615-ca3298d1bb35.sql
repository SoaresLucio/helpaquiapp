-- Fix conflicting user_type constraints and security issues

-- First, drop the conflicting check constraints
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS check_user_type;

-- Add the correct constraint with proper values
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type = ANY (ARRAY['solicitante'::text, 'freelancer'::text]));

-- Update any NULL user_type values to 'solicitante' (safest default)
UPDATE public.profiles 
SET user_type = 'solicitante' 
WHERE user_type IS NULL OR user_type = '';

-- Remove dangerous public access policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure profile access policy for verified profiles only
CREATE POLICY "Authenticated can view verified basic profiles" 
ON public.profiles 
FOR SELECT 
USING (verified = true AND auth.role() = 'authenticated');

-- Fix security audit log access
DROP POLICY IF EXISTS "System only audit access" ON public.security_audit_log;

CREATE POLICY "Users can view their own security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert security logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Add user_roles viewing policy
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());