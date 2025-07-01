
-- Atualizar nomes dos planos existentes
UPDATE subscription_plans 
SET name = 'Help Bronze' 
WHERE name = 'Help Free';

UPDATE subscription_plans 
SET name = 'Help Prata' 
WHERE name = 'Help Medium';

UPDATE subscription_plans 
SET name = 'Help Ouro' 
WHERE name = 'Help Maximum';

-- Atualizar recursos dos planos para freelancers
UPDATE subscription_plans 
SET 
  features = '[
    "Até 4 serviços aceitos por mês",
    "Acesso limitado ao perfil dos solicitantes", 
    "Acesso ao centro de dicas e boas práticas",
    "Exibição limitada no mapa",
    "Limite de 6 mensagens com solicitantes diferentes"
  ]',
  max_requests_per_month = 4,
  max_messages_per_month = 6
WHERE name = 'Help Bronze' AND user_type = 'freelancer';

UPDATE subscription_plans 
SET 
  features = '[
    "Até 10 serviços por mês",
    "Limite de 17 mensagens com solicitantes diferentes",
    "1 divulgação semanal no app com arte própria",
    "Suporte humanizado via chat",
    "Destaque nos resultados de busca",
    "Agendamento automático de divulgação",
    "Painel com métricas de visualização e alcance"
  ]',
  max_requests_per_month = 10,
  max_messages_per_month = 17
WHERE name = 'Help Prata' AND user_type = 'freelancer';

UPDATE subscription_plans 
SET 
  features = '[
    "Ofertas de help e mensagens ilimitados",
    "3 divulgações semanais no app e redes sociais",
    "Pode usar arte própria ou HelpAqui cria para ele",
    "Ver ofertas de serviço com 3 minutos de antecedência",
    "Selo \"Perfil Recomendado\" após 30 serviços concluídos",
    "Link de portfólio personalizado (helpaqui.com/freelancer)",
    "Respostas automáticas e filtros por tipo de serviço",
    "Suporte prioritário"
  ]',
  max_requests_per_month = -1,
  max_messages_per_month = -1
WHERE name = 'Help Ouro' AND user_type = 'freelancer';

-- Atualizar recursos dos planos para solicitantes
UPDATE subscription_plans 
SET 
  features = '[
    "Pode publicar até 6 solicitações por mês",
    "Limite de 6 mensagens com freelancers diferentes",
    "Acesso limitado ao mapa de freelancers",
    "Sem prioridade nas buscas"
  ]',
  max_requests_per_month = 6,
  max_messages_per_month = 6
WHERE name = 'Help Bronze' AND user_type = 'solicitante';

UPDATE subscription_plans 
SET 
  features = '[
    "Até 10 solicitações por mês",
    "Limite de 17 mensagens com freelancers diferentes",
    "Destaque nas buscas por freelancers",
    "Filtros avançados por avaliação, localização e preço",
    "Suporte básico"
  ]',
  max_requests_per_month = 10,
  max_messages_per_month = 17
WHERE name = 'Help Prata' AND user_type = 'solicitante';

UPDATE subscription_plans 
SET 
  features = '[
    "Solicitações de help e mensagens ilimitadas",
    "Solicitações destacadas no topo da lista",
    "Notificações automáticas para freelancers ideais",
    "Chat direto com profissionais recomendados",
    "Suporte dedicado"
  ]',
  max_requests_per_month = -1,
  max_messages_per_month = -1
WHERE name = 'Help Ouro' AND user_type = 'solicitante';

-- Adicionar campo para rastrear mensagens usadas no mês atual
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS messages_used_this_month INTEGER DEFAULT 0;

-- Criar tabela para rastrear conversas de usuários
CREATE TABLE IF NOT EXISTS user_message_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  other_user_id UUID NOT NULL,
  first_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, other_user_id)
);

-- Habilitar RLS na tabela de rastreamento de mensagens
ALTER TABLE user_message_tracking ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seus próprios registros
CREATE POLICY "Users can manage their own message tracking" 
ON user_message_tracking 
FOR ALL 
USING (auth.uid() = user_id OR auth.uid() = other_user_id);
