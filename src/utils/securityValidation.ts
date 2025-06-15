
import { User } from '@supabase/supabase-js';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
}

export const validateUserSession = (user: User | null): ValidationResult => {
  if (!user) {
    return { isValid: false, error: 'No user session', code: 'NO_SESSION' };
  }

  if (!user.id || typeof user.id !== 'string') {
    return { isValid: false, error: 'Invalid user ID', code: 'INVALID_USER_ID' };
  }

  if (!user.email || typeof user.email !== 'string') {
    return { isValid: false, error: 'Invalid user email', code: 'INVALID_EMAIL' };
  }

  // Check if email is properly formatted
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    return { isValid: false, error: 'Malformed email', code: 'MALFORMED_EMAIL' };
  }

  return { isValid: true };
};

export const validateUserType = (userType: string | null): ValidationResult => {
  if (!userType) {
    return { isValid: false, error: 'User type is required', code: 'MISSING_USER_TYPE' };
  }

  const validTypes = ['solicitante', 'freelancer'];
  if (!validTypes.includes(userType)) {
    return { isValid: false, error: 'Invalid user type', code: 'INVALID_USER_TYPE' };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
};

export const validateProfileData = (data: any): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid profile data', code: 'INVALID_DATA' };
  }

  // Validate names if present
  if (data.first_name && (typeof data.first_name !== 'string' || data.first_name.length > 50)) {
    return { isValid: false, error: 'Invalid first name', code: 'INVALID_FIRST_NAME' };
  }

  if (data.last_name && (typeof data.last_name !== 'string' || data.last_name.length > 50)) {
    return { isValid: false, error: 'Invalid last name', code: 'INVALID_LAST_NAME' };
  }

  // Validate phone if present
  if (data.phone && (typeof data.phone !== 'string' || data.phone.length > 20)) {
    return { isValid: false, error: 'Invalid phone number', code: 'INVALID_PHONE' };
  }

  return { isValid: true };
};
