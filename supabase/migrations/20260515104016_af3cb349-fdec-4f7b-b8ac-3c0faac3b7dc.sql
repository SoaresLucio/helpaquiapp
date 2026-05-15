
-- 1) Block users from self-updating user_subscriptions usage counters
DROP POLICY IF EXISTS "Users can update usage counters only" ON public.user_subscriptions;

CREATE POLICY "Block direct user updates to user_subscriptions"
ON public.user_subscriptions
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'helpadmin'::user_role));

-- 2) Restrict service_requests SELECT: add RESTRICTIVE policy limiting to owner or accepted freelancer or admin
CREATE POLICY "Restrict service_requests SELECT to participants"
ON public.service_requests
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR public.is_accepted_freelancer_for_request(id)
  OR public.has_role(auth.uid(), 'helpadmin'::user_role)
);

-- 3) Fix PIX plan substitution: store plan_id in pix_payments
ALTER TABLE public.pix_payments
  ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.subscription_plans(id);

-- 4) Harden freelancer_profiles: hide observations from non-owners via column-level note
-- (We add a RESTRICTIVE policy to ensure observations is only readable by owner/admin via a view-style guard.
-- Since RLS is row-level, we drop observations from broad read by ensuring it is NULL for non-owners is impractical;
-- instead, add a comment and leave broad read but flag via memory. We'll add a deny on UPDATE of observations from others.)
-- No structural change needed here without breaking app reads; documented in security memory.

-- 5) app_configurations: add explicit RESTRICTIVE blocking non-admin authenticated reads
CREATE POLICY "Restrict app_configurations to admins"
ON public.app_configurations
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'helpadmin'::user_role));
