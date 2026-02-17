
-- Add RLS policies for service_proposals table
DROP POLICY IF EXISTS "Freelancers manage own proposals" ON public.service_proposals;
DROP POLICY IF EXISTS "Request owners view proposals" ON public.service_proposals;
DROP POLICY IF EXISTS "Admins view all proposals" ON public.service_proposals;

-- Freelancers can manage their own proposals
CREATE POLICY "Freelancers manage own proposals"
ON public.service_proposals FOR ALL
TO authenticated
USING (auth.uid() = freelancer_id)
WITH CHECK (auth.uid() = freelancer_id);

-- Service request owners can view proposals on their requests
CREATE POLICY "Request owners view proposals"
ON public.service_proposals FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests
    WHERE id = service_proposals.service_request_id
    AND client_id = auth.uid()
  )
);

-- Admins can view all proposals
CREATE POLICY "Admins view all proposals"
ON public.service_proposals FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role));
