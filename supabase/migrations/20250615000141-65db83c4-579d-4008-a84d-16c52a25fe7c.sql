
-- Verificar e criar bucket para admin-uploads se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-uploads', 'admin-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Verificar se as policies para o bucket existem e criar se necessário
-- Policy para visualização pública
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view admin uploads'
  ) THEN
    CREATE POLICY "Public can view admin uploads" ON storage.objects
    FOR SELECT USING (bucket_id = 'admin-uploads');
  END IF;
END $$;

-- Policy para admins fazerem upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can upload files'
  ) THEN
    CREATE POLICY "Admins can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'admin-uploads' AND
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'helpadmin'
      )
    );
  END IF;
END $$;

-- Policy para admins atualizarem arquivos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can update files'
  ) THEN
    CREATE POLICY "Admins can update files" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'admin-uploads' AND
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'helpadmin'
      )
    );
  END IF;
END $$;

-- Policy para admins deletarem arquivos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Admins can delete files'
  ) THEN
    CREATE POLICY "Admins can delete files" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'admin-uploads' AND
      auth.uid() IN (
        SELECT user_id FROM user_roles WHERE role = 'helpadmin'
      )
    );
  END IF;
END $$;

-- Verificar se a tabela promotional_banners existe
CREATE TABLE IF NOT EXISTS promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  cta_text TEXT,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('solicitante', 'freelancer', 'both')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Adicionar trigger para updated_at
DROP TRIGGER IF EXISTS promotional_banners_updated_at ON promotional_banners;
CREATE TRIGGER promotional_banners_updated_at
  BEFORE UPDATE ON promotional_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
