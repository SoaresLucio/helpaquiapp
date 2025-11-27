-- ============================================
-- CORREÇÃO COMPLETA DE SEGURANÇA - HelpAqui
-- ============================================

-- 1. REMOVER POLÍTICAS RLS PERIGOSAS COM 'true'
-- ============================================

-- Job Listings - Remover políticas que permitem acesso total
DROP POLICY IF EXISTS "job_listings_select_policy" ON job_listings;
DROP POLICY IF EXISTS "job_listings_delete_policy" ON job_listings;
DROP POLICY IF EXISTS "job_listings_insert_policy" ON job_listings;
DROP POLICY IF EXISTS "job_listings_update_policy" ON job_listings;

-- Manter apenas as políticas seguras baseadas em autenticação
-- As políticas "Authenticated users can view job listings" e 
-- "Job posters can manage their own listings" já existem e são seguras

-- 2. CORRIGIR POLÍTICAS DE TABELAS ADMIN
-- ============================================

-- Administradores - usar verificação de role ao invés de 'true'
DROP POLICY IF EXISTS "Admins can modify all admin data" ON administradores;
DROP POLICY IF EXISTS "Admins can read all admin data" ON administradores;

CREATE POLICY "Only helpadmin can manage administradores"
ON administradores
FOR ALL
USING (has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));

-- Categorias - usar verificação de role ao invés de 'true'
DROP POLICY IF EXISTS "Admins can modify all categories" ON categorias;
DROP POLICY IF EXISTS "Admins can read all categories" ON categorias;

CREATE POLICY "Authenticated users can view categories"
ON categorias
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only helpadmin can manage categories"
ON categorias
FOR ALL
USING (has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));

-- Payments - corrigir políticas com 'true'
DROP POLICY IF EXISTS "Service role can manage payments" ON payments;
DROP POLICY IF EXISTS "Admins can modify all payments" ON payments;
DROP POLICY IF EXISTS "Admins can read all payments" ON payments;

CREATE POLICY "Admins can manage all payments"
ON payments
FOR ALL
USING (has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));

-- 3. CORRIGIR SUPPORT TICKETS E MESSAGES
-- ============================================

-- Support Tickets - remover políticas duplicadas/conflitantes
DROP POLICY IF EXISTS "Admins can modify all support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can read all support tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can manage their own tickets" ON support_tickets;

-- Manter apenas as políticas específicas já existentes

-- Support Messages - remover políticas duplicadas
DROP POLICY IF EXISTS "Admins can modify all support messages" ON support_messages;
DROP POLICY IF EXISTS "Admins can read all support messages" ON support_messages;

-- Manter apenas as políticas específicas já existentes

-- 4. CORRIGIR PROFILE VERIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "Admins can modify all verifications" ON profile_verifications;
DROP POLICY IF EXISTS "Admins can read all verifications" ON profile_verifications;
DROP POLICY IF EXISTS "Users can manage their own verifications" ON profile_verifications;

-- Criar políticas corretas
CREATE POLICY "Users can create and view own verifications"
ON profile_verifications
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'helpadmin'::user_role));

CREATE POLICY "Users can insert own verifications"
ON profile_verifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update all verifications"
ON profile_verifications
FOR UPDATE
USING (has_role(auth.uid(), 'helpadmin'::user_role))
WITH CHECK (has_role(auth.uid(), 'helpadmin'::user_role));

-- 5. ADICIONAR ÍNDICES PARA PERFORMANCE DE SEGURANÇA
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_failed_login_email ON failed_login_attempts(email);

-- 6. GARANTIR QUE TABELAS SENSÍVEIS TEM RLS HABILITADO
-- ============================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- 7. ADICIONAR POLÍTICA FALTANTE PARA APP_CONFIGURATIONS
-- ============================================

CREATE POLICY "Authenticated users can view configurations"
ON app_configurations
FOR SELECT
USING (auth.role() = 'authenticated');