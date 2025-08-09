-- Phase 1: Critical Security Fixes (Fixed)

-- 1. Fix profiles table RLS policies - check and replace existing dangerous ones
DO $$
BEGIN
    -- Drop the dangerous public policy if it exists
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
        DROP POLICY "Public profiles are viewable by everyone" ON public.profiles;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Profiles are viewable by everyone') THEN
        DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
    END IF;
END $$;

-- Create secure profile policies only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public can view basic verified profile info') THEN
        CREATE POLICY "Public can view basic verified profile info" 
        ON public.profiles 
        FOR SELECT 
        USING (verified = true AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 2. Fix user_type data integrity
UPDATE public.profiles 
SET user_type = 'solicitante' 
WHERE user_type IS NULL;

-- Only add constraints if they don't exist
DO $$
BEGIN
    -- Check if column is already NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_type' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.profiles ALTER COLUMN user_type SET NOT NULL;
        ALTER TABLE public.profiles ALTER COLUMN user_type SET DEFAULT 'solicitante';
    END IF;
END $$;

-- 3. Fix security audit log access
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

-- 4. Fix user_roles policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can view their own roles') THEN
        CREATE POLICY "Users can view their own roles" 
        ON public.user_roles 
        FOR SELECT 
        USING (user_id = auth.uid());
    END IF;
END $$;