
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Enhanced email validation with better regex and domain checks
export const validateEmail = (email: string): ValidationResult => {
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanEmail) {
    return { isValid: false, error: "Email é obrigatório" };
  }
  
  // More comprehensive email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(cleanEmail)) {
    return { isValid: false, error: "Formato de e-mail inválido" };
  }
  
  return { isValid: true };
};

// Enhanced password validation with detailed requirements
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Senha é obrigatória" };
  }
  
  if (password.length < 8) {
    return { isValid: false, error: "A senha deve ter pelo menos 8 caracteres" };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: "A senha deve conter pelo menos uma letra minúscula" };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: "A senha deve conter pelo menos uma letra maiúscula" };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: "A senha deve conter pelo menos um número" };
  }
  
  return { isValid: true };
};

// Name validation for registration
export const validateName = (name: string, fieldName: string): ValidationResult => {
  const cleanName = name.trim();
  
  if (!cleanName) {
    return { isValid: false, error: `${fieldName} é obrigatório` };
  }
  
  if (cleanName.length < 2) {
    return { isValid: false, error: `${fieldName} deve ter pelo menos 2 caracteres` };
  }
  
  if (cleanName.length > 50) {
    return { isValid: false, error: `${fieldName} deve ter no máximo 50 caracteres` };
  }
  
  // Check for invalid characters
  if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(cleanName)) {
    return { isValid: false, error: `${fieldName} contém caracteres inválidos` };
  }
  
  return { isValid: true };
};

// Comprehensive registration validation
export const validateRegistrationData = (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  userType: 'solicitante' | 'freelancer' | 'empresa'
): ValidationResult => {
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  const firstNameValidation = validateName(firstName, "Nome");
  if (!firstNameValidation.isValid) {
    return firstNameValidation;
  }
  
  const lastNameValidation = validateName(lastName, "Sobrenome");
  if (!lastNameValidation.isValid) {
    return lastNameValidation;
  }
  
  if (!['solicitante', 'freelancer'].includes(userType)) {
    return { isValid: false, error: "Tipo de usuário inválido" };
  }
  
  return { isValid: true };
};

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// User data validation for auth responses
export const validateUserData = (user: any): ValidationResult => {
  if (!user) {
    return { isValid: false, error: "Dados de usuário não fornecidos" };
  }
  
  if (!user.id) {
    return { isValid: false, error: "ID do usuário ausente" };
  }
  
  if (!user.email) {
    return { isValid: false, error: "Email do usuário ausente" };
  }
  
  const emailValidation = validateEmail(user.email);
  if (!emailValidation.isValid) {
    return { isValid: false, error: "Email do usuário inválido" };
  }
  
  return { isValid: true };
};
