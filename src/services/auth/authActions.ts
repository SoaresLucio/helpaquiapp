
import { supabase } from "@/integrations/supabase/client";
import { 
  validateEmail, 
  validatePassword, 
  validateRegistrationData, 
  sanitizeInput 
} from "@/utils/authValidation";

export const signIn = async (email: string, password: string) => {
  // Basic validation for login - don't enforce complexity rules on existing passwords
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanPassword = password;
  
  const emailValidation = validateEmail(cleanEmail);
  if (!emailValidation.isValid) {
    throw new Error(emailValidation.error);
  }
  
  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres");
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword
    });
    
    if (error) {
      console.error("Authentication error:", error);
      
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
  userType: 'solicitante' | 'freelancer' | 'empresa',
  categories?: string[]
) => {
  // Enhanced validation using centralized validators
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanPassword = password; // Don't modify password
  const cleanFirstName = sanitizeInput(firstName);
  const cleanLastName = sanitizeInput(lastName);
  
  const registrationValidation = validateRegistrationData(
    cleanEmail, 
    cleanPassword, 
    cleanFirstName, 
    cleanLastName, 
    userType
  );
  
  if (!registrationValidation.isValid) {
    throw new Error(registrationValidation.error);
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
          user_type: userType,
          categories: categories || []
        }
      }
    });
    
    if (error) {
      console.error("Registration error:", error);
      
      // Log failed signup attempt
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_action: 'signup_failed',
        p_resource_type: 'auth',
        p_success: false,
        p_error_message: error.message,
        p_metadata: { email: cleanEmail, user_type: userType }
      });
      
      switch (error.message) {
        case 'User already registered':
          throw new Error("Este email já está cadastrado. Faça login ou use outro email.");
        case 'Password should be at least 6 characters':
          throw new Error("A senha deve ter pelo menos 6 caracteres");
        case 'Signup is disabled':
          throw new Error("Novos cadastros estão temporariamente desabilitados");
        default:
          throw new Error("Erro ao criar conta. Tente novamente mais tarde.");
      }
    }
    
    // Log successful signup
    if (data.user) {
      await supabase.rpc('log_security_event', {
        p_user_id: data.user.id,
        p_action: 'signup_success',
        p_resource_type: 'auth',
        p_success: true,
        p_metadata: { user_type: userType }
      });
    }
    
    console.log("Registration successful:", data.user?.email);
    return data;
    
  } catch (error: any) {
    console.error("Sign up error:", error);
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

export const resetPassword = async (email: string) => {
  const cleanEmail = sanitizeInput(email).toLowerCase();
  
  const emailValidation = validateEmail(cleanEmail);
  if (!emailValidation.isValid) {
    throw new Error(emailValidation.error);
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
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw new Error(passwordValidation.error);
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

export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/user-type`
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
