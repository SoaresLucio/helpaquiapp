
import { User } from '@supabase/supabase-js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUserSession = (user: User | null): ValidationResult => {
  if (!user) {
    return { isValid: false, error: 'No user session found' };
  }

  if (!user.id) {
    return { isValid: false, error: 'Invalid user ID' };
  }

  if (!user.email) {
    return { isValid: false, error: 'Invalid user email' };
  }

  // Check if email is confirmed for production security
  if (process.env.NODE_ENV === 'production' && !user.email_confirmed_at) {
    return { isValid: false, error: 'Email not confirmed' };
  }

  return { isValid: true };
};

export const validateUserType = (userType: string | null): ValidationResult => {
  if (!userType) {
    return { isValid: false, error: 'No user type found' };
  }

  const validTypes = ['solicitante', 'freelancer'];
  if (!validTypes.includes(userType)) {
    return { isValid: false, error: 'Invalid user type' };
  }

  return { isValid: true };
};

export const validateUserAccess = (
  userType: string | null, 
  requiredType: string | null
): ValidationResult => {
  if (!requiredType) {
    return { isValid: true }; // No specific type required
  }

  const userValidation = validateUserType(userType);
  if (!userValidation.isValid) {
    return userValidation;
  }

  const requiredValidation = validateUserType(requiredType);
  if (!requiredValidation.isValid) {
    return requiredValidation;
  }

  if (userType !== requiredType) {
    return { 
      isValid: false, 
      error: `Access denied: User type '${userType}' cannot access '${requiredType}' content` 
    };
  }

  return { isValid: true };
};
