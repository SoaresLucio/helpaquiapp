
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthState } from "./hooks/useAuthState";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, loading } = useAuthState();

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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/new-password" element={<NewPassword />} />
            <Route path="/user-type" element={<UserTypeSelection />} />
            <Route path="/subscription" element={<Subscription />} />
            
            {/* Protected routes */}
            {isAuthenticated ? (
              <>
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/freelancer-profile" element={<FreelancerProfile />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/payment-settings" element={<PaymentSettings />} />
                <Route path="/profile-verification" element={<ProfileVerification />} />
                <Route path="/category-management" element={<CategoryManagement />} />
                <Route path="/ai-chat" element={<AIChat />} />
              </>
            ) : (
              <Route path="*" element={<Login />} />
            )}
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
