
-- Fix: Prevent users from self-promoting verified status
-- Drop existing permissive UPDATE policies and recreate with WITH CHECK

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  verified IS NOT DISTINCT FROM (SELECT p.verified FROM public.profiles p WHERE p.id = auth.uid())
);
