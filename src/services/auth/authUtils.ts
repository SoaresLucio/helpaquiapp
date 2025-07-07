
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { validateUserData } from "@/utils/authValidation";

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Get session error:", error);
      return null;
    }
    
    // Validate session user data
    if (session?.user) {
      const userValidation = validateUserData(session.user);
      if (!userValidation.isValid) {
        console.error("Invalid user data in session:", userValidation.error);
        return null;
      }
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
    if (user) {
      const userValidation = validateUserData(user);
      if (!userValidation.isValid) {
        console.error("Invalid user data received:", userValidation.error);
        return null;
      }
    }
    
    return user;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
};

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

export const setupAuthListener = (callback: (session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    // Validate session before passing to callback
    if (session?.user) {
      const userValidation = validateUserData(session.user);
      if (!userValidation.isValid) {
        console.error("Invalid user data in auth state change:", userValidation.error);
        callback(null);
        return;
      }
    }
    
    callback(session);
  });
  
  return subscription;
};

export const validateSession = async (): Promise<boolean> => {
  try {
    const session = await getCurrentSession();
    if (!session) {
      console.warn('Session validation failed: No active session');
      return false;
    }
    
    const userValidation = validateUserData(session.user);
    if (!userValidation.isValid) {
      console.error('Session validation failed:', userValidation.error);
      return false;
    }
    
    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at * 1000) <= new Date()) {
      console.warn('Session validation failed: Session expired');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

export const verifySession = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return session !== null && session.expires_at ? new Date(session.expires_at * 1000) > new Date() : false;
};
