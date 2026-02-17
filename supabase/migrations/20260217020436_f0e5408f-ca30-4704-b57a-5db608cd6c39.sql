
-- Fix promotional_banners RLS
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Public can view active banners" ON public.promotional_banners;
DROP POLICY IF EXISTS "Admins can manage all banners" ON public.promotional_banners;
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.promotional_banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.promotional_banners;

-- Public can view active banners (no auth required for public-facing content)
CREATE POLICY "Public can view active banners"
ON public.promotional_banners FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all banners"
ON public.promotional_banners FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (public.has_role(auth.uid(), 'helpadmin'::user_role));
