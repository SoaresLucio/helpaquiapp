
-- Habilitar a extensão pgcrypto para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Função para criptografar dados sensíveis
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Usa uma chave derivada do secret do projeto para criptografia
  RETURN encode(
    pgp_sym_encrypt(
      data, 
      current_setting('app.settings.encryption_key', true)
    ), 
    'base64'
  );
END;
$$;

-- Função para descriptografar dados sensíveis
CREATE OR REPLACE FUNCTION decrypt_sensitive_data(encrypted_data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN encrypted_data;
  END IF;
  
  RETURN pgp_sym_decrypt(
    decode(encrypted_data, 'base64'),
    current_setting('app.settings.encryption_key', true)
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro na descriptografia, retorna null
    RETURN NULL;
END;
$$;

-- Função personalizada para inserir/atualizar dados bancários com criptografia
CREATE OR REPLACE FUNCTION public.insert_bank_details_encrypted(
  p_user_id uuid, 
  p_bank_name text, 
  p_account_type text, 
  p_account_number text, 
  p_branch text, 
  p_document text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_catalog'
AS $$
BEGIN
    -- Define a chave de criptografia se não estiver definida
    PERFORM set_config('app.settings.encryption_key', 'helpaqui_encryption_key_2024', false);
    
    INSERT INTO public.bank_details (
        user_id, 
        bank_name, 
        account_type, 
        account_number, 
        branch, 
        document
    )
    VALUES (
        p_user_id,
        encrypt_sensitive_data(p_bank_name),
        encrypt_sensitive_data(p_account_type),
        encrypt_sensitive_data(p_account_number),
        encrypt_sensitive_data(p_branch),
        encrypt_sensitive_data(p_document)
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        bank_name = encrypt_sensitive_data(p_bank_name),
        account_type = encrypt_sensitive_data(p_account_type),
        account_number = encrypt_sensitive_data(p_account_number),
        branch = encrypt_sensitive_data(p_branch),
        document = encrypt_sensitive_data(p_document),
        updated_at = now();
        
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Função para recuperar dados bancários descriptografados
CREATE OR REPLACE FUNCTION public.get_bank_details_decrypted(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    user_id uuid,
    bank_name text,
    account_type text,
    account_number text,
    branch text,
    document text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Política RLS atualizada para usar a função de descriptografia
DROP POLICY IF EXISTS "Users can view their own bank details" ON public.bank_details;
CREATE POLICY "Users can view their own bank details" 
  ON public.bank_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para INSERT usando a nova função
DROP POLICY IF EXISTS "Users can insert their own bank details" ON public.bank_details;
CREATE POLICY "Users can insert their own bank details" 
  ON public.bank_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE usando a nova função
DROP POLICY IF EXISTS "Users can update their own bank details" ON public.bank_details;
CREATE POLICY "Users can update their own bank details" 
  ON public.bank_details 
  FOR UPDATE 
  USING (auth.uid() = user_id);
