
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
import MyOffers from "./pages/MyOffers";
import MyRequests from "./pages/MyRequests";
import OffersPage from "./pages/OffersPage";
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
      <Route path="/jobs" element={
        <ProtectedRoute>
          <Jobs />
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
      
      {/* New management pages */}
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
        <ProtectedRoute requiredUserType="solicitante">
          <OffersPage />
        </ProtectedRoute>
      } />
      
      {/* Catch-all 404 route - MUST be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
