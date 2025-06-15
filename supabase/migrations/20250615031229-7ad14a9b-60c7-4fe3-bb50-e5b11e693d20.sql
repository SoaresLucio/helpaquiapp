
-- Criar tabela para vagas de emprego
CREATE TABLE public.job_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL,
  description TEXT,
  job_type TEXT NOT NULL CHECK (job_type IN ('CLT', 'temporario')),
  location TEXT,
  salary_range TEXT,
  requirements TEXT,
  benefits TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para candidaturas
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_listing_id UUID REFERENCES public.job_listings(id),
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  message TEXT,
  resume_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Políticas para job_listings (todos podem ver vagas ativas)
CREATE POLICY "Anyone can view active job listings" 
  ON public.job_listings 
  FOR SELECT 
  USING (is_active = true);

-- Políticas para job_applications (freelancers podem inserir candidaturas)
CREATE POLICY "Freelancers can create applications" 
  ON public.job_applications 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Criar bucket para currículos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false);

-- Política para upload de currículos (só usuários autenticados)
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

-- Política para download de currículos (só usuários autenticados)
CREATE POLICY "Authenticated users can download resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- Inserir algumas vagas de exemplo
INSERT INTO public.job_listings (title, company_name, company_email, description, job_type, location, salary_range, requirements) VALUES
('Desenvolvedor Frontend React', 'TechCorp Ltda', 'rh@techcorp.com', 'Desenvolver interfaces modernas usando React e TypeScript', 'CLT', 'São Paulo, SP', 'R$ 8.000 - R$ 12.000', 'Experiência com React, TypeScript, Git'),
('Designer Gráfico', 'Creative Agency', 'contato@creative.com', 'Criação de materiais gráficos e identidade visual', 'temporario', 'Remote', 'R$ 3.000 - R$ 5.000', 'Adobe Creative Suite, Portfolio'),
('Analista de Marketing Digital', 'Marketing Pro', 'vagas@marketingpro.com', 'Gestão de campanhas digitais e análise de métricas', 'CLT', 'Rio de Janeiro, RJ', 'R$ 6.000 - R$ 9.000', 'Google Ads, Analytics, Redes Sociais');
