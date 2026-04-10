
-- Remove sensitive tables from Realtime publication
-- Using DO block to handle cases where tables may not be in the publication
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'administradores', 'payments', 'job_applications', 
      'support_tickets', 'support_messages', 'profile_verifications',
      'bank_details', 'security_audit_log', 'failed_login_attempts',
      'user_locations', 'app_settings', 'app_configurations', 'user_roles'
    ])
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE public.%I', tbl);
    EXCEPTION WHEN OTHERS THEN
      -- Table might not be in the publication, skip
      NULL;
    END;
  END LOOP;
END $$;
