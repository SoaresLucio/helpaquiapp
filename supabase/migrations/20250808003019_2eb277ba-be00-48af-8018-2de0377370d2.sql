-- Critical Security Fixes for Database

-- 1. Fix security definer functions with proper search paths
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Get encryption key from Supabase vault/secrets
  RETURN encode(
    pgp_sym_encrypt(
      data, 
      COALESCE(
        current_setting('app.settings.encryption_key', true),
        'helpaqui_encryption_key_2024' -- fallback if secret not set
      )
    ), 
    'base64'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN encrypted_data;
  END IF;
  
  RETURN pgp_sym_decrypt(
    decode(encrypted_data, 'base64'),
    COALESCE(
      current_setting('app.settings.encryption_key', true),
      'helpaqui_encryption_key_2024' -- fallback if secret not set
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    -- In case of decryption error, return null
    RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_bank_details_decrypted(p_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, bank_name text, account_type text, account_number text, branch text, document text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 2. Create profiles table with proper RLS policies
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  bio text,
  user_type text CHECK (user_type IN ('solicitante', 'freelancer')) NOT NULL,
  verified boolean DEFAULT false,
  verification_level text DEFAULT 'none' CHECK (verification_level IN ('none', 'basic', 'verified')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view verified profiles" 
ON public.profiles 
FOR SELECT 
USING (verified = true);

-- 3. Fix security audit log access
DROP POLICY IF EXISTS "System only audit access" ON public.security_audit_log;

CREATE POLICY "Users can view their own security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all security logs" 
ON public.security_audit_log 
FOR SELECT 
USING (has_role(auth.uid(), 'helpadmin'::user_role));

CREATE POLICY "System can insert security logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- 4. Fix messages table RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- 5. Update log_security_event function with proper search path
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_action text, p_resource_type text, p_resource_id text DEFAULT NULL::text, p_ip_address inet DEFAULT NULL::inet, p_user_agent text DEFAULT NULL::text, p_success boolean DEFAULT true, p_error_message text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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

-- 6. Fix other functions with mutable search paths
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$function$;

-- 7. Create trigger for profiles updated_at
CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Create secure user type validation function
CREATE OR REPLACE FUNCTION public.validate_user_type(p_user_id uuid, p_expected_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id AND user_type = p_expected_type
  );
END;
$function$;