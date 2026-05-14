
CREATE OR REPLACE FUNCTION public.notify_freelancer_of_hire(
  p_proposal_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_proposal RECORD;
  v_request RECORD;
  v_client_name text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_proposal FROM public.service_proposals WHERE id = p_proposal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  SELECT * INTO v_request FROM public.service_requests WHERE id = v_proposal.service_request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Request not found';
  END IF;

  -- Only the request owner (client) can trigger this notification
  IF v_request.client_id <> auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT COALESCE(NULLIF(TRIM(CONCAT_WS(' ', first_name, last_name)), ''), 'Solicitante')
    INTO v_client_name
  FROM public.profiles WHERE id = v_request.client_id;

  INSERT INTO public.notifications (user_id, title, message, type, metadata)
  VALUES (
    v_proposal.freelancer_id,
    'Novo Help para você confirmar',
    v_client_name || ' deseja contratar você para "' || COALESCE(v_request.title, 'um serviço') ||
      '". Valor combinado: R$ ' || to_char((COALESCE(v_proposal.proposed_price, v_request.budget_max, 0)::numeric)/100, 'FM999G999G999D00') ||
      '. Aceite ou recuse para liberar o endereço completo.',
    'info',
    jsonb_build_object(
      'kind', 'hire_proposal_created',
      'proposal_id', p_proposal_id,
      'service_request_id', v_request.id,
      'action_url', '/hire/respond/' || p_proposal_id::text
    )
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_freelancer_of_hire(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.notify_freelancer_of_hire(uuid) TO authenticated;
