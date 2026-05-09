
-- 1. Drop permissive broadcast policies on public.messages
DROP POLICY IF EXISTS "authenticated_can_receive_broadcast" ON public.messages;
DROP POLICY IF EXISTS "authenticated_can_send_broadcast" ON public.messages;

-- 2. Restrict user_subscriptions_flow updates to non-tier fields only
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions_flow;

-- Add a restrictive policy that prevents users from modifying tier/billing fields
CREATE POLICY "Users update own subscription flow non-tier fields"
ON public.user_subscriptions_flow
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan_name IS NOT DISTINCT FROM (SELECT plan_name FROM public.user_subscriptions_flow WHERE id = user_subscriptions_flow.id)
  AND plan_price IS NOT DISTINCT FROM (SELECT plan_price FROM public.user_subscriptions_flow WHERE id = user_subscriptions_flow.id)
  AND status IS NOT DISTINCT FROM (SELECT status FROM public.user_subscriptions_flow WHERE id = user_subscriptions_flow.id)
  AND end_date IS NOT DISTINCT FROM (SELECT end_date FROM public.user_subscriptions_flow WHERE id = user_subscriptions_flow.id)
);

-- 3. Add RESTRICTIVE policy on administradores so only helpadmin role can manage
CREATE POLICY "Restrict administradores writes to helpadmin"
ON public.administradores
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'helpadmin'::user_role));
