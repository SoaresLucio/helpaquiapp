-- Fix SECURITY DEFINER views by setting security_invoker = true

-- Fix admin_permissions view
ALTER VIEW public.admin_permissions
SET (security_invoker = true);

-- Fix freelancer_ratings view
ALTER VIEW public.freelancer_ratings
SET (security_invoker = true);

-- Fix verificacoes view
ALTER VIEW public.verificacoes
SET (security_invoker = true);