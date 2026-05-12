
-- Add cancellation tracking & block flag on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cancellation_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS account_blocked boolean NOT NULL DEFAULT false;

-- Add fields on service_requests for completion + feedback gating
ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS feedback_submitted boolean NOT NULL DEFAULT false;

-- Add released flag on payments to gate freelancer payout
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS released boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS released_at timestamp with time zone;

-- RPC: increment cancellation count for the calling user (or admin override)
CREATE OR REPLACE FUNCTION public.increment_cancellation_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  IF p_user_id IS DISTINCT FROM auth.uid()
     AND NOT public.has_role(auth.uid(), 'helpadmin'::user_role) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE public.profiles
  SET cancellation_count = COALESCE(cancellation_count, 0) + 1,
      account_blocked = (COALESCE(cancellation_count, 0) + 1) >= 3,
      updated_at = now()
  WHERE id = p_user_id
  RETURNING cancellation_count INTO new_count;

  RETURN COALESCE(new_count, 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_cancellation_count(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.increment_cancellation_count(uuid) TO authenticated;

-- RPC: can the calling user create a new help request?
CREATE OR REPLACE FUNCTION public.can_create_request()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT COALESCE(
    (SELECT account_blocked FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

REVOKE EXECUTE ON FUNCTION public.can_create_request() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.can_create_request() TO authenticated;

-- RPC: mark a service as completed + feedback submitted, releasing the payment
CREATE OR REPLACE FUNCTION public.mark_service_completed(p_request_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client uuid;
BEGIN
  SELECT client_id INTO v_client FROM public.service_requests WHERE id = p_request_id;
  IF v_client IS NULL THEN
    RAISE EXCEPTION 'Request not found';
  END IF;
  IF v_client <> auth.uid() THEN
    RAISE EXCEPTION 'Only the requester can mark as completed';
  END IF;

  UPDATE public.service_requests
  SET status = 'completed',
      completed_at = now(),
      feedback_submitted = true,
      updated_at = now()
  WHERE id = p_request_id;

  -- Release payments tied to this request (best-effort)
  UPDATE public.payments
  SET released = true, released_at = now(), updated_at = now()
  WHERE service_id = p_request_id::text AND status = 'paid' AND released = false;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_service_completed(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.mark_service_completed(uuid) TO authenticated;
