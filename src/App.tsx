
import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingScreen from "./components/index/LoadingScreen";

// Lazy-loaded pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
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
          {/* Public landing page */}
          <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />

          {/* Public routes */}
          <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
          <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
          <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
          <Route path="/reset-password" element={<PageWrapper><ResetPassword /></PageWrapper>} />
          <Route path="/new-password" element={<PageWrapper><NewPassword /></PageWrapper>} />
          <Route path="/user-type" element={<PageWrapper><UserTypeSelection /></PageWrapper>} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<PageWrapper><ProtectedRoute><Index /></ProtectedRoute></PageWrapper>} />

          {/* General protected routes */}
          <Route path="/subscription" element={<PageWrapper><ProtectedRoute><Subscription /></ProtectedRoute></PageWrapper>} />
          <Route path="/profile" element={<PageWrapper><ProtectedRoute><UserProfilePage /></ProtectedRoute></PageWrapper>} />
          <Route path="/freelancer-profile" element={<PageWrapper><ProtectedRoute><FreelancerProfile /></ProtectedRoute></PageWrapper>} />
          <Route path="/freelancer/:id" element={<PageWrapper><ProtectedRoute><FreelancerProfile /></ProtectedRoute></PageWrapper>} />
          <Route path="/jobs" element={<PageWrapper><ProtectedRoute><Jobs /></ProtectedRoute></PageWrapper>} />
          <Route path="/chat" element={<PageWrapper><ProtectedRoute><Chat /></ProtectedRoute></PageWrapper>} />
          <Route path="/notes" element={<PageWrapper><ProtectedRoute><Notes /></ProtectedRoute></PageWrapper>} />
          <Route path="/payment-settings" element={<PageWrapper><ProtectedRoute><PaymentSettings /></ProtectedRoute></PageWrapper>} />
          <Route path="/profile-verification" element={<PageWrapper><ProtectedRoute><ProfileVerification /></ProtectedRoute></PageWrapper>} />
          <Route path="/category-management" element={<PageWrapper><ProtectedRoute><CategoryManagement /></ProtectedRoute></PageWrapper>} />
          <Route path="/ai-chat" element={<PageWrapper><ProtectedRoute><AIChat /></ProtectedRoute></PageWrapper>} />
          <Route path="/offers" element={<PageWrapper><ProtectedRoute><OffersPage /></ProtectedRoute></PageWrapper>} />
          <Route path="/payment-confirmation/:planId" element={<PageWrapper><ProtectedRoute><PaymentConfirmationPage /></ProtectedRoute></PageWrapper>} />
          <Route path="/about" element={<PageWrapper><ProtectedRoute><About /></ProtectedRoute></PageWrapper>} />
          <Route path="/banner/:id" element={<PageWrapper><ProtectedRoute><BannerDetail /></ProtectedRoute></PageWrapper>} />

          {/* Solicitante routes */}
          <Route path="/solicitante-plans" element={<PageWrapper><ProtectedRoute requiredUserType="solicitante"><SolicitantePlans /></ProtectedRoute></PageWrapper>} />
          <Route path="/my-requests" element={<PageWrapper><ProtectedRoute requiredUserType="solicitante"><MyRequests /></ProtectedRoute></PageWrapper>} />

          {/* Freelancer routes */}
          <Route path="/freelancer-plans" element={<PageWrapper><ProtectedRoute requiredUserType="freelancer"><FreelancerPlans /></ProtectedRoute></PageWrapper>} />
          <Route path="/payment-freelancer-settings" element={<PageWrapper><ProtectedRoute requiredUserType="freelancer"><PaymentFreelancerSettings /></ProtectedRoute></PageWrapper>} />
          <Route path="/help-requests" element={<PageWrapper><ProtectedRoute requiredUserType="freelancer"><HelpRequests /></ProtectedRoute></PageWrapper>} />
          <Route path="/my-offers" element={<PageWrapper><ProtectedRoute requiredUserType="freelancer"><MyOffers /></ProtectedRoute></PageWrapper>} />

          {/* Empresa routes */}
          <Route path="/empresa/jobs" element={<PageWrapper><ProtectedRoute requiredUserType="empresa"><EmpresaJobManagement /></ProtectedRoute></PageWrapper>} />
          <Route path="/empresa-plans" element={<PageWrapper><ProtectedRoute requiredUserType="empresa"><EmpresaPlans /></ProtectedRoute></PageWrapper>} />

          {/* Admin */}
          <Route path="/admin/*" element={<PageWrapper><ProtectedRoute><AdminDashboard /></ProtectedRoute></PageWrapper>} />

          {/* 404 */}
          <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default App;
