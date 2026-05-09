
-- 1) Remove unrestricted realtime broadcast policies (owner-scoped public.messages policies remain)
DROP POLICY IF EXISTS "authenticated_can_receive_broadcast" ON realtime.messages;
DROP POLICY IF EXISTS "authenticated_can_send_broadcast" ON realtime.messages;

-- 2) Restrict get_all_users_admin to admins via DB grants and add internal guard (already present, kept)
REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_all_users_admin() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users_admin() TO service_role;
-- Re-grant to authenticated; internal has_role guard prevents non-admin callers
GRANT EXECUTE ON FUNCTION public.get_all_users_admin() TO authenticated;

-- 3) Add ownership guard to insert_bank_details_encrypted
CREATE OR REPLACE FUNCTION public.insert_bank_details_encrypted(
  p_user_id uuid, p_bank_name text, p_account_type text,
  p_account_number text, p_branch text, p_document text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only modify own bank details';
    END IF;

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
END;
$function$;

-- Same hardening for the unencrypted variant
CREATE OR REPLACE FUNCTION public.insert_bank_details(
  p_user_id uuid, p_bank_name text, p_account_type text,
  p_account_number text, p_branch text, p_document text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    IF p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'Access denied: can only modify own bank details';
    END IF;

    INSERT INTO public.bank_details (
        user_id, bank_name, account_type, account_number, branch, document
    )
    VALUES (p_user_id, p_bank_name, p_account_type, p_account_number, p_branch, p_document)
    ON CONFLICT (user_id)
    DO UPDATE SET
        bank_name = p_bank_name,
        account_type = p_account_type,
        account_number = p_account_number,
        branch = p_branch,
        document = p_document,
        updated_at = now();

    RETURN TRUE;
END;
$function$;

-- 4) Require job_listing_id NOT NULL on job_applications
ALTER TABLE public.job_applications
  ALTER COLUMN job_listing_id SET NOT NULL;
