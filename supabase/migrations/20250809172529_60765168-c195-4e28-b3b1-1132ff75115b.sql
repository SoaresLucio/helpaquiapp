-- Fix security issues - check user_type values first
-- First, let's see what user_type values exist and fix them properly

-- Update NULL user_type values to 'solicitante' (safest default)
UPDATE public.profiles 
SET user_type = 'solicitante' 
WHERE user_type IS NULL OR user_type = '';

-- Remove dangerous public access policies if they exist
DO $$
BEGIN
    -- Check and drop dangerous public policies
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname LIKE '%Public%' AND policyname LIKE '%viewable%') THEN
        EXECUTE 'DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles';
        EXECUTE 'DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles';
    END IF;
END $$;

-- Create secure profile access policy for verified profiles only
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Authenticated can view verified basic profiles') THEN
        CREATE POLICY "Authenticated can view verified basic profiles" 
        ON public.profiles 
        FOR SELECT 
        USING (verified = true AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Fix security audit log access
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_log' AND policyname = 'System only audit access') THEN
        DROP POLICY "System only audit access" ON public.security_audit_log;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_log' AND policyname = 'Users can view their own security logs') THEN
        CREATE POLICY "Users can view their own security logs" 
        ON public.security_audit_log 
        FOR SELECT 
        USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_log' AND policyname = 'System can insert security logs') THEN
        CREATE POLICY "System can insert security logs" 
        ON public.security_audit_log 
        FOR INSERT 
        WITH CHECK (true);
    END IF;
END $$;

-- Add user_roles viewing policy
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
        CREATE POLICY "Users can view their own roles" 
        ON public.user_roles 
        FOR SELECT 
        USING (user_id = auth.uid());
    END IF;
END $$;