
-- FIX 9: Add storage policies for avatars bucket (drop first if exist)
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- FIX 10: Update encryption functions to remove hardcoded key
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(data text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      data, 
      current_setting('app.settings.encryption_key', true)
    ), 
    'base64'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Encryption failed - encryption key not configured';
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(encrypted_data text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_bank_details_decrypted(p_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, bank_name text, account_type text, account_number text, branch text, document text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only view own bank details';
    END IF;
    
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

CREATE OR REPLACE FUNCTION public.insert_bank_details_encrypted(p_user_id uuid, p_bank_name text, p_account_type text, p_account_number text, p_branch text, p_document text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    INSERT INTO public.bank_details (
        user_id, bank_name, account_type, account_number, branch, document
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
$function$;
