-- Remove broadcast policies that override per-user message privacy
DROP POLICY IF EXISTS "authenticated_can_receive_broadcast" ON public.messages;
DROP POLICY IF EXISTS "authenticated_can_send_broadcast" ON public.messages;

-- Belt-and-suspenders restrictive policy on app_configurations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'app_configurations'
      AND policyname = 'Block non-admin app_configurations access'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Block non-admin app_configurations access"
      ON public.app_configurations
      AS RESTRICTIVE
      FOR ALL
      TO public
      USING (
        EXISTS (
          SELECT 1 FROM public.administradores a
          WHERE a.id = auth.uid() AND a.ativo = true
        )
        OR public.has_role(auth.uid(), 'helpadmin'::user_role)
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.administradores a
          WHERE a.id = auth.uid() AND a.ativo = true
        )
        OR public.has_role(auth.uid(), 'helpadmin'::user_role)
      );
    $p$;
  END IF;
END $$;