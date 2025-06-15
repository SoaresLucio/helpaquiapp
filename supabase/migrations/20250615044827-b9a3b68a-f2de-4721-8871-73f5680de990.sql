
-- Criar tabela para ofertas de freelancers (ofertas proativas de serviços)
CREATE TABLE IF NOT EXISTS public.freelancer_service_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  freelancer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  categories TEXT[] NOT NULL, -- Array de categorias
  location TEXT,
  rate TEXT NOT NULL, -- Valor/hora ou taxa
  photos TEXT[] DEFAULT '{}', -- Array de URLs das fotos
  custom_categories TEXT[] DEFAULT '{}', -- Categorias personalizadas
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.freelancer_service_offers ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Freelancers can manage their own service offers" ON public.freelancer_service_offers;
DROP POLICY IF EXISTS "Users can view active service offers" ON public.freelancer_service_offers;

-- Política para freelancers verem e editarem suas próprias ofertas
CREATE POLICY "Freelancers can manage their own service offers" 
  ON public.freelancer_service_offers 
  FOR ALL 
  USING (auth.uid() = freelancer_id);

-- Política para TODOS os usuários autenticados verem todas as ofertas ativas
CREATE POLICY "Authenticated users can view all active service offers" 
  ON public.freelancer_service_offers 
  FOR SELECT 
  USING (is_active = true AND auth.role() = 'authenticated');

-- Habilitar realtime para a tabela
ALTER TABLE public.freelancer_service_offers REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'freelancer_service_offers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.freelancer_service_offers;
  END IF;
END $$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_freelancer_service_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_freelancer_service_offers_updated_at ON public.freelancer_service_offers;
CREATE TRIGGER update_freelancer_service_offers_updated_at
    BEFORE UPDATE ON public.freelancer_service_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_freelancer_service_offers_updated_at();
