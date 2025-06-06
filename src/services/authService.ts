import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { securityService } from './securityService';

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

// Enhanced user validation function com verificações de segurança
export const validateUserData = (user: User | null): boolean => {
  if (!user) {
    securityService.logSecurityEvent({
      event_type: 'validation_error',
      metadata: { reason: 'no_user_provided' },
      risk_level: 'medium'
    });
    return false;
  }
  
  if (!user.id) {
    securityService.logSecurityEvent({
      event_type: 'validation_error',
      user_id: user.id,
      metadata: { reason: 'missing_user_id' },
      risk_level: 'high'
    });
    return false;
  }
  
  if (!user.email) {
    securityService.logSecurityEvent({
      event_type: 'validation_error',
      user_id: user.id,
      metadata: { reason: 'missing_email' },
      risk_level: 'high'
    });
    return false;
  }
  
  const emailValidation = securityService.validateEmail(user.email);
  if (!emailValidation.isValid) {
    securityService.logSecurityEvent({
      event_type: 'validation_error',
      user_id: user.id,
      metadata: { reason: 'invalid_email_format', errors: emailValidation.errors },
      risk_level: 'high'
    });
    return false;
  }
  
  return true;
};

// Enhanced session validation com verificações de segurança
export const validateSession = async (): Promise<boolean> => {
  try {
    const session = await getCurrentSession();
    if (!session) {
      await securityService.logSecurityEvent({
        event_type: 'suspicious_activity',
        metadata: { reason: 'no_active_session' },
        risk_level: 'medium'
      });
      return false;
    }
    
    if (!session.user || !validateUserData(session.user)) {
      await securityService.logSecurityEvent({
        event_type: 'suspicious_activity',
        user_id: session.user?.id,
        metadata: { reason: 'invalid_user_data_in_session' },
        risk_level: 'high'
      });
      return false;
    }
    
    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
      await securityService.logSecurityEvent({
        event_type: 'suspicious_activity',
        user_id: session.user.id,
        metadata: { reason: 'session_expired' },
        risk_level: 'medium'
      });
      return false;
    }
    
    return true;
  } catch (error) {
    await securityService.logSecurityEvent({
      event_type: 'suspicious_activity',
      metadata: { reason: 'session_validation_error', error: String(error) },
      risk_level: 'high'
    });
    return false;
  }
};

export const signIn = async (email: string, password: string) => {
  // Rate limiting check
  const identifier = `${navigator.userAgent}_signin`;
  const rateLimitResult = securityService.checkRateLimit(identifier, 'login');
  if (!rateLimitResult.allowed) {
    throw new Error(`Muitas tentativas de login. Tente novamente em ${rateLimitResult.retryAfter} segundos.`);
  }

  // Enhanced validation com sanitização
  const cleanEmail = securityService.sanitizeInput(email).toLowerCase();
  
  if (!cleanEmail || !password) {
    await securityService.logSecurityEvent({
      event_type: 'login_attempt',
      metadata: { reason: 'missing_credentials', email: cleanEmail },
      risk_level: 'medium'
    });
    throw new Error("Email e senha são obrigatórios");
  }
  
  const emailValidation = securityService.validateEmail(cleanEmail);
  if (!emailValidation.isValid) {
    await securityService.logSecurityEvent({
      event_type: 'login_attempt',
      metadata: { reason: 'invalid_email', email: cleanEmail, errors: emailValidation.errors },
      risk_level: 'medium'
    });
    throw new Error(emailValidation.errors[0]);
  }
  
  const passwordValidation = securityService.validatePassword(password);
  if (!passwordValidation.isValid) {
    await securityService.logSecurityEvent({
      event_type: 'login_attempt',
      metadata: { reason: 'weak_password', email: cleanEmail },
      risk_level: 'medium'
    });
    throw new Error("Senha não atende aos critérios de segurança");
  }

  // Detectar atividade suspeita
  const isSuspicious = securityService.detectSuspiciousActivity(navigator.userAgent);
  if (isSuspicious) {
    await securityService.logSecurityEvent({
      event_type: 'suspicious_activity',
      metadata: { reason: 'suspicious_login_attempt', email: cleanEmail },
      risk_level: 'critical'
    });
    throw new Error("Atividade suspeita detectada. Contate o suporte.");
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });
    
    if (error) {
      await securityService.logSecurityEvent({
        event_type: 'login_attempt',
        metadata: { 
          reason: 'authentication_failed', 
          email: cleanEmail, 
          error: error.message,
          userAgent: navigator.userAgent
        },
        risk_level: error.message.includes('Invalid') ? 'medium' : 'high'
      });
      
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
      await securityService.logSecurityEvent({
        event_type: 'suspicious_activity',
        user_id: data.user.id,
        metadata: { reason: 'invalid_user_data_post_login' },
        risk_level: 'critical'
      });
      throw new Error("Dados de usuário inválidos. Entre em contato com o suporte.");
    }
    
    // Log successful login
    await securityService.logSecurityEvent({
      event_type: 'login_attempt',
      user_id: data.user?.id,
      metadata: { 
        email: cleanEmail, 
        success: true,
        userAgent: navigator.userAgent
      },
      risk_level: 'low'
    });
    
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
  // Rate limiting check
  const identifier = `${navigator.userAgent}_signup`;
  const rateLimitResult = securityService.checkRateLimit(identifier, 'signup');
  if (!rateLimitResult.allowed) {
    throw new Error(`Muitas tentativas de cadastro. Tente novamente em ${rateLimitResult.retryAfter} segundos.`);
  }

  // Enhanced validation e sanitização
  const cleanEmail = securityService.sanitizeInput(email).toLowerCase();
  const cleanFirstName = securityService.sanitizeInput(firstName);
  const cleanLastName = securityService.sanitizeInput(lastName);
  
  if (!cleanEmail || !password || !cleanFirstName || !cleanLastName) {
    await securityService.logSecurityEvent({
      event_type: 'suspicious_activity',
      metadata: { reason: 'missing_required_fields', email: cleanEmail },
      risk_level: 'medium'
    });
    throw new Error("Todos os campos são obrigatórios");
  }
  
  const emailValidation = securityService.validateEmail(cleanEmail);
  if (!emailValidation.isValid) {
    await securityService.logSecurityEvent({
      event_type: 'suspicious_activity',
      metadata: { reason: 'invalid_email_signup', email: cleanEmail, errors: emailValidation.errors },
      risk_level: 'medium'
    });
    throw new Error(emailValidation.errors[0]);
  }
  
  // Enhanced password validation
  const passwordValidation = securityService.validatePassword(password);
  if (!passwordValidation.isValid) {
    await securityService.logSecurityEvent({
      event_type: 'suspicious_activity',
      metadata: { reason: 'weak_password_signup', email: cleanEmail },
      risk_level: 'medium'
    });
    throw new Error(passwordValidation.errors[0]);
  }
  
  if (cleanFirstName.length < 2 || cleanLastName.length < 2) {
    throw new Error("Nome e sobrenome devem ter pelo menos 2 caracteres");
  }

  // Verificar nomes suspeitos
  const suspiciousNames = ['test', 'admin', 'root', 'user', 'null', 'undefined'];
  if (suspiciousNames.includes(cleanFirstName.toLowerCase()) || 
      suspiciousNames.includes(cleanLastName.toLowerCase())) {
    await securityService.logSecurityEvent({
      event_type: 'suspicious_activity',
      metadata: { reason: 'suspicious_name', email: cleanEmail, firstName: cleanFirstName, lastName: cleanLastName },
      risk_level: 'high'
    });
    throw new Error("Nome suspeito detectado. Use seu nome real.");
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
      await securityService.logSecurityEvent({
        event_type: 'suspicious_activity',
        metadata: { 
          reason: 'registration_failed', 
          email: cleanEmail, 
          error: error.message,
          userType 
        },
        risk_level: 'medium'
      });
      
      switch (error.message) {
        case 'User already registered':
          throw new Error("Este email já está cadastrado. Faça login ou use outro email.");
        case 'Password should be at least 6 characters':
          throw new Error("A senha deve ter pelo menos 12 caracteres");
        case 'Signup is disabled':
          throw new Error("Novos cadastros estão temporariamente desabilitados");
        default:
          throw new Error("Erro ao criar conta. Tente novamente mais tarde.");
      }
    }
    
    // Log successful registration
    await securityService.logSecurityEvent({
      event_type: 'login_attempt',
      user_id: data.user?.id,
      metadata: { 
        email: cleanEmail, 
        success: true, 
        userType,
        action: 'registration'
      },
      risk_level: 'low'
    });
    
    console.log("Registration successful:", data.user?.email);
    return data;
    
  } catch (error: any) {
    console.error("Sign up error:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  // Rate limiting check
  const identifier = `${navigator.userAgent}_reset`;
  const rateLimitResult = securityService.checkRateLimit(identifier, 'password_reset');
  if (!rateLimitResult.allowed) {
    throw new Error(`Muitas tentativas de redefinição. Tente novamente em ${rateLimitResult.retryAfter} segundos.`);
  }

  const cleanEmail = securityService.sanitizeInput(email).toLowerCase();
  
  if (!cleanEmail) {
    throw new Error("Email é obrigatório");
  }
  
  const emailValidation = securityService.validateEmail(cleanEmail);
  if (!emailValidation.isValid) {
    throw new Error(emailValidation.errors[0]);
  }
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/new-password`,
    });
    
    if (error) {
      await securityService.logSecurityEvent({
        event_type: 'suspicious_activity',
        metadata: { reason: 'password_reset_failed', email: cleanEmail, error: error.message },
        risk_level: 'medium'
      });
      throw new Error("Erro ao enviar email de redefinição. Verifique o endereço e tente novamente.");
    }
    
    await securityService.logSecurityEvent({
      event_type: 'data_access',
      metadata: { action: 'password_reset_requested', email: cleanEmail },
      risk_level: 'low'
    });
    
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
  
  // Enhanced password validation
  if (newPassword.length < 8) {
    throw new Error("A senha deve ter pelo menos 8 caracteres");
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    throw new Error("A senha deve conter letras maiúsculas, minúsculas e números");
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
