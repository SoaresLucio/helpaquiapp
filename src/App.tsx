import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingScreen from "./components/index/LoadingScreen";
import PageSEO from "./components/common/PageSEO";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const FreelancerProfile = lazy(() => import("./pages/FreelancerProfile"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Chat = lazy(() => import("./pages/Chat"));
const Notes = lazy(() => import("./pages/Notes"));
const PaymentSettings = lazy(() => import("./pages/PaymentSettings"));
const PaymentFreelancerSettings = lazy(() => import("./pages/PaymentFreelancerSettings"));
const ProfileVerification = lazy(() => import("./pages/ProfileVerification"));
const UserTypeSelection = lazy(() => import("./pages/UserTypeSelection"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NewPassword = lazy(() => import("./pages/NewPassword"));
const CategoryManagement = lazy(() => import("./pages/CategoryManagement"));
const AIChat = lazy(() => import("./pages/AIChat"));
const Subscription = lazy(() => import("./pages/Subscription"));
const SolicitantePlans = lazy(() => import("./pages/SolicitantePlans"));
const FreelancerPlans = lazy(() => import("./pages/FreelancerPlans"));
const EmpresaPlans = lazy(() => import("./pages/EmpresaPlans"));
const MyOffers = lazy(() => import("./pages/MyOffers"));
const MyRequests = lazy(() => import("./pages/MyRequests"));
const OffersPage = lazy(() => import("./pages/OffersPage"));
const PaymentConfirmationPage = lazy(() => import("./pages/PaymentConfirmationPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const HelpRequests = lazy(() => import("./pages/HelpRequests"));
const EmpresaJobManagement = lazy(() => import("./pages/EmpresaJobManagement"));
const About = lazy(() => import("./pages/About"));
const BannerDetail = lazy(() => import("./pages/BannerDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const NewRequest = lazy(() => import("./pages/NewRequest"));
const HireConfirmation = lazy(() => import("./pages/HireConfirmation"));
const HireResponse = lazy(() => import("./pages/HireResponse"));

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

const wrapperStyle = { width: '100%' } as const;

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={pageTransition} initial="initial" animate="animate" exit="exit" style={wrapperStyle}>
    {children}
  </motion.div>
);

// Helper: combine SEO + wrapper, defaults noIndex true for protected/auth-only pages
const SEOPage = ({
  title,
  description,
  path,
  noIndex,
  children,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  children: React.ReactNode;
}) => (
  <>
    <PageSEO title={title} description={description} path={path} noIndex={noIndex} />
    <PageWrapper>{children}</PageWrapper>
  </>
);

// Prefetch critical routes during browser idle to reduce perceived navigation latency
if (typeof window !== 'undefined') {
  const prefetch = () => {
    import("./pages/Index");
    import("./pages/Login");
    import("./pages/Chat");
  };
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
  } else {
    setTimeout(prefetch, 1500);
  }
}

function App() {
  const location = useLocation();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public landing page (SEO handled inside LandingPage) */}
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />

          {/* Public routes (SEO handled inside each page) */}
          <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/reset-password" element={<SEOPage title="Recuperar Senha" description="Recupere o acesso à sua conta HelpAqui." path="/reset-password"><ResetPassword /></SEOPage>} />
          <Route path="/new-password" element={<SEOPage title="Nova Senha" description="Defina uma nova senha para sua conta HelpAqui." path="/new-password" noIndex><NewPassword /></SEOPage>} />
          <Route path="/user-type" element={<SEOPage title="Escolha seu Tipo de Conta" description="Selecione como você deseja usar a HelpAqui: solicitante, freelancer ou empresa." path="/user-type"><UserTypeSelection /></SEOPage>} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<SEOPage title="Painel" description="Seu painel HelpAqui com serviços, propostas e atualizações em tempo real." path="/dashboard" noIndex><ProtectedRoute><Index /></ProtectedRoute></SEOPage>} />

          {/* General protected routes */}
          <Route path="/subscription" element={<SEOPage title="Assinatura" description="Gerencie seu plano de assinatura na HelpAqui." path="/subscription" noIndex><ProtectedRoute><Subscription /></ProtectedRoute></SEOPage>} />
          <Route path="/profile" element={<SEOPage title="Meu Perfil" description="Gerencie seu perfil HelpAqui." path="/profile" noIndex><ProtectedRoute><UserProfilePage /></ProtectedRoute></SEOPage>} />
          <Route path="/freelancer-profile" element={<SEOPage title="Perfil de Freelancer" description="Gerencie seu perfil profissional de freelancer." path="/freelancer-profile" noIndex><ProtectedRoute><FreelancerProfile /></ProtectedRoute></SEOPage>} />
          <Route path="/freelancer/:id" element={<SEOPage title="Perfil de Freelancer" description="Veja o perfil profissional, avaliações e serviços do freelancer." path="/freelancer" noIndex><ProtectedRoute><FreelancerProfile /></ProtectedRoute></SEOPage>} />
          <Route path="/u/:userId" element={<SEOPage title="Perfil de Usuário" description="Veja o perfil público deste usuário HelpAqui." path="/u" noIndex><ProtectedRoute><PublicProfile /></ProtectedRoute></SEOPage>} />
          <Route path="/jobs" element={<PageWrapper><ProtectedRoute><Jobs /></ProtectedRoute></PageWrapper>} />
          <Route path="/chat" element={<SEOPage title="Mensagens" description="Converse com profissionais e clientes na HelpAqui." path="/chat" noIndex><ProtectedRoute><Chat /></ProtectedRoute></SEOPage>} />
          <Route path="/notes" element={<SEOPage title="Anotações" description="Suas anotações pessoais na HelpAqui." path="/notes" noIndex><ProtectedRoute><Notes /></ProtectedRoute></SEOPage>} />
          <Route path="/payment-settings" element={<SEOPage title="Configurações de Pagamento" description="Gerencie seus métodos de pagamento na HelpAqui." path="/payment-settings" noIndex><ProtectedRoute><PaymentSettings /></ProtectedRoute></SEOPage>} />
          <Route path="/profile-verification" element={<SEOPage title="Verificação de Perfil" description="Verifique sua identidade para conquistar mais confiança." path="/profile-verification" noIndex><ProtectedRoute><ProfileVerification /></ProtectedRoute></SEOPage>} />
          <Route path="/category-management" element={<SEOPage title="Gerenciar Categorias" description="Gerencie as categorias de serviços." path="/category-management" noIndex><ProtectedRoute><CategoryManagement /></ProtectedRoute></SEOPage>} />
          <Route path="/ai-chat" element={<SEOPage title="Assistente IA" description="Converse com o assistente inteligente da HelpAqui." path="/ai-chat" noIndex><ProtectedRoute><AIChat /></ProtectedRoute></SEOPage>} />
          <Route path="/offers" element={<SEOPage title="Ofertas" description="Veja ofertas de serviços disponíveis." path="/offers" noIndex><ProtectedRoute><OffersPage /></ProtectedRoute></SEOPage>} />
          <Route path="/payment-confirmation/:planId" element={<SEOPage title="Confirmação de Pagamento" description="Confirme seu pagamento de assinatura." path="/payment-confirmation" noIndex><ProtectedRoute><PaymentConfirmationPage /></ProtectedRoute></SEOPage>} />
          <Route path="/about" element={<PageWrapper><ProtectedRoute><About /></ProtectedRoute></PageWrapper>} />
          <Route path="/banner/:id" element={<SEOPage title="Detalhes da Promoção" description="Detalhes desta promoção HelpAqui." path="/banner" noIndex><ProtectedRoute><BannerDetail /></ProtectedRoute></SEOPage>} />

          {/* Solicitante routes */}
          <Route path="/solicitante-plans" element={<SEOPage title="Planos para Solicitantes" description="Conheça os planos de assinatura para solicitantes na HelpAqui." path="/solicitante-plans" noIndex><ProtectedRoute requiredUserType="solicitante"><SolicitantePlans /></ProtectedRoute></SEOPage>} />
          <Route path="/my-requests" element={<SEOPage title="Minhas Solicitações" description="Acompanhe suas solicitações de serviços na HelpAqui." path="/my-requests" noIndex><ProtectedRoute requiredUserType="solicitante"><MyRequests /></ProtectedRoute></SEOPage>} />
          <Route path="/new-request" element={<SEOPage title="Publicar Help" description="Publique uma nova solicitação de serviço na HelpAqui." path="/new-request" noIndex><ProtectedRoute><NewRequest /></ProtectedRoute></SEOPage>} />
          <Route path="/hire/confirm" element={<SEOPage title="Confirmar Contratação" description="Confirme os detalhes e pague de forma segura." path="/hire/confirm" noIndex><ProtectedRoute><HireConfirmation /></ProtectedRoute></SEOPage>} />

          {/* Freelancer routes */}
          <Route path="/freelancer-plans" element={<SEOPage title="Planos para Freelancers" description="Conheça os planos de assinatura para freelancers." path="/freelancer-plans" noIndex><ProtectedRoute requiredUserType="freelancer"><FreelancerPlans /></ProtectedRoute></SEOPage>} />
          <Route path="/payment-freelancer-settings" element={<SEOPage title="Pagamentos do Freelancer" description="Configure como receber pagamentos." path="/payment-freelancer-settings" noIndex><ProtectedRoute requiredUserType="freelancer"><PaymentFreelancerSettings /></ProtectedRoute></SEOPage>} />
          <Route path="/help-requests" element={<SEOPage title="Pedidos de Ajuda" description="Veja pedidos de ajuda disponíveis perto de você." path="/help-requests" noIndex><ProtectedRoute requiredUserType="freelancer"><HelpRequests /></ProtectedRoute></SEOPage>} />
          <Route path="/my-offers" element={<SEOPage title="Minhas Ofertas" description="Gerencie suas ofertas de serviços." path="/my-offers" noIndex><ProtectedRoute requiredUserType="freelancer"><MyOffers /></ProtectedRoute></SEOPage>} />

          {/* Empresa routes */}
          <Route path="/empresa/jobs" element={<SEOPage title="Gerenciar Vagas" description="Crie e gerencie vagas de emprego para sua empresa." path="/empresa/jobs" noIndex><ProtectedRoute requiredUserType="empresa"><EmpresaJobManagement /></ProtectedRoute></SEOPage>} />
          <Route path="/empresa-plans" element={<SEOPage title="Planos para Empresas" description="Conheça os planos de assinatura para empresas." path="/empresa-plans" noIndex><ProtectedRoute requiredUserType="empresa"><EmpresaPlans /></ProtectedRoute></SEOPage>} />

          {/* Admin */}
          <Route path="/admin/*" element={<SEOPage title="Painel Admin" description="Painel administrativo HelpAqui." path="/admin" noIndex><ProtectedRoute><AdminDashboard /></ProtectedRoute></SEOPage>} />

          {/* 404 */}
          <Route path="*" element={<SEOPage title="Página não encontrada" description="A página que você procura não foi encontrada." path="/404" noIndex><NotFound /></SEOPage>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;
