
DROP POLICY IF EXISTS "authenticated_can_receive_broadcast" ON public.messages;
DROP POLICY IF EXISTS "authenticated_can_send_broadcast" ON public.messages;

DROP POLICY IF EXISTS "Users can insert own location" ON public.user_locations;
CREATE POLICY "Users can insert own location"
ON public.user_locations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())::text
);

DROP POLICY IF EXISTS "Users can update own location" ON public.user_locations;
CREATE POLICY "Users can update own location"
ON public.user_locations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND email = (SELECT u.email FROM auth.users u WHERE u.id = auth.uid())::text
);
