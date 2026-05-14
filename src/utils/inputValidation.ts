
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

// validateEmail moved to @/utils/authValidation (single source of truth).
// Re-export for backwards compatibility — prefer importing from authValidation.
export { validateEmail } from './authValidation';

export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone || typeof phone !== 'string') {
    errors.push('Telefone é obrigatório');
    return { isValid: false, errors };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    errors.push('Telefone deve ter 10 ou 11 dígitos');
    return { isValid: false, errors };
  }

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

  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    errors.push('CPF inválido');
    return { isValid: false, errors };
  }

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

// validatePassword moved to @/utils/authValidation (single source of truth).
export { validatePassword } from './authValidation';

export const sanitizeText = (text: string, maxLength: number = 1000): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '')
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
