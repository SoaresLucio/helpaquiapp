
import { User } from '@supabase/supabase-js';

export interface UserValidation {
  isValid: boolean;
  error?: string;
}

export const validateUserData = (user: User): UserValidation => {
  if (!user.id) {
    return { isValid: false, error: 'User ID is missing' };
  }

  if (!user.email) {
    return { isValid: false, error: 'User email is missing' };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for suspicious user data
  if (user.id.length !== 36) { // UUID should be 36 characters
    return { isValid: false, error: 'Invalid user ID format' };
  }

  return { isValid: true };
};

export const validateUserMetadata = (metadata: any): UserValidation => {
  if (!metadata) {
    return { isValid: true }; // Metadata is optional
  }

  // Check for required fields if they exist
  if (metadata.user_type && !['solicitante', 'freelancer'].includes(metadata.user_type)) {
    return { isValid: false, error: 'Invalid user type in metadata' };
  }

  return { isValid: true };
};
