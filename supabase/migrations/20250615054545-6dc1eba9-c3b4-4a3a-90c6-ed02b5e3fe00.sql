
-- Criar tabela para rastrear interesse dos solicitantes nas ofertas de freelancers
CREATE TABLE public.offer_interests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  offer_id UUID NOT NULL REFERENCES freelancer_service_offers(id) ON DELETE CASCADE,
  solicitante_id UUID NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Habilitar RLS
ALTER TABLE public.offer_interests ENABLE ROW LEVEL SECURITY;

-- Política para solicitantes verem seus próprios interesses
CREATE POLICY "Solicitantes can view their own interests" 
  ON public.offer_interests 
  FOR SELECT 
  USING (auth.uid() = solicitante_id);

-- Política para solicitantes criarem interesses
CREATE POLICY "Solicitantes can create interests" 
  ON public.offer_interests 
  FOR INSERT 
  WITH CHECK (auth.uid() = solicitante_id);

-- Política para freelancers verem interesses em suas ofertas
CREATE POLICY "Freelancers can view interests in their offers" 
  ON public.offer_interests 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_service_offers 
      WHERE id = offer_id AND freelancer_id = auth.uid()
    )
  );

-- Política para freelancers atualizarem status dos interesses
CREATE POLICY "Freelancers can update interest status" 
  ON public.offer_interests 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM freelancer_service_offers 
      WHERE id = offer_id AND freelancer_id = auth.uid()
    )
  );

-- Criar tabela para candidaturas de freelancers aos pedidos de solicitantes
CREATE TABLE public.service_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL,
  proposed_price INTEGER,
  message TEXT,
  estimated_time TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.service_applications ENABLE ROW LEVEL SECURITY;

-- Política para freelancers verem suas próprias candidaturas
CREATE POLICY "Freelancers can view their own applications" 
  ON public.service_applications 
  FOR SELECT 
  USING (auth.uid() = freelancer_id);

-- Política para freelancers criarem candidaturas
CREATE POLICY "Freelancers can create applications" 
  ON public.service_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() = freelancer_id);

-- Política para freelancers atualizarem suas candidaturas
CREATE POLICY "Freelancers can update their applications" 
  ON public.service_applications 
  FOR UPDATE 
  USING (auth.uid() = freelancer_id);

-- Política para solicitantes verem candidaturas em seus pedidos
CREATE POLICY "Solicitantes can view applications to their requests" 
  ON public.service_applications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM service_requests 
      WHERE id = service_request_id AND client_id = auth.uid()
    )
  );

-- Política para solicitantes atualizarem status das candidaturas
CREATE POLICY "Solicitantes can update application status" 
  ON public.service_applications 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM service_requests 
      WHERE id = service_request_id AND client_id = auth.uid()
    )
  );

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_service_applications_updated_at
  BEFORE UPDATE ON public.service_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
