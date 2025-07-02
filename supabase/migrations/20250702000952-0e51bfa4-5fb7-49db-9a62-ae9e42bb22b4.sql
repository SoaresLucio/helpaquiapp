-- Primeiro, vamos criar a tabela para PIX payments se não existir
CREATE TABLE IF NOT EXISTS public.pix_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  pix_code TEXT NOT NULL,
  qr_code_data TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own pix transactions" 
ON public.pix_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pix transactions" 
ON public.pix_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pix transactions" 
ON public.pix_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user_id ON public.pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_status ON public.pix_transactions(status);

-- Função para gerar código PIX único
CREATE OR REPLACE FUNCTION generate_pix_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..12 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;