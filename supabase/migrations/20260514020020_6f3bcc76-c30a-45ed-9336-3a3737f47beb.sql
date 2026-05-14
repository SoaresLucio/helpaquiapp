-- The previous "FOR ALL" admin policy caused SELECT queries by non-admins to fail
-- because Postgres evaluated admin_has_role() (which they cannot EXECUTE) on every read.
DROP POLICY IF EXISTS "Banner admins manage banners" ON public.promotional_banners;

CREATE POLICY "Banner admins can insert banners"
ON public.promotional_banners
FOR INSERT
TO authenticated
WITH CHECK (public.admin_has_role(ARRAY['designer'::text, 'gerente'::text]));

CREATE POLICY "Banner admins can update banners"
ON public.promotional_banners
FOR UPDATE
TO authenticated
USING (public.admin_has_role(ARRAY['designer'::text, 'gerente'::text]))
WITH CHECK (public.admin_has_role(ARRAY['designer'::text, 'gerente'::text]));

CREATE POLICY "Banner admins can delete banners"
ON public.promotional_banners
FOR DELETE
TO authenticated
USING (public.admin_has_role(ARRAY['designer'::text, 'gerente'::text]));

-- Ensure authenticated users can call the helper when it is referenced in their own policies.
GRANT EXECUTE ON FUNCTION public.admin_has_role(text[]) TO authenticated;