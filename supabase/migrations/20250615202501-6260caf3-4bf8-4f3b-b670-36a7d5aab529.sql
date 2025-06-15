
-- Criar tabela para armazenar assinaturas dos usuários
CREATE TABLE IF NOT EXISTS public.user_subscriptions_flow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  payment_reference TEXT,
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card', 'debit_card')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.user_subscriptions_flow ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias assinaturas
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions_flow 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias assinaturas
CREATE POLICY "Users can create their own subscriptions" 
ON public.user_subscriptions_flow 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias assinaturas
CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions_flow 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_updated_at
    BEFORE UPDATE ON public.user_subscriptions_flow
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Criar tabela para armazenar códigos PIX gerados
CREATE TABLE IF NOT EXISTS public.pix_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions_flow(id) ON DELETE CASCADE,
  pix_code TEXT NOT NULL,
  qr_code_url TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security para pagamentos PIX
ALTER TABLE public.pix_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para pagamentos PIX
CREATE POLICY "Users can view their own pix payments" 
ON public.pix_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pix payments" 
ON public.pix_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pix payments" 
ON public.pix_payments 
FOR UPDATE 
USING (auth.uid() = user_id);
