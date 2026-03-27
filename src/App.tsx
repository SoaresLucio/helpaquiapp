
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoadingScreen from "./components/index/LoadingScreen";

// Lazy-loaded pages
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
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/user-type" element={<UserTypeSelection />} />

        {/* Home */}
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />

        {/* General protected routes */}
        <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/freelancer-profile" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />
        <Route path="/freelancer/:id" element={<ProtectedRoute><FreelancerProfile /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/payment-settings" element={<ProtectedRoute><PaymentSettings /></ProtectedRoute>} />
        <Route path="/profile-verification" element={<ProtectedRoute><ProfileVerification /></ProtectedRoute>} />
        <Route path="/category-management" element={<ProtectedRoute><CategoryManagement /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
        <Route path="/offers" element={<ProtectedRoute><OffersPage /></ProtectedRoute>} />
        <Route path="/payment-confirmation/:planId" element={<ProtectedRoute><PaymentConfirmationPage /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />

        {/* Solicitante routes */}
        <Route path="/solicitante-plans" element={<ProtectedRoute requiredUserType="solicitante"><SolicitantePlans /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute requiredUserType="solicitante"><MyRequests /></ProtectedRoute>} />

        {/* Freelancer routes */}
        <Route path="/freelancer-plans" element={<ProtectedRoute requiredUserType="freelancer"><FreelancerPlans /></ProtectedRoute>} />
        <Route path="/payment-freelancer-settings" element={<ProtectedRoute requiredUserType="freelancer"><PaymentFreelancerSettings /></ProtectedRoute>} />
        <Route path="/help-requests" element={<ProtectedRoute requiredUserType="freelancer"><HelpRequests /></ProtectedRoute>} />
        <Route path="/my-offers" element={<ProtectedRoute requiredUserType="freelancer"><MyOffers /></ProtectedRoute>} />

        {/* Empresa routes */}
        <Route path="/empresa/jobs" element={<ProtectedRoute requiredUserType="empresa"><EmpresaJobManagement /></ProtectedRoute>} />
        <Route path="/empresa-plans" element={<ProtectedRoute requiredUserType="empresa"><EmpresaPlans /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/*" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
