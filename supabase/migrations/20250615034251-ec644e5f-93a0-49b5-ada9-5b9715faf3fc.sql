
-- Primeiro, verificar se as políticas já existem e remover duplicatas se necessário
DO $$
BEGIN
    -- Remover políticas existentes para recriar
    DROP POLICY IF EXISTS "Freelancers can view all open service requests" ON public.service_requests;
    DROP POLICY IF EXISTS "Solicitantes can create service requests" ON public.service_requests;
    DROP POLICY IF EXISTS "Users can view their own service requests" ON public.service_requests;
    DROP POLICY IF EXISTS "Freelancers can create proposals" ON public.service_proposals;
    DROP POLICY IF EXISTS "Freelancers can view their own proposals" ON public.service_proposals;
    DROP POLICY IF EXISTS "Clients can view proposals for their requests" ON public.service_proposals;
END $$;

-- Habilitar RLS nas tabelas se ainda não estiver habilitado
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_proposals ENABLE ROW LEVEL SECURITY;

-- Criar políticas para service_requests
CREATE POLICY "Freelancers can view all open service requests" 
ON public.service_requests 
FOR SELECT 
USING (status = 'open');

CREATE POLICY "Solicitantes can create service requests" 
ON public.service_requests 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can view their own service requests" 
ON public.service_requests 
FOR SELECT 
USING (auth.uid() = client_id);

-- Criar políticas para service_proposals
CREATE POLICY "Freelancers can create proposals" 
ON public.service_proposals 
FOR INSERT 
WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers can view their own proposals" 
ON public.service_proposals 
FOR SELECT 
USING (auth.uid() = freelancer_id);

CREATE POLICY "Clients can view proposals for their requests" 
ON public.service_proposals 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.service_requests 
    WHERE id = service_request_id AND client_id = auth.uid()
  )
);
