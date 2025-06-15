
-- Habilitar RLS na tabela bank_details se ainda não estiver habilitado
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados bancários
DROP POLICY IF EXISTS "Users can view their own bank details" ON public.bank_details;
CREATE POLICY "Users can view their own bank details" 
  ON public.bank_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios dados bancários
DROP POLICY IF EXISTS "Users can insert their own bank details" ON public.bank_details;
CREATE POLICY "Users can insert their own bank details" 
  ON public.bank_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios dados bancários
DROP POLICY IF EXISTS "Users can update their own bank details" ON public.bank_details;
CREATE POLICY "Users can update their own bank details" 
  ON public.bank_details 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios dados bancários
DROP POLICY IF EXISTS "Users can delete their own bank details" ON public.bank_details;
CREATE POLICY "Users can delete their own bank details" 
  ON public.bank_details 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar tabela para métodos de pagamento se não existir
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  method_type TEXT NOT NULL, -- 'credit_card', 'debit_card', 'pix', etc.
  card_last_four TEXT,
  card_brand TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_default UNIQUE (user_id, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- Habilitar RLS na tabela payment_methods
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para payment_methods
CREATE POLICY "Users can view their own payment methods" 
  ON public.payment_methods 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods" 
  ON public.payment_methods 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" 
  ON public.payment_methods 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" 
  ON public.payment_methods 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_payment_methods()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON public.payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON public.payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_payment_methods();

-- Garantir que a coluna user_id seja obrigatória nas duas tabelas
ALTER TABLE public.bank_details ALTER COLUMN user_id SET NOT NULL;

-- Adicionar constraint de unique para evitar duplicatas de dados bancários por usuário
ALTER TABLE public.bank_details 
ADD CONSTRAINT unique_user_bank_details 
UNIQUE (user_id);
