
-- Criar tabela para informações dos freelancers
CREATE TABLE public.freelancer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  portfolio_photos JSONB DEFAULT '[]'::jsonb,
  observations TEXT,
  hourly_rate INTEGER, -- em centavos
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para ofertas de ajuda dos freelancers
CREATE TABLE public.freelancer_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id UUID REFERENCES public.freelancer_profiles(id) NOT NULL,
  service_request_id UUID REFERENCES public.service_requests(id) NOT NULL,
  offered_value INTEGER NOT NULL, -- em centavos
  message TEXT,
  availability TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_offers ENABLE ROW LEVEL SECURITY;

-- Políticas para freelancer_profiles
CREATE POLICY "Usuários podem ver perfis de freelancers"
  ON public.freelancer_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Freelancers podem criar/atualizar seus próprios perfis"
  ON public.freelancer_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para freelancer_offers
CREATE POLICY "Solicitantes podem ver ofertas para seus serviços"
  ON public.freelancer_offers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests sr
      WHERE sr.id = service_request_id
      AND sr.client_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers podem criar ofertas"
  ON public.freelancer_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.freelancer_profiles fp
      WHERE fp.id = freelancer_id
      AND fp.user_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers podem atualizar suas próprias ofertas"
  ON public.freelancer_offers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.freelancer_profiles fp
      WHERE fp.id = freelancer_id
      AND fp.user_id = auth.uid()
    )
  );

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_freelancer_profiles()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_freelancer_profiles_updated_at
    BEFORE UPDATE ON public.freelancer_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_freelancer_profiles();

CREATE TRIGGER update_freelancer_offers_updated_at
    BEFORE UPDATE ON public.freelancer_offers
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_freelancer_profiles();
