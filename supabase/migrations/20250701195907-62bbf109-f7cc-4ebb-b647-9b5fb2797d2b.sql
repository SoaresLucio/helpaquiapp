
-- Primeiro, vamos renomear os planos existentes e adicionar os novos recursos
UPDATE subscription_plans 
SET name = 'Help Bronze' 
WHERE name = 'Help Free';

UPDATE subscription_plans 
SET name = 'Help Prata' 
WHERE name = 'Help Medium';

UPDATE subscription_plans 
SET name = 'Help Ouro' 
WHERE name = 'Help Maximum';

-- Atualizar as features e limites dos planos para Freelancers
UPDATE subscription_plans 
SET 
  max_requests_per_month = 4,
  features = '[
    "Até 4 serviços aceitos por mês",
    "Acesso limitado ao perfil dos solicitantes", 
    "Acesso ao centro de dicas e boas práticas",
    "Exibição limitada no mapa",
    "Limite de 6 mensagens com solicitantes diferentes",
    "Só pode responder mensagens (não pode iniciar)"
  ]'::jsonb
WHERE name = 'Help Bronze' AND user_type = 'freelancer';

UPDATE subscription_plans 
SET 
  max_requests_per_month = 10,
  features = '[
    "Até 10 serviços por mês",
    "Limite de 17 mensagens com solicitantes diferentes", 
    "1 divulgação semanal no app com arte própria",
    "Suporte humanizado via chat",
    "Destaque nos resultados de busca",
    "Agendamento automático de divulgação",
    "Painel com métricas de visualização e alcance"
  ]'::jsonb
WHERE name = 'Help Prata' AND user_type = 'freelancer';

UPDATE subscription_plans 
SET 
  max_requests_per_month = -1,
  features = '[
    "Ofertas de help e mensagens ilimitados",
    "3 divulgações semanais no app e redes sociais",
    "Pode usar arte própria ou HelpAqui cria para ele",
    "Ver ofertas de serviço com 3 minutos de antecedência",
    "Selo Perfil Recomendado após 30 serviços concluídos",
    "Link de portfólio personalizado",
    "Respostas automáticas e filtros por tipo de serviço",
    "Suporte prioritário"
  ]'::jsonb
WHERE name = 'Help Ouro' AND user_type = 'freelancer';

-- Atualizar as features e limites dos planos para Solicitantes
UPDATE subscription_plans 
SET 
  max_requests_per_month = 6,
  features = '[
    "Pode publicar até 6 solicitações por mês",
    "Limite de 6 mensagens com freelancers diferentes",
    "Só pode responder mensagens (não pode iniciar)",
    "Acesso limitado ao mapa de freelancers",
    "Sem prioridade nas buscas"
  ]'::jsonb
WHERE name = 'Help Bronze' AND user_type = 'solicitante';

UPDATE subscription_plans 
SET 
  max_requests_per_month = 10,
  features = '[
    "Até 10 solicitações por mês",
    "Limite de 17 mensagens com freelancers diferentes",
    "Só pode responder mensagens (não pode iniciar)",
    "Destaque nas buscas por freelancers",
    "Filtros avançados por avaliação, localização e preço",
    "Suporte básico"
  ]'::jsonb
WHERE name = 'Help Prata' AND user_type = 'solicitante';

UPDATE subscription_plans 
SET 
  max_requests_per_month = -1,
  features = '[
    "Solicitações de help e mensagens ilimitadas",
    "Solicitações destacadas no topo da lista",
    "Notificações automáticas para freelancers ideais",
    "Chat direto com profissionais recomendados",
    "Suporte dedicado"
  ]'::jsonb
WHERE name = 'Help Ouro' AND user_type = 'solicitante';

-- Adicionar coluna para limite de mensagens nos planos
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS max_messages_per_month INTEGER DEFAULT NULL;

-- Atualizar limites de mensagens para cada plano
UPDATE subscription_plans 
SET max_messages_per_month = 6 
WHERE name = 'Help Bronze';

UPDATE subscription_plans 
SET max_messages_per_month = 17 
WHERE name = 'Help Prata';

UPDATE subscription_plans 
SET max_messages_per_month = -1 
WHERE name = 'Help Ouro';

-- Adicionar coluna para contar mensagens usadas no mês
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS messages_used_this_month INTEGER DEFAULT 0;

-- Adicionar coluna para contar visualizações do perfil
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS profile_views_this_month INTEGER DEFAULT 0;

-- Criar tabela para rastrear conversas únicas (para limite de mensagens)
CREATE TABLE IF NOT EXISTS user_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  message_count INTEGER DEFAULT 0,
  UNIQUE(user_id, other_user_id)
);

-- Habilitar RLS na tabela de conversas
ALTER TABLE user_conversations ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas suas próprias conversas
CREATE POLICY "Users can manage their own conversations" ON user_conversations
FOR ALL USING (auth.uid() = user_id OR auth.uid() = other_user_id);

-- Criar função para verificar limite de mensagens
CREATE OR REPLACE FUNCTION check_message_limit(p_user_id UUID, p_other_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  current_plan RECORD;
  conversation_count INTEGER;
BEGIN
  -- Buscar plano atual do usuário
  SELECT sp.max_messages_per_month, us.messages_used_this_month
  INTO current_plan
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active'
    AND (us.current_period_end IS NULL OR us.current_period_end > now());
  
  -- Se não encontrou plano ativo, usar plano gratuito
  IF NOT FOUND THEN
    SELECT max_messages_per_month INTO current_plan
    FROM subscription_plans 
    WHERE name = 'Help Bronze' AND user_type = 'solicitante';
  END IF;
  
  -- Se mensagens ilimitadas
  IF current_plan.max_messages_per_month = -1 THEN
    RETURN true;
  END IF;
  
  -- Contar conversas únicas do usuário no mês atual
  SELECT COUNT(DISTINCT other_user_id)
  INTO conversation_count
  FROM user_conversations
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());
  
  -- Verificar se pode iniciar nova conversa
  RETURN conversation_count < current_plan.max_messages_per_month;
END;
$$;
