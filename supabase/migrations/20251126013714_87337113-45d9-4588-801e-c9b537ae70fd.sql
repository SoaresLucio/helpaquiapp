-- Remove SECURITY DEFINER from all remaining views

-- Drop and recreate freelancer_ratings view without SECURITY DEFINER
DROP VIEW IF EXISTS public.freelancer_ratings CASCADE;

CREATE VIEW public.freelancer_ratings AS
SELECT 
  r.freelancer_id,
  AVG(r.rating) as avg_rating,
  COUNT(*) as rating_count
FROM public.reviews r
GROUP BY r.freelancer_id;

-- Drop and recreate verificacoes view without SECURITY DEFINER
DROP VIEW IF EXISTS public.verificacoes CASCADE;

CREATE VIEW public.verificacoes AS
SELECT 
  pv.id,
  pv.user_id,
  pv.verification_type as descricao,
  pv.status,
  pv.additional_data as documentos,
  pv.submitted_at,
  pv.created_at,
  pv.updated_at
FROM public.profile_verifications pv;