
CREATE OR REPLACE FUNCTION public.respond_to_hire_proposal(
  p_proposal_id uuid,
  p_accept boolean,
  p_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_proposal RECORD;
  v_request RECORD;
  v_new_count integer := 0;
  v_blocked boolean := false;
  v_admin RECORD;
  v_freelancer_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_proposal FROM public.service_proposals WHERE id = p_proposal_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proposal not found'; END IF;
  IF v_proposal.freelancer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the assigned freelancer can respond to this proposal';
  END IF;
  IF v_proposal.status <> 'pending' THEN
    RAISE EXCEPTION 'Proposal already %', v_proposal.status;
  END IF;

  SELECT * INTO v_request FROM public.service_requests WHERE id = v_proposal.service_request_id;

  SELECT COALESCE(NULLIF(TRIM(CONCAT_WS(' ', first_name, last_name)), ''), 'Freelancer')
    INTO v_freelancer_name
  FROM public.profiles WHERE id = auth.uid();

  IF p_accept THEN
    UPDATE public.service_proposals
       SET status = 'accepted', updated_at = now()
     WHERE id = p_proposal_id;

    UPDATE public.service_requests
       SET status = 'in_progress', updated_at = now()
     WHERE id = v_proposal.service_request_id;

    INSERT INTO public.notifications (user_id, title, message, type, metadata)
    VALUES (
      v_request.client_id,
      'Help aceito pelo freelancer',
      v_freelancer_name || ' aceitou seu Help "' || COALESCE(v_request.title,'') || '". O endereço foi liberado e o serviço já pode ser executado.',
      'success',
      jsonb_build_object('service_request_id', v_request.id, 'proposal_id', p_proposal_id, 'kind', 'hire_accepted')
    );

    RETURN jsonb_build_object('success', true, 'accepted', true);
  END IF;

  -- Rejection path
  UPDATE public.service_proposals
     SET status = 'rejected', message = COALESCE(p_reason, message), updated_at = now()
   WHERE id = p_proposal_id;

  UPDATE public.service_requests
     SET status = 'cancelled', updated_at = now()
   WHERE id = v_proposal.service_request_id;

  UPDATE public.profiles
     SET cancellation_count = COALESCE(cancellation_count, 0) + 1,
         account_blocked = (COALESCE(cancellation_count, 0) + 1) >= 3,
         updated_at = now()
   WHERE id = auth.uid()
   RETURNING cancellation_count, account_blocked INTO v_new_count, v_blocked;

  -- Notify client (refund will be processed manually by admin)
  INSERT INTO public.notifications (user_id, title, message, type, metadata)
  VALUES (
    v_request.client_id,
    'Help recusado pelo freelancer',
    v_freelancer_name || ' recusou seu Help "' || COALESCE(v_request.title,'') ||
      '". O valor pago será estornado integralmente após análise da equipe HelpAqui.' ||
      CASE WHEN p_reason IS NOT NULL AND length(trim(p_reason)) > 0
        THEN ' Motivo informado: ' || p_reason ELSE '' END,
    'warning',
    jsonb_build_object(
      'service_request_id', v_request.id,
      'proposal_id', p_proposal_id,
      'kind', 'hire_rejected',
      'reason', p_reason,
      'refund_status', 'pending_admin_review'
    )
  );

  -- Notify all administrators
  FOR v_admin IN
    SELECT user_id FROM public.user_roles WHERE role = 'helpadmin'::user_role
  LOOP
    INSERT INTO public.notifications (user_id, title, message, type, metadata)
    VALUES (
      v_admin.user_id,
      'Recusa de Help — análise de estorno',
      v_freelancer_name || ' recusou um Help. Recusas acumuladas: ' || v_new_count ||
        CASE WHEN v_blocked THEN ' (conta BLOQUEADA).' ELSE '.' END ||
        ' Solicitante aguarda estorno integral.',
      CASE WHEN v_blocked THEN 'error' ELSE 'warning' END,
      jsonb_build_object(
        'service_request_id', v_request.id,
        'proposal_id', p_proposal_id,
        'freelancer_id', auth.uid(),
        'client_id', v_request.client_id,
        'cancellation_count', v_new_count,
        'account_blocked', v_blocked,
        'reason', p_reason,
        'kind', 'hire_rejected_admin'
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'accepted', false,
    'cancellation_count', v_new_count,
    'account_blocked', v_blocked
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.respond_to_hire_proposal(uuid, boolean, text) TO authenticated;

-- Allow freelancers to read their own pending proposals (if not already covered)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='service_proposals'
      AND policyname='Freelancers can view own proposals'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Freelancers can view own proposals"
      ON public.service_proposals
      FOR SELECT
      TO authenticated
      USING (freelancer_id = auth.uid());
    $p$;
  END IF;
END $$;
