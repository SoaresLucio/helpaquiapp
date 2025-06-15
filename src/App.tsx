
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import UserTypeSelection from "./pages/UserTypeSelection";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import Chat from "./pages/Chat";
import AIChat from "./pages/AIChat";
import Jobs from "./pages/Jobs";
import FreelancerProfile from "./pages/FreelancerProfile";
import UserProfilePage from "./pages/UserProfilePage";
import OffersPage from "./pages/OffersPage";
import MyOffers from "./pages/MyOffers";
import MyRequests from "./pages/MyRequests";
import Notes from "./pages/Notes";
import ProfileVerification from "./pages/ProfileVerification";
import PaymentSettings from "./pages/PaymentSettings";
import PaymentFreelancerSettings from "./pages/PaymentFreelancerSettings";
import SolicitantePlans from "./pages/SolicitantePlans";
import FreelancerPlans from "./pages/FreelancerPlans";
import Subscription from "./pages/Subscription";
import SubscriptionFlow from "./pages/SubscriptionFlow";
import SubscriptionPixPayment from "./pages/SubscriptionPixPayment";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionHistory from "./pages/SubscriptionHistory";
import CategoryManagement from "./pages/CategoryManagement";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/new-password" element={<NewPassword />} />
          <Route path="/user-type" element={<UserTypeSelection />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          
          <Route path="/ai-chat" element={
            <ProtectedRoute>
              <AIChat />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs" element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          } />
          
          <Route path="/freelancer/:id" element={
            <ProtectedRoute>
              <FreelancerProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } />
          
          <Route path="/offers" element={
            <ProtectedRoute>
              <OffersPage />
            </ProtectedRoute>
          } />
          
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
          
          <Route path="/notes" element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          } />
          
          <Route path="/profile-verification" element={
            <ProtectedRoute>
              <ProfileVerification />
            </ProtectedRoute>
          } />
          
          <Route path="/payment-settings" element={
            <ProtectedRoute requiredUserType="solicitante">
              <PaymentSettings />
            </ProtectedRoute>
          } />
          
          <Route path="/freelancer-payment-settings" element={
            <ProtectedRoute requiredUserType="freelancer">
              <PaymentFreelancerSettings />
            </ProtectedRoute>
          } />
          
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
          
          <Route path="/subscription" element={
            <ProtectedRoute>
              <Subscription />
            </ProtectedRoute>
          } />
          
          <Route path="/subscription-flow" element={
            <ProtectedRoute>
              <SubscriptionFlow />
            </ProtectedRoute>
          } />
          
          <Route path="/subscription-pix-payment" element={
            <ProtectedRoute>
              <SubscriptionPixPayment />
            </ProtectedRoute>
          } />
          
          <Route path="/subscription-success" element={
            <ProtectedRoute>
              <SubscriptionSuccess />
            </ProtectedRoute>
          } />
          
          <Route path="/subscription-history" element={
            <ProtectedRoute>
              <SubscriptionHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/categories" element={
            <ProtectedRoute>
              <CategoryManagement />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
