
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
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
import ProfileVerification from "./pages/ProfileVerification";
import UserTypeSelection from "./pages/UserTypeSelection";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import CategoryManagement from "./pages/CategoryManagement";
import AIChat from "./pages/AIChat";
import Subscription from "./pages/Subscription";
import SolicitantePlans from "./pages/SolicitantePlans";
import FreelancerPlans from "./pages/FreelancerPlans";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
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
                
                {/* Catch-all 404 route - MUST be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
