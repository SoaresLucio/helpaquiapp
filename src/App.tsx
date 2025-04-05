
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { AuthProvider, RequireAuth } from "./hooks/useAuth";

const App = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/payments" element={<PaymentSettings />} />
            <Route path="/categories" element={<CategoryManagement />} />
            <Route path="/messages" element={<Index />} />
            <Route path="/notifications" element={<Index />} />
            <Route path="/profile" element={<Index />} />
            <Route path="/verification" element={<ProfileVerification />} />
            
            {/* Novas rotas para autenticação e notas */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/notes" element={
              <RequireAuth>
                <Notes />
              </RequireAuth>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatbotWidget />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
