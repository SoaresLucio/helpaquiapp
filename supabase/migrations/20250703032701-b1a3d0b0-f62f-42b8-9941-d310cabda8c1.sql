-- Fix RLS policy typo: change 'helladmin' to 'helpadmin'
-- This corrects the administrator role name for proper permissions

-- Drop and recreate the policies with correct role name
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view messages from their tickets" ON public.support_messages;
DROP POLICY IF EXISTS "Admins can update verifications" ON public.profile_verifications;
DROP POLICY IF EXISTS "Users can view their own verifications" ON public.profile_verifications;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.promotional_banners;

-- Recreate policies with correct role name
CREATE POLICY "Admins can view all tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'helpadmin'));

CREATE POLICY "Users can view messages from their tickets" 
  ON public.support_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'helpadmin')
  );

CREATE POLICY "Admins can update verifications" 
  ON public.profile_verifications 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'helpadmin'));

CREATE POLICY "Users can view their own verifications" 
  ON public.profile_verifications 
  FOR SELECT 
  USING (has_role(auth.uid(), 'helpadmin'));

CREATE POLICY "Admins can update tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'helpadmin'));

CREATE POLICY "Admins can manage banners" 
  ON public.promotional_banners 
  FOR ALL 
  USING (has_role(auth.uid(), 'helpadmin'));