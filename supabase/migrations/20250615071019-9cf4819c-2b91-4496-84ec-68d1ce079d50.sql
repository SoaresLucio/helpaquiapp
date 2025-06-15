
-- 1. Habilitar RLS em todas as tabelas sensíveis que ainda não têm
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_verifications ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. Criar políticas RLS para freelancer_profiles
DROP POLICY IF EXISTS "Users can view their own freelancer profile" ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Users can update their own freelancer profile" ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Users can insert their own freelancer profile" ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Public can view active freelancer profiles" ON public.freelancer_profiles;

CREATE POLICY "Users can manage their own freelancer profile" 
  ON public.freelancer_profiles 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view active freelancer profiles" 
  ON public.freelancer_profiles 
  FOR SELECT 
  USING (available = true AND auth.role() = 'authenticated');

-- 4. Criar políticas RLS para service_requests
DROP POLICY IF EXISTS "Users can view service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Users can manage their own service requests" ON public.service_requests;

CREATE POLICY "Users can manage their own service requests" 
  ON public.service_requests 
  FOR ALL 
  USING (auth.uid() = client_id);

CREATE POLICY "Authenticated users can view active service requests" 
  ON public.service_requests 
  FOR SELECT 
  USING (status = 'open' AND auth.role() = 'authenticated');

-- 5. Criar políticas RLS para freelancer_offers
DROP POLICY IF EXISTS "Users can manage their own offers" ON public.freelancer_offers;
DROP POLICY IF EXISTS "Request owners can view offers" ON public.freelancer_offers;

CREATE POLICY "Freelancers can manage their own offers" 
  ON public.freelancer_offers 
  FOR ALL 
  USING (auth.uid() = freelancer_id);

CREATE POLICY "Request owners can view offers on their requests" 
  ON public.freelancer_offers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.service_requests 
      WHERE id = service_request_id AND client_id = auth.uid()
    )
  );

-- 6. Criar políticas RLS para support_tickets
DROP POLICY IF EXISTS "Users can manage their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;

CREATE POLICY "Users can manage their own tickets" 
  ON public.support_tickets 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'helladmin'));

-- 7. Criar políticas RLS para support_messages
DROP POLICY IF EXISTS "Users can view messages from their tickets" ON public.support_messages;
DROP POLICY IF EXISTS "Users can create messages on their tickets" ON public.support_messages;

CREATE POLICY "Users can view messages from their tickets" 
  ON public.support_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'helladmin')
  );

CREATE POLICY "Users can create messages on their tickets" 
  ON public.support_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_id AND user_id = auth.uid()
    )
  );

-- 8. Criar políticas RLS para profile_verifications
DROP POLICY IF EXISTS "Users can manage their own verifications" ON public.profile_verifications;

CREATE POLICY "Users can manage their own verifications" 
  ON public.profile_verifications 
  FOR ALL 
  USING (auth.uid() = user_id);

-- 9. Adicionar índices importantes para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_category ON public.freelancer_profiles(category);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_available ON public.freelancer_profiles(available);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_category ON public.service_requests(category);
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON public.service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_freelancer_id ON public.freelancer_offers(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_freelancer_offers_service_request_id ON public.freelancer_offers(service_request_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_profile_verifications_user_id ON public.profile_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_verifications_status ON public.profile_verifications(status);

-- 10. Adicionar constraints importantes
ALTER TABLE public.profiles ADD CONSTRAINT check_user_type CHECK (user_type IN ('solicitante', 'freelancer'));
ALTER TABLE public.service_requests ADD CONSTRAINT check_status CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'));
ALTER TABLE public.service_requests ADD CONSTRAINT check_urgency CHECK (urgency IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE public.freelancer_offers ADD CONSTRAINT check_offer_status CHECK (status IN ('pending', 'accepted', 'rejected'));
ALTER TABLE public.support_tickets ADD CONSTRAINT check_ticket_status CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));
ALTER TABLE public.support_tickets ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE public.profile_verifications ADD CONSTRAINT check_verification_status CHECK (status IN ('pending', 'approved', 'rejected'));

-- 11. Garantir que user_id não seja nulo em tabelas críticas
ALTER TABLE public.profiles ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.freelancer_profiles ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.service_requests ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE public.freelancer_offers ALTER COLUMN freelancer_id SET NOT NULL;
ALTER TABLE public.support_tickets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.profile_verifications ALTER COLUMN user_id SET NOT NULL;
