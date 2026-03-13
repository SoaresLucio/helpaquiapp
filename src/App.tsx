
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserProfilePage from "./pages/UserProfilePage";
import FreelancerProfile from "./pages/FreelancerProfile";
import Jobs from "./pages/Jobs";
import Chat from "./pages/Chat";
import Notes from "./pages/Notes";
import PaymentSettings from "./pages/PaymentSettings";
import PaymentFreelancerSettings from "./pages/PaymentFreelancerSettings";
import ProfileVerification from "./pages/ProfileVerification";
import UserTypeSelection from "./pages/UserTypeSelection";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import CategoryManagement from "./pages/CategoryManagement";
import AIChat from "./pages/AIChat";
import Subscription from "./pages/Subscription";
import SolicitantePlans from "./pages/SolicitantePlans";
import FreelancerPlans from "./pages/FreelancerPlans";
import EmpresaPlans from "./pages/EmpresaPlans";
import MyOffers from "./pages/MyOffers";
import MyRequests from "./pages/MyRequests";
import OffersPage from "./pages/OffersPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import AdminDashboard from "./pages/AdminDashboard";
import HelpRequests from "./pages/HelpRequests";
import EmpresaJobManagement from "./pages/EmpresaJobManagement";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-password" element={<NewPassword />} />
      <Route path="/user-type" element={<UserTypeSelection />} />
      
      {/* Protected routes that require authentication */}
      <Route path="/" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      
      {/* General protected routes */}
      <Route path="/subscription" element={
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/freelancer-profile" element={
        <ProtectedRoute>
          <FreelancerProfile />
        </ProtectedRoute>
      } />
      <Route path="/freelancer/:id" element={
        <ProtectedRoute>
          <FreelancerProfile />
        </ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute>
          <Jobs />
        </ProtectedRoute>
      } />
      <Route path="/help-requests" element={
        <ProtectedRoute requiredUserType="freelancer">
          <HelpRequests />
        </ProtectedRoute>
      } />
      <Route path="/empresa/jobs" element={
        <ProtectedRoute requiredUserType="empresa">
          <EmpresaJobManagement />
        </ProtectedRoute>
      } />
      <Route path="/chat" element={
        <ProtectedRoute>
          <Chat />
        </ProtectedRoute>
      } />
      <Route path="/notes" element={
        <ProtectedRoute>
          <Notes />
        </ProtectedRoute>
      } />
      <Route path="/payment-settings" element={
        <ProtectedRoute>
          <PaymentSettings />
        </ProtectedRoute>
      } />
      <Route path="/payment-freelancer-settings" element={
        <ProtectedRoute requiredUserType="freelancer">
          <PaymentFreelancerSettings />
        </ProtectedRoute>
      } />
      <Route path="/profile-verification" element={
        <ProtectedRoute>
          <ProfileVerification />
        </ProtectedRoute>
      } />
      <Route path="/category-management" element={
        <ProtectedRoute>
          <CategoryManagement />
        </ProtectedRoute>
      } />
      <Route path="/ai-chat" element={
        <ProtectedRoute>
          <AIChat />
        </ProtectedRoute>
      } />
      
      {/* User type specific routes with access control */}
      <Route path="/solicitante-plans" element={
        <ProtectedRoute requiredUserType="solicitante">
          <SolicitantePlans />
        </ProtectedRoute>
      } />
      <Route path="/freelancer-plans" element={
        <ProtectedRoute requiredUserType="freelancer">
          <FreelancerPlans />
        </ProtectedRoute>
      } />
      <Route path="/empresa-plans" element={
        <ProtectedRoute requiredUserType="empresa">
          <EmpresaPlans />
        </ProtectedRoute>
      } />
      
      {/* Management pages */}
      <Route path="/my-offers" element={
        <ProtectedRoute requiredUserType="freelancer">
          <MyOffers />
        </ProtectedRoute>
      } />
      <Route path="/my-requests" element={
        <ProtectedRoute requiredUserType="solicitante">
          <MyRequests />
        </ProtectedRoute>
      } />
      <Route path="/offers" element={
        <ProtectedRoute>
          <OffersPage />
        </ProtectedRoute>
      } />
      <Route path="/payment-confirmation/:planId" element={
        <ProtectedRoute>
          <PaymentConfirmationPage />
        </ProtectedRoute>
      } />
      
      {/* Admin routes */}
      <Route path="/admin/plans" element={
        <ProtectedRoute>
          <AdminPlanManagement />
        </ProtectedRoute>
      } />
      
      {/* About page */}
      <Route path="/about" element={
        <ProtectedRoute>
          <About />
        </ProtectedRoute>
      } />
      
      {/* Catch-all 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
