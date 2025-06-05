
-- Fix typo in RLS policy for support_tickets
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

CREATE POLICY "Admins can update tickets" 
  ON public.support_tickets 
  FOR UPDATE 
  USING (public.has_role(auth.uid(), 'helpadmin'));
