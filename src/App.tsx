
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
            
            {/* Routes that require authentication */}
            <Route path="/" element={isAuthenticated ? <Index /> : <Navigate to="/login" replace />} />
            <Route path="/subscription" element={isAuthenticated ? <Subscription /> : <Navigate to="/login" replace />} />
            <Route path="/solicitante-plans" element={isAuthenticated ? <SolicitantePlans /> : <Navigate to="/login" replace />} />
            <Route path="/profile" element={isAuthenticated ? <UserProfilePage /> : <Navigate to="/login" replace />} />
            <Route path="/freelancer-profile" element={isAuthenticated ? <FreelancerProfile /> : <Navigate to="/login" replace />} />
            <Route path="/jobs" element={isAuthenticated ? <Jobs /> : <Navigate to="/login" replace />} />
            <Route path="/chat" element={isAuthenticated ? <Chat /> : <Navigate to="/login" replace />} />
            <Route path="/notes" element={isAuthenticated ? <Notes /> : <Navigate to="/login" replace />} />
            <Route path="/payment-settings" element={isAuthenticated ? <PaymentSettings /> : <Navigate to="/login" replace />} />
            <Route path="/profile-verification" element={isAuthenticated ? <ProfileVerification /> : <Navigate to="/login" replace />} />
            <Route path="/category-management" element={isAuthenticated ? <CategoryManagement /> : <Navigate to="/login" replace />} />
            <Route path="/ai-chat" element={isAuthenticated ? <AIChat /> : <Navigate to="/login" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
