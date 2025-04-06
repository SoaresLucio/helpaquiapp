
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import PaymentSettings from "./pages/PaymentSettings";
import CategoryManagement from "./pages/CategoryManagement";
import NotFound from "./pages/NotFound";
import ProfileVerification from "./pages/ProfileVerification";
import ChatbotWidget from "./components/ChatbotWidget";
import Auth from "./pages/Auth";
import Notes from "./pages/Notes";
import AIChat from "./pages/AIChat";
import { AuthProvider, RequireAuth, useAuth } from "./hooks/useAuth";

// Root component that handles initial redirect
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect if user is already on auth page or loading
    if (!loading && !isAuthenticated && 
        location.pathname !== '/auth' && 
        location.pathname !== '/login' && 
        location.pathname !== '/register') {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
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
          <Index />
        </RequireAuth>
      } />
      <Route path="/notifications" element={
        <RequireAuth>
          <Index />
        </RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth>
          <Index />
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
