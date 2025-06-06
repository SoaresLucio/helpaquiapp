
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: 'login_attempt' | 'rate_limit_exceeded' | 'suspicious_activity' | 'data_access' | 'validation_error';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
}

class SecurityService {
  private rateLimitStore = new Map<string, { count: number; resetTime: number; blocked: boolean }>();
  
  // Configurações de rate limiting por tipo de operação
  private rateLimitConfigs: Record<string, RateLimitConfig> = {
    login: { windowMs: 15 * 60 * 1000, maxAttempts: 5, blockDurationMs: 30 * 60 * 1000 }, // 5 tentativas em 15min, bloqueio 30min
    signup: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDurationMs: 60 * 60 * 1000 }, // 3 tentativas em 1h, bloqueio 1h
    password_reset: { windowMs: 60 * 60 * 1000, maxAttempts: 3, blockDurationMs: 60 * 60 * 1000 },
    api_call: { windowMs: 60 * 1000, maxAttempts: 100, blockDurationMs: 5 * 60 * 1000 } // 100 calls/min, bloqueio 5min
  };

  // Validação e sanitização de entrada
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove caracteres perigosos
      .replace(/javascript:/gi, '') // Remove protocolo javascript
      .replace(/data:/gi, '') // Remove protocolo data
      .replace(/vbscript:/gi, '') // Remove protocolo vbscript
      .substring(0, 1000); // Limita tamanho
  }

  // Validação de email mais rigorosa
  validateEmail(email: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const sanitizedEmail = this.sanitizeInput(email).toLowerCase();
    
    if (!sanitizedEmail) {
      errors.push('Email é obrigatório');
      return { isValid: false, errors };
    }

    // Regex mais rigorosa para email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(sanitizedEmail)) {
      errors.push('Formato de email inválido');
    }

    if (sanitizedEmail.length > 254) {
      errors.push('Email muito longo');
    }

    // Lista de domínios bloqueados (temporários/suspeitos)
    const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = sanitizedEmail.split('@')[1];
    if (blockedDomains.includes(domain)) {
      errors.push('Domínio de email não permitido');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Validação de senha mais rigorosa
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Senha é obrigatória');
      return { isValid: false, errors };
    }

    if (password.length < 12) {
      errors.push('Senha deve ter pelo menos 12 caracteres');
    }

    if (password.length > 128) {
      errors.push('Senha muito longa');
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

    // Verificar senhas comuns
    const commonPasswords = ['123456789012', 'password123!', 'admin123456!'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Senha muito comum, escolha uma mais segura');
    }

    return { isValid: errors.length === 0, errors };
  }

  // Rate limiting
  checkRateLimit(identifier: string, operationType: string): { allowed: boolean; retryAfter?: number } {
    const config = this.rateLimitConfigs[operationType] || this.rateLimitConfigs.api_call;
    const now = Date.now();
    const key = `${operationType}:${identifier}`;
    
    let record = this.rateLimitStore.get(key);
    
    if (!record) {
      record = { count: 0, resetTime: now + config.windowMs, blocked: false };
      this.rateLimitStore.set(key, record);
    }

    // Verificar se está bloqueado
    if (record.blocked) {
      const blockExpiry = record.resetTime + config.blockDurationMs;
      if (now < blockExpiry) {
        this.logSecurityEvent({
          event_type: 'rate_limit_exceeded',
          metadata: { identifier, operationType, attemptsBlocked: true },
          risk_level: 'high'
        });
        return { allowed: false, retryAfter: Math.ceil((blockExpiry - now) / 1000) };
      } else {
        // Desbloquear
        record.blocked = false;
        record.count = 0;
        record.resetTime = now + config.windowMs;
      }
    }

    // Reset do contador se a janela expirou
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + config.windowMs;
    }

    record.count++;

    if (record.count > config.maxAttempts) {
      record.blocked = true;
      this.logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        metadata: { identifier, operationType, attempts: record.count },
        risk_level: 'critical'
      });
      return { allowed: false, retryAfter: Math.ceil(config.blockDurationMs / 1000) };
    }

    return { allowed: true };
  }

  // Detectar atividade suspeita
  detectSuspiciousActivity(userAgent?: string, ipAddress?: string): boolean {
    if (!userAgent || !ipAddress) return false;

    // Detectar bots/crawlers suspeitos
    const suspiciousUserAgents = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python', 'requests'
    ];
    
    const isSuspiciousUA = suspiciousUserAgents.some(agent => 
      userAgent.toLowerCase().includes(agent)
    );

    // Detectar IPs suspeitos (lista básica)
    const suspiciousIPs = ['127.0.0.1', '0.0.0.0'];
    const isSuspiciousIP = suspiciousIPs.includes(ipAddress);

    if (isSuspiciousUA || isSuspiciousIP) {
      this.logSecurityEvent({
        event_type: 'suspicious_activity',
        metadata: { userAgent, ipAddress, reason: isSuspiciousUA ? 'suspicious_user_agent' : 'suspicious_ip' },
        risk_level: 'medium'
      });
      return true;
    }

    return false;
  }

  // Log de eventos de segurança
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          action: event.event_type,
          resource_type: 'security',
          user_id: event.user_id || null,
          ip_address: event.ip_address || null,
          user_agent: event.user_agent || null,
          success: event.risk_level === 'low',
          metadata: {
            ...event.metadata,
            risk_level: event.risk_level,
            timestamp: new Date().toISOString()
          },
          error_message: event.risk_level === 'critical' ? 'Security threat detected' : null
        });

      if (error) {
        console.error('Erro ao registrar evento de segurança:', error);
      }

      // Para eventos críticos, alertar imediatamente
      if (event.risk_level === 'critical') {
        console.warn('🚨 ALERTA DE SEGURANÇA CRÍTICO:', event);
      }
    } catch (error) {
      console.error('Erro crítico no sistema de segurança:', error);
    }
  }

  // Validar sessão de forma mais rigorosa
  async validateSession(sessionToken?: string): Promise<{ isValid: boolean; userId?: string; reason?: string }> {
    if (!sessionToken) {
      return { isValid: false, reason: 'No session token provided' };
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(sessionToken);
      
      if (error || !user) {
        await this.logSecurityEvent({
          event_type: 'suspicious_activity',
          metadata: { reason: 'invalid_session_token', error: error?.message },
          risk_level: 'medium'
        });
        return { isValid: false, reason: 'Invalid session token' };
      }

      return { isValid: true, userId: user.id };
    } catch (error) {
      await this.logSecurityEvent({
        event_type: 'suspicious_activity',
        metadata: { reason: 'session_validation_error', error: String(error) },
        risk_level: 'high'
      });
      return { isValid: false, reason: 'Session validation failed' };
    }
  }

  // Validar dados de entrada para APIs
  validateApiInput(data: any, schema: Record<string, any>): { isValid: boolean; errors: string[]; sanitizedData?: any } {
    const errors: string[] = [];
    const sanitizedData: any = {};

    for (const [key, rules] of Object.entries(schema)) {
      const value = data[key];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${key} é obrigatório`);
        continue;
      }

      if (value !== undefined && value !== null) {
        let sanitizedValue = value;

        // Sanitizar strings
        if (typeof value === 'string') {
          sanitizedValue = this.sanitizeInput(value);
          
          if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
            errors.push(`${key} excede o tamanho máximo de ${rules.maxLength} caracteres`);
            continue;
          }

          if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
            errors.push(`${key} tem formato inválido`);
            continue;
          }
        }

        // Validar números
        if (rules.type === 'number') {
          const num = Number(sanitizedValue);
          if (isNaN(num)) {
            errors.push(`${key} deve ser um número`);
            continue;
          }
          if (rules.min !== undefined && num < rules.min) {
            errors.push(`${key} deve ser pelo menos ${rules.min}`);
            continue;
          }
          if (rules.max !== undefined && num > rules.max) {
            errors.push(`${key} deve ser no máximo ${rules.max}`);
            continue;
          }
          sanitizedValue = num;
        }

        sanitizedData[key] = sanitizedValue;
      }
    }

    return { isValid: errors.length === 0, errors, sanitizedData };
  }

  // Limpar dados sensíveis dos logs
  sanitizeLogData(data: any): any {
    const sensitiveFields = ['password', 'token', 'session', 'secret', 'key', 'credential'];
    const sanitized = { ...data };

    const redactValue = (obj: any, path: string = ''): any => {
      if (obj === null || obj === undefined) return obj;
      
      if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.map((item, index) => redactValue(item, `${path}[${index}]`));
        } else {
          const result: any = {};
          for (const [key, value] of Object.entries(obj)) {
            const lowerKey = key.toLowerCase();
            if (sensitiveFields.some(field => lowerKey.includes(field))) {
              result[key] = '[REDACTED]';
            } else {
              result[key] = redactValue(value, `${path}.${key}`);
            }
          }
          return result;
        }
      }
      
      return obj;
    };

    return redactValue(sanitized);
  }

  // Headers de segurança
  getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
    };
  }
}

export const securityService = new SecurityService();

// Schemas de validação para diferentes endpoints
export const validationSchemas = {
  login: {
    email: { required: true, type: 'string', maxLength: 254 },
    password: { required: true, type: 'string', maxLength: 128 }
  },
  signup: {
    email: { required: true, type: 'string', maxLength: 254 },
    password: { required: true, type: 'string', maxLength: 128 },
    firstName: { required: true, type: 'string', maxLength: 50, pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/ },
    lastName: { required: true, type: 'string', maxLength: 50, pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/ }
  },
  serviceRequest: {
    title: { required: true, type: 'string', maxLength: 200 },
    description: { required: false, type: 'string', maxLength: 2000 },
    category: { required: true, type: 'string', maxLength: 100 },
    budget_min: { required: false, type: 'number', min: 0, max: 1000000 },
    budget_max: { required: false, type: 'number', min: 0, max: 1000000 }
  },
  profile: {
    firstName: { required: false, type: 'string', maxLength: 50, pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/ },
    lastName: { required: false, type: 'string', maxLength: 50, pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/ },
    phone: { required: false, type: 'string', maxLength: 20, pattern: /^\+?[\d\s\-\(\)]{10,}$/ },
    address: { required: false, type: 'string', maxLength: 500 }
  }
};
