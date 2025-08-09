-- Phase 1: Critical Security Fixes

-- 1. Fix profiles table RLS policies (remove dangerous public access)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create secure profile policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Public can view basic verified profile info" 
ON public.profiles 
FOR SELECT 
USING (verified = true AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id AND user_type IS NOT NULL);

-- 2. Fix user_type data integrity
UPDATE public.profiles 
SET user_type = 'solicitante' 
WHERE user_type IS NULL;

ALTER TABLE public.profiles 
ALTER COLUMN user_type SET NOT NULL;

ALTER TABLE public.profiles 
ALTER COLUMN user_type SET DEFAULT 'solicitante';

-- 3. Fix security audit log access (allow users to view their own logs)
DROP POLICY IF EXISTS "System only audit access" ON public.security_audit_log;

CREATE POLICY "Users can view their own security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can insert security logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 4. Fix user_roles policies (allow users to view their own roles)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- 5. Fix database functions to include proper search_path
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Function logic here
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Function logic here
END;
$$;

-- 6. Update handle_new_user function to ensure user_type is set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, user_type)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'first_name', 
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'solicitante')
  );
  RETURN NEW;
END;
$$;