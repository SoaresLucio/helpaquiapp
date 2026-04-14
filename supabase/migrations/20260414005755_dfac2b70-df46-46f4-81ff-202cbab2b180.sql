-- Fix: Add 'empresa' to the allowed user_type values
ALTER TABLE public.profiles DROP CONSTRAINT profiles_user_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_type_check CHECK (user_type = ANY (ARRAY['solicitante'::text, 'freelancer'::text, 'empresa'::text, 'ambos'::text]));