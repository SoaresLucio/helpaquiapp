
-- 1. Make chat-attachments private and restrict access to conversation participants
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

DROP POLICY IF EXISTS "Chat attachments are publicly readable" ON storage.objects;

CREATE POLICY "Chat participants can read attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE ((storage.foldername(name))[1])::uuid IN (c.client_id, c.freelancer_id)
        AND auth.uid() IN (c.client_id, c.freelancer_id)
    )
  )
);

-- 2. Scope service_requests "manage" ALL policy to authenticated role only
DROP POLICY IF EXISTS "Users can manage their own service requests" ON public.service_requests;
CREATE POLICY "Users can manage their own service requests"
ON public.service_requests FOR ALL TO authenticated
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- 3. Remove redundant/misleading service_role JWT check from user_subscriptions_flow restrictive policies
DROP POLICY IF EXISTS "Block non-admin user_subscriptions_flow inserts" ON public.user_subscriptions_flow;
CREATE POLICY "Block non-admin user_subscriptions_flow inserts"
ON public.user_subscriptions_flow AS RESTRICTIVE FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'helpadmin'::user_role)
  OR (
    user_id = auth.uid()
    AND COALESCE(plan_price, 0) = 0
    AND COALESCE(status, 'inactive') = ANY (ARRAY['inactive','free','trial'])
  )
);

DROP POLICY IF EXISTS "Block regular user_subscriptions_flow updates" ON public.user_subscriptions_flow;
CREATE POLICY "Block regular user_subscriptions_flow updates"
ON public.user_subscriptions_flow AS RESTRICTIVE FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));
