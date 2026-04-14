
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email || typeof email !== 'string') {
    errors.push('Email é obrigatório');
    return { isValid: false, errors };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    errors.push('Email não pode estar vazio');
    return { isValid: false, errors };
  }

  if (trimmedEmail.length > 254) {
    errors.push('Email muito longo (máximo 254 caracteres)');
    return { isValid: false, errors };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    errors.push('Formato de email inválido');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedValue: trimmedEmail };
};

export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone || typeof phone !== 'string') {
    errors.push('Telefone é obrigatório');
    return { isValid: false, errors };
  }

  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    errors.push('Telefone deve ter 10 ou 11 dígitos');
    return { isValid: false, errors };
  }

  // Validação básica de telefone brasileiro
  if (cleanPhone.length === 11 && !['8', '9'].includes(cleanPhone[2])) {
    errors.push('Número de celular inválido');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedValue: cleanPhone };
};

export const validateCPF = (cpf: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!cpf || typeof cpf !== 'string') {
    errors.push('CPF é obrigatório');
    return { isValid: false, errors };
  }

  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) {
    errors.push('CPF deve ter 11 dígitos');
    return { isValid: false, errors };
  }

  // Verifica se não são todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    errors.push('CPF inválido');
    return { isValid: false, errors };
  }

  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  if (parseInt(cleanCPF[9]) !== digit1 || parseInt(cleanCPF[10]) !== digit2) {
    errors.push('CPF inválido');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedValue: cleanCPF };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Senha é obrigatória');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  if (password.length > 128) {
    errors.push('Senha muito longa (máximo 128 caracteres)');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  return { 
    isValid: errors.length === 0, 
    errors, 
    sanitizedValue: errors.length === 0 ? password : undefined 
  };
};

export const sanitizeText = (text: string, maxLength: number = 1000): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, maxLength);
};

export const validateBankAccount = (accountNumber: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!accountNumber || typeof accountNumber !== 'string') {
    errors.push('Número da conta é obrigatório');
    return { isValid: false, errors };
  }

  const cleanAccount = accountNumber.replace(/\D/g, '');
  
  if (cleanAccount.length < 4 || cleanAccount.length > 20) {
    errors.push('Número da conta deve ter entre 4 e 20 dígitos');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedValue: cleanAccount };
};

export const validateAmount = (amount: number | string): ValidationResult => {
  const errors: string[] = [];
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    errors.push('Valor deve ser um número válido');
    return { isValid: false, errors };
  }

  if (numAmount <= 0) {
    errors.push('Valor deve ser positivo');
    return { isValid: false, errors };
  }

  if (numAmount > 1000000) {
    errors.push('Valor muito alto (máximo R$ 1.000.000)');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [], sanitizedValue: numAmount.toString() };
};
