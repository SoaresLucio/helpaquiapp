
-- Helper SECURITY DEFINER functions to break RLS mutual recursion between
-- service_requests and service_proposals.

CREATE OR REPLACE FUNCTION public.is_request_owner(_request_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.service_requests
    WHERE id = _request_id AND client_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_accepted_freelancer_for_request(_request_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.service_proposals
    WHERE service_request_id = _request_id
      AND freelancer_id = auth.uid()
      AND status = 'accepted'
  );
$$;

-- Replace recursive SELECT policy on service_requests
DROP POLICY IF EXISTS "Owners and matched freelancers can view full requests" ON public.service_requests;
CREATE POLICY "Owners and matched freelancers can view full requests"
ON public.service_requests
FOR SELECT
USING (
  client_id = auth.uid()
  OR public.is_accepted_freelancer_for_request(id)
);

-- Clean up duplicate / recursive SELECT policies on service_proposals
DROP POLICY IF EXISTS "Clients can view proposals for their requests" ON public.service_proposals;
DROP POLICY IF EXISTS "Request owners view proposals" ON public.service_proposals;
DROP POLICY IF EXISTS "Users can view relevant proposals" ON public.service_proposals;
DROP POLICY IF EXISTS "Freelancers can view their own proposals" ON public.service_proposals;
DROP POLICY IF EXISTS "Freelancers can view own proposals" ON public.service_proposals;

CREATE POLICY "Request owners can view proposals"
ON public.service_proposals
FOR SELECT
USING (public.is_request_owner(service_request_id));

CREATE POLICY "Freelancers can view own proposals"
ON public.service_proposals
FOR SELECT
USING (freelancer_id = auth.uid());
