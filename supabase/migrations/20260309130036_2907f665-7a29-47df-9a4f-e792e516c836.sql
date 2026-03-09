
-- 1. Fix profiles RLS: remove the overly permissive policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- 2. Fix security_audit_log: restrict INSERT to own user_id only
DROP POLICY IF EXISTS "Authenticated users can insert security logs" ON public.security_audit_log;
DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.security_audit_log;

CREATE POLICY "Users can insert own security logs"
ON public.security_audit_log FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 3. Fix job_listings: add owner_id column for proper ownership
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Backfill owner_id from profiles matching company_email
UPDATE public.job_listings jl
SET owner_id = p.id
FROM public.profiles p
WHERE p.email = jl.company_email AND jl.owner_id IS NULL;

-- Replace the vulnerable user_owns_job_listing function
CREATE OR REPLACE FUNCTION public.user_owns_job_listing(listing_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_listings
    WHERE id = listing_id AND owner_id = auth.uid()
  );
$$;
