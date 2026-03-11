
-- Create empresa_profiles table
CREATE TABLE public.empresa_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cnpj text NOT NULL,
  company_name text NOT NULL,
  responsible_name text NOT NULL,
  employee_count text,
  purpose text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.empresa_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own empresa profile"
  ON public.empresa_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view empresa profiles"
  ON public.empresa_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Updated_at trigger
CREATE TRIGGER update_empresa_profiles_updated_at
  BEFORE UPDATE ON public.empresa_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert empresa subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, features, max_requests_per_month, max_messages_per_month, priority_support, user_type)
VALUES 
  ('Empresa Free', 0, '["Divulgar até 5 vagas de emprego por mês", "Perfil básico da empresa", "Acesso ao chat", "Visualização de freelancers"]'::jsonb, 5, 10, false, 'empresa'),
  ('Empresa Ouro', 99.90, '["Divulgar até 50 vagas de emprego por mês", "Perfil destacado da empresa", "Divulgação premium no app", "Chat ilimitado", "Suporte prioritário", "Relatórios de desempenho", "Selo empresa verificada", "Acesso a freelancers premium"]'::jsonb, 50, -1, true, 'empresa');
