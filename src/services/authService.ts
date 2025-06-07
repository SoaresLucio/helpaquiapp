
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType?: 'solicitante' | 'freelancer';
}

// Enhanced input validation and sanitization
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Enhanced user validation function
export const validateUserData = (user: User | null): boolean => {
  if (!user || !user.id || !user.email) {
    return false;
  }
  
  return validateEmail(user.email);
};

// Enhanced session validation
export const validateSession = async (): Promise<boolean> => {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return false;
    }
    
    if (!session.user || !validateUserData(session.user)) {
      return false;
    }
    
    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
};

export const signIn = async (email: string, password: string) => {
  // Enhanced validation
  const cleanEmail = sanitizeInput(email).toLowerCase();
  
  if (!cleanEmail || !password) {
    throw new Error("Email e senha são obrigatórios");
  }
  
  if (!validateEmail(cleanEmail)) {
    throw new Error("Email inválido");
  }
  
  if (password.length < 6) {
    throw new Error("Senha deve ter pelo menos 6 caracteres");
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });
    
    if (error) {
      console.error("Sign in error:", error);
      
      // More specific error handling
      switch (error.message) {
        case 'Invalid login credentials':
          throw new Error("Email ou senha incorretos. Verifique suas credenciais.");
        case 'Email not confirmed':
          throw new Error("Por favor, confirme seu email antes de fazer login.");
        case 'Too many requests':
          throw new Error("Muitas tentativas de login. Tente novamente em alguns minutos.");
        default:
          throw new Error("Erro no login. Tente novamente mais tarde.");
      }
    }
    
    // Validate user data after successful login
    if (data.user && !validateUserData(data.user)) {
      throw new Error("Dados de usuário inválidos. Entre em contato com o suporte.");
    }
    
    console.log("Login successful:", data.user?.email, "ID:", data.user?.id);
    return data;
    
  } catch (error: any) {
    console.error("Sign in error:", error);
    throw error;
  }
};

export const signUp = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string, 
  userType: 'solicitante' | 'freelancer',
  categories?: string[]
) => {
  // Enhanced validation
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanFirstName = sanitizeInput(firstName);
  const cleanLastName = sanitizeInput(lastName);
  
  if (!cleanEmail || !password || !cleanFirstName || !cleanLastName) {
    throw new Error("Todos os campos são obrigatórios");
  }
  
  if (!validateEmail(cleanEmail)) {
    throw new Error("Email inválido");
  }
  
  if (password.length < 8) {
    throw new Error("A senha deve ter pelo menos 8 caracteres");
  }
  
  if (cleanFirstName.length < 2 || cleanLastName.length < 2) {
    throw new Error("Nome e sobrenome devem ter pelo menos 2 caracteres");
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
          user_type: userType,
          categories: categories || []
        }
      }
    });
    
    if (error) {
      console.error("Sign up error:", error);
      
      switch (error.message) {
        case 'User already registered':
          throw new Error("Este email já está cadastrado. Faça login ou use outro email.");
        case 'Password should be at least 6 characters':
          throw new Error("A senha deve ter pelo menos 8 caracteres");
        case 'Signup is disabled':
          throw new Error("Novos cadastros estão temporariamente desabilitados");
        default:
          throw new Error("Erro ao criar conta. Tente novamente mais tarde.");
      }
    }
    
    console.log("Registration successful:", data.user?.email);
    return data;
    
  } catch (error: any) {
    console.error("Sign up error:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  const cleanEmail = sanitizeInput(email).toLowerCase();
  
  if (!cleanEmail) {
    throw new Error("Email é obrigatório");
  }
  
  if (!validateEmail(cleanEmail)) {
    throw new Error("Email inválido");
  }
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/new-password`,
    });
    
    if (error) {
      console.error("Reset password error:", error);
      throw new Error("Erro ao enviar email de redefinição. Verifique o endereço e tente novamente.");
    }
    
    return true;
  } catch (error: any) {
    console.error("Reset password error:", error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  if (!newPassword) {
    throw new Error("Nova senha é obrigatória");
  }
  
  if (newPassword.length < 8) {
    throw new Error("A senha deve ter pelo menos 8 caracteres");
  }
  
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error("Update password error:", error);
      throw new Error("Erro ao atualizar senha. Tente novamente mais tarde.");
    }
    
    return true;
  } catch (error: any) {
    console.error("Update password error:", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      throw new Error("Erro ao sair. Tente novamente mais tarde.");
    }
    
    // Clear any local storage
    localStorage.removeItem('userType');
    console.log("Logout successful");
    return true;
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw error;
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Get session error:", error);
      return null;
    }
    
    // Validate session user data
    if (session?.user && !validateUserData(session.user)) {
      console.error("Invalid user data in session");
      return null;
    }
    
    return session;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Get user error:", error);
      return null;
    }
    
    // Validate user data
    if (user && !validateUserData(user)) {
      console.error("Invalid user data received");
      return null;
    }
    
    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
};

export const verifySession = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return session !== null && session.expires_at ? new Date(session.expires_at * 1000) > new Date() : false;
};

export const setupAuthListener = (callback: (session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    // Validate session before passing to callback
    if (session?.user && !validateUserData(session.user)) {
      console.error("Invalid user data in auth state change");
      callback(null);
      return;
    }
    
    callback(session);
  });
  
  return subscription;
};

// Enhanced Google login with error handling
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/user-type-selection`
      }
    });
    
    if (error) {
      console.error("Google login error:", error);
      throw new Error("Erro ao fazer login com Google. Tente novamente.");
    }
    
    return data;
  } catch (error: any) {
    console.error("Google login error:", error);
    throw error;
  }
};

// Enhanced user type getter with better error handling
export const getUserType = async (): Promise<'solicitante' | 'freelancer' | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    // Try to get from user metadata first
    const userType = user.user_metadata?.user_type;
    if (userType && ['solicitante', 'freelancer'].includes(userType)) {
      console.log("User type from metadata:", userType, "for user:", user.id);
      return userType as 'solicitante' | 'freelancer';
    }
    
    // Fallback to localStorage (for Google auth users)
    const storedType = localStorage.getItem('userType');
    if (storedType && ['solicitante', 'freelancer'].includes(storedType)) {
      console.log("User type from localStorage:", storedType, "for user:", user.id);
      return storedType as 'solicitante' | 'freelancer';
    }
    
    console.warn("No user type found for user:", user.id);
    return null;
  } catch (error) {
    console.error("Error getting user type:", error);
    return null;
  }
};
