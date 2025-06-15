
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

// Add the missing validation functions needed by authActions
export const validateEmail = (email: string): UserValidation => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email é obrigatório' };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return { isValid: false, error: 'Email não pode estar vazio' };
  }

  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email muito longo (máximo 254 caracteres)' };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Formato de email inválido' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): UserValidation => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Senha é obrigatória' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Senha deve ter pelo menos 6 caracteres' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Senha muito longa (máximo 128 caracteres)' };
  }

  return { isValid: true };
};

export const validateRegistrationData = (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  userType: 'solicitante' | 'freelancer'
): UserValidation => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  if (!firstName || firstName.trim().length === 0) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }

  if (!lastName || lastName.trim().length === 0) {
    return { isValid: false, error: 'Sobrenome é obrigatório' };
  }

  if (!userType || !['solicitante', 'freelancer'].includes(userType)) {
    return { isValid: false, error: 'Tipo de usuário inválido' };
  }

  return { isValid: true };
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/['"]/g, ''); // Remove quotes
};
