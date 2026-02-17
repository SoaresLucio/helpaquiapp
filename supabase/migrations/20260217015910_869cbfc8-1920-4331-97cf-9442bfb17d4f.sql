
-- FIX 1: Enable RLS on service_proposals
ALTER TABLE public.service_proposals ENABLE ROW LEVEL SECURITY;

-- FIX 2: Reviews - Replace USING(true) with authenticated-only
DROP POLICY IF EXISTS "Allow public read access to reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews"
ON public.reviews FOR SELECT
USING (auth.role() = 'authenticated');

-- FIX 3: Remove overly permissive profiles policies
DROP POLICY IF EXISTS "Admins can modify all data" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all data" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));

-- FIX 4: Remove overly permissive administradores policies
DROP POLICY IF EXISTS "Admins can modify admin data" ON public.administradores;
DROP POLICY IF EXISTS "Admins can read admin data" ON public.administradores;

-- FIX 5: Remove overly permissive promotional_banners policies
DROP POLICY IF EXISTS "Admins can modify all banners" ON public.promotional_banners;
DROP POLICY IF EXISTS "Admins can read all banners" ON public.promotional_banners;

-- FIX 6: Fix payment_logs
DROP POLICY IF EXISTS "Service role can manage payment logs" ON public.payment_logs;
CREATE POLICY "Admins can manage payment logs"
ON public.payment_logs FOR ALL
USING (has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));

-- FIX 7: Fix ai_support_conversations
DROP POLICY IF EXISTS "Admins can view all AI conversations" ON public.ai_support_conversations;
CREATE POLICY "Admins can view all AI conversations"
ON public.ai_support_conversations FOR SELECT
USING (has_role(auth.uid(), 'helpadmin'::user_role));

-- FIX 8: Fix ai_support_messages
DROP POLICY IF EXISTS "Admins can view all AI messages" ON public.ai_support_messages;
CREATE POLICY "Admins can view all AI messages"
ON public.ai_support_messages FOR SELECT
USING (has_role(auth.uid(), 'helpadmin'::user_role));
