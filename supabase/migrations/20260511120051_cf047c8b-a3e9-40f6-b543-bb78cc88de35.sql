
-- Public profile RPC: returns only non-sensitive fields + aggregate stats
CREATE OR REPLACE FUNCTION public.get_public_profile(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  first_name text,
  last_name text,
  avatar_url text,
  user_type text,
  verified boolean,
  member_since timestamp with time zone,
  reviews_count bigint,
  average_rating numeric,
  services_completed bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.user_type,
    COALESCE(p.verified, false) AS verified,
    p.created_at AS member_since,
    COALESCE((SELECT COUNT(*) FROM public.reviews r WHERE r.freelancer_id = p.id), 0) AS reviews_count,
    COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 2) FROM public.reviews r WHERE r.freelancer_id = p.id), 0) AS average_rating,
    COALESCE((SELECT COUNT(*) FROM public.payments pay WHERE pay.freelancer_id = p.id AND pay.status = 'paid'), 0) AS services_completed
  FROM public.profiles p
  WHERE p.id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated, anon;

-- Public reviews fetcher (avoids exposing reviewer PII beyond first name)
CREATE OR REPLACE FUNCTION public.get_public_reviews(p_freelancer_id uuid, p_limit int DEFAULT 20)
RETURNS TABLE(
  id uuid,
  rating smallint,
  comment text,
  created_at timestamp with time zone,
  reviewer_first_name text,
  reviewer_avatar_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    r.id,
    r.rating,
    r.comment,
    r.created_at,
    p.first_name AS reviewer_first_name,
    p.avatar_url AS reviewer_avatar_url
  FROM public.reviews r
  LEFT JOIN public.profiles p ON p.id = r.reviewer_id
  WHERE r.freelancer_id = p_freelancer_id
  ORDER BY r.created_at DESC
  LIMIT GREATEST(1, LEAST(p_limit, 100));
$$;

GRANT EXECUTE ON FUNCTION public.get_public_reviews(uuid, int) TO authenticated, anon;
