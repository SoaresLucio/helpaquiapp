
-- 1. Remove permissive broadcast policies on public.messages
DROP POLICY IF EXISTS "authenticated_can_receive_broadcast" ON public.messages;
DROP POLICY IF EXISTS "authenticated_can_send_broadcast" ON public.messages;

-- 2. Add scoped SELECT policies on storage.objects for public buckets
-- Restrict LISTING/enumeration via API. Direct CDN URLs (public bucket flag) still work.
DROP POLICY IF EXISTS "Avatars: users list own folder" ON storage.objects;
CREATE POLICY "Avatars: users list own folder"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Banner images: admin list" ON storage.objects;
CREATE POLICY "Banner images: admin list"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'banner-images'
  AND (
    public.has_role(auth.uid(), 'helpadmin'::user_role)
    OR EXISTS (SELECT 1 FROM public.administradores a WHERE a.id = auth.uid() AND a.ativo = true)
  )
);

DROP POLICY IF EXISTS "Admin uploads: admin list" ON storage.objects;
CREATE POLICY "Admin uploads: admin list"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'admin-uploads'
  AND (
    public.has_role(auth.uid(), 'helpadmin'::user_role)
    OR EXISTS (SELECT 1 FROM public.administradores a WHERE a.id = auth.uid() AND a.ativo = true)
  )
);
