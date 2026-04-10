
CREATE TABLE public.user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Only admins can view all locations
CREATE POLICY "Only helpadmin can view user locations"
  ON public.user_locations FOR SELECT
  USING (has_role(auth.uid(), 'helpadmin'::user_role));

-- Users can upsert their own location
CREATE POLICY "Users can insert own location"
  ON public.user_locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location"
  ON public.user_locations FOR UPDATE
  USING (auth.uid() = user_id);

-- No delete allowed
