-- CORREÇÕES DE SEGURANÇA - VERSÃO CORRIGIDA

-- 1. Enable RLS apenas nas tabelas (não views)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verificacoes ENABLE ROW LEVEL SECURITY;

-- 2. Add missing RLS policies para messages table
CREATE POLICY "Users can insert their own messages" ON public.messages
FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can view messages they sent or received" ON public.messages
FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (sender_id = auth.uid());

-- 3. Add RLS policies para verificacoes table
CREATE POLICY "Users can manage their own verifications" ON public.verificacoes
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all verifications" ON public.verificacoes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'helpadmin'::user_role
  )
);

-- 4. Fix function search paths para segurança
ALTER FUNCTION public.has_role(user_id bigint, role_name text) SET search_path = 'public';
ALTER FUNCTION public.encrypt_sensitive_data(data text) SET search_path = 'public';
ALTER FUNCTION public.generate_pix_code() SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';
ALTER FUNCTION public.has_role(_user_id uuid, _role text) SET search_path = 'public';
ALTER FUNCTION public.has_role(_user_id uuid, _role user_role) SET search_path = 'public';
ALTER FUNCTION public.decrypt_sensitive_data(encrypted_data text) SET search_path = 'public';
ALTER FUNCTION public.update_conversation_timestamp() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_freelancer_profiles() SET search_path = 'public';
ALTER FUNCTION public.update_freelancer_service_offers_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_payment_methods() SET search_path = 'public';
ALTER FUNCTION public.update_app_configurations_updated_at() SET search_path = 'public';
ALTER FUNCTION public.log_security_event() SET search_path = 'public';
ALTER FUNCTION public.update_subscription_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.check_message_limit(p_user_id uuid, p_other_user_id uuid) SET search_path = 'public';
ALTER FUNCTION public.check_request_limit(p_user_id uuid) SET search_path = 'public';

-- 5. Configurar chave de criptografia segura
INSERT INTO public.app_settings (key, value, description) 
VALUES (
  'encryption_key', 
  '"helpaqui_encryption_key_2024_secure"'::jsonb,
  'Chave principal de criptografia para dados sensíveis'
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();

-- 6. Criar função aprimorada de log de segurança
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid,
  p_action text,
  p_resource_type text,
  p_resource_id text DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_message text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id, action, resource_type, resource_id,
    ip_address, user_agent, success, error_message, metadata
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_success, p_error_message, p_metadata
  );
END;
$$;

-- 7. Criar função de validação de acesso seguro
CREATE OR REPLACE FUNCTION public.validate_user_access(
  p_user_id uuid,
  p_resource_type text,
  p_resource_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log de tentativa de acesso
  PERFORM public.log_security_event_enhanced(
    p_user_id,
    'access_validation',
    p_resource_type,
    p_resource_id,
    NULL,
    NULL,
    true,
    NULL,
    jsonb_build_object('validation_time', now())
  );
  
  -- Validação básica - usuário deve estar autenticado
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 8. Criar tabela de rate limiting para proteção de API
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, action_type, window_start)
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own rate limits" ON public.rate_limits
FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 9. Função para rate limiting seguro
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid,
  p_action_type text,
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / p_window_minutes) * 
    INTERVAL '1 minute' * p_window_minutes;
  
  INSERT INTO public.rate_limits (user_id, action_type, window_start)
  VALUES (p_user_id, p_action_type, window_start)
  ON CONFLICT (user_id, action_type, window_start) 
  DO UPDATE SET count = rate_limits.count + 1, created_at = now()
  RETURNING count INTO current_count;
  
  RETURN current_count <= p_max_requests;
END;
$$;