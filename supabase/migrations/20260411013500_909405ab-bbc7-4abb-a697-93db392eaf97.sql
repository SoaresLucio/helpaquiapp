-- Fix the UPDATE policy to include WITH CHECK clause for upsert support
DROP POLICY IF EXISTS "Users can update own location" ON public.user_locations;

CREATE POLICY "Users can update own location"
ON public.user_locations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);