
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export const signIn = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Formato de e-mail inválido");
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error("Erro de autenticação:", error);
    
    // Provide more user-friendly error messages
    if (error.message.includes("Invalid login")) {
      throw new Error("Email ou senha incorretos. Por favor, tente novamente.");
    } else if (error.message.includes("Email not confirmed")) {
      throw new Error("Por favor, confirme seu email antes de fazer login.");
    } else {
      throw new Error("Email ou senha incorretos. Por favor, tente novamente.");
    }
  }
  
  return data;
};

export const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
  if (!email || !password) {
    throw new Error("Email e senha são obrigatórios");
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Formato de e-mail inválido");
  }
  
  // Enforce password strength
  if (password.length < 8) {
    throw new Error("A senha deve ter pelo menos 8 caracteres");
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new Error("A senha deve conter letras maiúsculas, minúsculas e números");
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    }
  });
  
  if (error) {
    console.error("Erro de registro:", error);
    
    if (error.message.includes("User already registered")) {
      throw new Error("Este email já foi cadastrado. Por favor, faça login.");
    } else {
      throw new Error(error.message || "Erro ao criar conta. Tente novamente mais tarde.");
    }
  }
  
  return data;
};

export const resetPassword = async (email: string) => {
  if (!email) {
    throw new Error("Email é obrigatório");
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Formato de e-mail inválido");
  }
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/new-password`,
  });
  
  if (error) {
    console.error("Erro ao enviar email de redefinição de senha:", error);
    throw new Error(error.message || "Erro ao enviar email de redefinição. Tente novamente mais tarde.");
  }
  
  return true;
};

export const updatePassword = async (newPassword: string) => {
  if (!newPassword) {
    throw new Error("Nova senha é obrigatória");
  }
  
  // Enforce password strength
  if (newPassword.length < 8) {
    throw new Error("A senha deve ter pelo menos 8 caracteres");
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new Error("A senha deve conter letras maiúsculas, minúsculas e números");
  }
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    console.error("Erro ao atualizar senha:", error);
    throw new Error(error.message || "Erro ao atualizar senha. Tente novamente mais tarde.");
  }
  
  return true;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro ao deslogar:", error);
    throw new Error(error.message || "Erro ao sair. Tente novamente mais tarde.");
  }
  return true;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const verifySession = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return session !== null;
};

export const setupAuthListener = (callback: (session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  
  return subscription;
};

// Função para login com Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`
    }
  });
  
  if (error) {
    console.error("Erro no login Google:", error);
    throw new Error(error.message || "Erro ao fazer login com Google");
  }
  
  return data;
};
