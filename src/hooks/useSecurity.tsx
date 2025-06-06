
import { useState, useEffect, useCallback } from 'react';
import { securityService, validationSchemas } from '@/services/securityService';
import { useToast } from '@/components/ui/use-toast';

interface SecurityState {
  isBlocked: boolean;
  retryAfter?: number;
  lastSecurityCheck: Date | null;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export const useSecurity = () => {
  const [securityState, setSecurityState] = useState<SecurityState>({
    isBlocked: false,
    retryAfter: undefined,
    lastSecurityCheck: null,
    threatLevel: 'low'
  });
  const { toast } = useToast();

  // Obter informações do cliente para análise de segurança
  const getClientInfo = useCallback(() => {
    return {
      userAgent: navigator.userAgent,
      ipAddress: '', // Seria obtido do servidor em implementação real
      timestamp: new Date().toISOString(),
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }, []);

  // Verificar rate limiting
  const checkRateLimit = useCallback((operationType: string): boolean => {
    const clientInfo = getClientInfo();
    const identifier = `${clientInfo.userAgent}_${clientInfo.ipAddress}`;
    
    const result = securityService.checkRateLimit(identifier, operationType);
    
    if (!result.allowed) {
      setSecurityState(prev => ({
        ...prev,
        isBlocked: true,
        retryAfter: result.retryAfter,
        threatLevel: 'high'
      }));
      
      toast({
        title: "⚠️ Limite de tentativas excedido",
        description: `Muitas tentativas detectadas. Tente novamente em ${result.retryAfter} segundos.`,
        variant: "destructive"
      });
      
      return false;
    }
    
    return true;
  }, [getClientInfo, toast]);

  // Validar entrada do usuário
  const validateInput = useCallback((data: any, schemaName: keyof typeof validationSchemas) => {
    const schema = validationSchemas[schemaName];
    const result = securityService.validateApiInput(data, schema);
    
    if (!result.isValid) {
      toast({
        title: "❌ Dados inválidos",
        description: result.errors[0],
        variant: "destructive"
      });
      
      // Log tentativa de entrada inválida
      securityService.logSecurityEvent({
        event_type: 'validation_error',
        metadata: { 
          schema: schemaName, 
          errors: result.errors,
          clientInfo: getClientInfo()
        },
        risk_level: 'medium'
      });
    }
    
    return result;
  }, [toast, getClientInfo]);

  // Validar email com verificações de segurança
  const validateEmail = useCallback((email: string) => {
    const result = securityService.validateEmail(email);
    
    if (!result.isValid) {
      toast({
        title: "❌ Email inválido",
        description: result.errors[0],
        variant: "destructive"
      });
    }
    
    return result;
  }, [toast]);

  // Validar senha com verificações de segurança
  const validatePassword = useCallback((password: string) => {
    const result = securityService.validatePassword(password);
    
    if (!result.isValid) {
      toast({
        title: "❌ Senha insegura",
        description: result.errors[0],
        variant: "destructive"
      });
    }
    
    return result;
  }, [toast]);

  // Detectar atividade suspeita
  const checkSuspiciousActivity = useCallback(() => {
    const clientInfo = getClientInfo();
    const isSuspicious = securityService.detectSuspiciousActivity(
      clientInfo.userAgent,
      clientInfo.ipAddress
    );
    
    if (isSuspicious) {
      setSecurityState(prev => ({
        ...prev,
        threatLevel: 'critical'
      }));
      
      toast({
        title: "🚨 Atividade suspeita detectada",
        description: "Sua sessão está sendo monitorada por motivos de segurança.",
        variant: "destructive"
      });
    }
    
    return !isSuspicious;
  }, [getClientInfo, toast]);

  // Log de ação do usuário (para auditoria)
  const logUserAction = useCallback(async (action: string, metadata?: any) => {
    try {
      await securityService.logSecurityEvent({
        event_type: 'data_access',
        metadata: {
          action,
          ...metadata,
          clientInfo: getClientInfo(),
          timestamp: new Date().toISOString()
        },
        risk_level: 'low'
      });
    } catch (error) {
      console.error('Erro ao registrar ação do usuário:', error);
    }
  }, [getClientInfo]);

  // Verificação de segurança periódica
  useEffect(() => {
    const performSecurityCheck = () => {
      const isValid = checkSuspiciousActivity();
      
      setSecurityState(prev => ({
        ...prev,
        lastSecurityCheck: new Date(),
        threatLevel: isValid ? 'low' : 'critical'
      }));
    };

    // Verificação inicial
    performSecurityCheck();
    
    // Verificação a cada 5 minutos
    const interval = setInterval(performSecurityCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkSuspiciousActivity]);

  // Reset do bloqueio quando retryAfter expira
  useEffect(() => {
    if (securityState.isBlocked && securityState.retryAfter) {
      const timeout = setTimeout(() => {
        setSecurityState(prev => ({
          ...prev,
          isBlocked: false,
          retryAfter: undefined,
          threatLevel: 'low'
        }));
      }, securityState.retryAfter * 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [securityState.isBlocked, securityState.retryAfter]);

  return {
    securityState,
    checkRateLimit,
    validateInput,
    validateEmail,
    validatePassword,
    checkSuspiciousActivity,
    logUserAction,
    securityService
  };
};
