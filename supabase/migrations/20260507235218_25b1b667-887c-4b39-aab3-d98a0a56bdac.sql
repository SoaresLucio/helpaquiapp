-- 1. View pública com coordenadas arredondadas (~500m de precisão) e endereço aproximado
CREATE OR REPLACE VIEW public.service_requests_public
WITH (security_invoker = on) AS
SELECT
  id,
  client_id,
  title,
  description,
  category,
  status,
  urgency,
  budget_min,
  budget_max,
  -- Arredonda para ~500m (0.005°)
  CASE WHEN location_lat IS NOT NULL THEN ROUND((location_lat / 0.005)::numeric) * 0.005 ELSE NULL END AS approx_lat,
  CASE WHEN location_lng IS NOT NULL THEN ROUND((location_lng / 0.005)::numeric) * 0.005 ELSE NULL END AS approx_lng,
  -- Mostra apenas a parte antes da primeira vírgula (bairro/cidade)
  CASE WHEN location_address IS NOT NULL THEN split_part(location_address, ',', 1) ELSE NULL END AS approx_address,
  created_at,
  updated_at
FROM public.service_requests
WHERE status = 'open';

GRANT SELECT ON public.service_requests_public TO authenticated, anon;

-- 2. Função para localização exata (dono ou freelancer com proposta aceita)
CREATE OR REPLACE FUNCTION public.get_service_request_precise_location(p_request_id uuid)
RETURNS TABLE (
  id uuid,
  location_lat double precision,
  location_lng double precision,
  location_address text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT sr.id, sr.location_lat, sr.location_lng, sr.location_address
  FROM public.service_requests sr
  WHERE sr.id = p_request_id
    AND (
      sr.client_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.service_proposals sp
        WHERE sp.service_request_id = sr.id
          AND sp.freelancer_id = auth.uid()
          AND sp.status = 'accepted'
      )
    );
$$;

GRANT EXECUTE ON FUNCTION public.get_service_request_precise_location(uuid) TO authenticated;

-- 3. Restringir SELECT direto na tabela service_requests
DROP POLICY IF EXISTS "Authenticated users can view open or own service requests" ON public.service_requests;

CREATE POLICY "Owners and matched freelancers can view full requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (
  client_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.service_proposals sp
    WHERE sp.service_request_id = service_requests.id
      AND sp.freelancer_id = auth.uid()
      AND sp.status = 'accepted'
  )
);