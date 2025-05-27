
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

// Root component that handles initial redirect
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Só redirecionar se não estiver carregando e não estiver autenticado
    // E não estiver já nas páginas de auth ou reset
    if (!loading && !isAuthenticated) {
      const publicPaths = ['/login', '/register', '/reset-password', '/new-password'];
      if (!publicPaths.includes(location.pathname)) {
        navigate('/login');
      }
    }
    
    // Se estiver autenticado e nas páginas de auth, redirecionar para home
    if (!loading && isAuthenticated) {
      const authPaths = ['/login', '/register'];
      if (authPaths.includes(location.pathname)) {
        navigate('/');
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/new-password" element={<NewPassword />} />
      
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
      
      {/* Catch all route */}
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
