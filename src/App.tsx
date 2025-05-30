
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import UserTypeSelection from "./pages/UserTypeSelection";
import Jobs from "./pages/Jobs";
import Chat from "./pages/Chat";
import FreelancerProfile from "./pages/FreelancerProfile";
import PaymentSettings from "./pages/PaymentSettings";
import CategoryManagement from "./pages/CategoryManagement";
import NotFound from "./pages/NotFound";
import ProfileVerification from "./pages/ProfileVerification";
import ChatbotWidget from "./components/ChatbotWidget";
import Notes from "./pages/Notes";
import AIChat from "./pages/AIChat";
import UserProfilePage from "./pages/UserProfilePage";
import { AuthProvider, RequireAuth, useAuth } from "./hooks/useAuth";

// Component to handle initial route logic
const AppRoutes = () => {
  const { isAuthenticated, loading, userType } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only handle redirects when not loading
    if (loading) return;

    const currentPath = location.pathname;
    const publicPaths = ['/login', '/register', '/reset-password', '/new-password', '/user-type-selection'];
    const isPublicPath = publicPaths.includes(currentPath);

    // Handle unauthenticated users
    if (!isAuthenticated) {
      if (!isPublicPath) {
        console.log('Unauthenticated user accessing protected route, redirecting to login');
        navigate('/login', { replace: true });
      }
      return;
    }

    // Handle authenticated users without user type
    if (isAuthenticated && !userType) {
      if (currentPath !== '/user-type-selection') {
        console.log('Authenticated user without type, redirecting to selection');
        navigate('/user-type-selection', { replace: true });
      }
      return;
    }

    // Handle authenticated users on auth pages
    if (isAuthenticated && userType && isPublicPath) {
      console.log('Authenticated user on auth page, redirecting to home');
      navigate('/', { replace: true });
      return;
    }

  }, [isAuthenticated, loading, userType, location.pathname, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-password" element={<NewPassword />} />
      <Route path="/user-type-selection" element={<UserTypeSelection />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <RequireAuth>
          <Index />
        </RequireAuth>
      } />
      <Route path="/jobs" element={
        <RequireAuth>
          <Jobs />
        </RequireAuth>
      } />
      <Route path="/chat" element={
        <RequireAuth>
          <Chat />
        </RequireAuth>
      } />
      <Route path="/freelancer/:id" element={
        <RequireAuth>
          <FreelancerProfile />
        </RequireAuth>
      } />
      <Route path="/payments" element={
        <RequireAuth>
          <PaymentSettings />
        </RequireAuth>
      } />
      <Route path="/categories" element={
        <RequireAuth>
          <CategoryManagement />
        </RequireAuth>
      } />
      <Route path="/messages" element={
        <RequireAuth>
          <Chat />
        </RequireAuth>
      } />
      <Route path="/notifications" element={
        <RequireAuth>
          <Index />
        </RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth>
          <UserProfilePage />
        </RequireAuth>
      } />
      <Route path="/verification" element={
        <RequireAuth>
          <ProfileVerification />
        </RequireAuth>
      } />
      <Route path="/notes" element={
        <RequireAuth>
          <Notes />
        </RequireAuth>
      } />
      <Route path="/ai-chat" element={
        <RequireAuth>
          <AIChat />
        </RequireAuth>
      } />
      
      {/* Catch all route for 404 errors */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <ChatbotWidget />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
