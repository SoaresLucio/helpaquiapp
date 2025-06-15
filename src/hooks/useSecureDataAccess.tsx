
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { validateDataAccess } from '@/utils/securityEnhancement';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useToast } from '@/components/ui/use-toast';

interface SecureAccessResult<T> {
  data: T | null;
  success: boolean;
  error?: string;
  securityScore?: number;
}

export const useSecureDataAccess = () => {
  const { user } = useAuth();
  const { logSecurityEvent } = useSecurityMonitor();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const secureAccess = useCallback(async <T>(
    operation: () => Promise<T>,
    resourceType: string,
    resourceId?: string
  ): Promise<SecureAccessResult<T>> => {
    if (!user?.id) {
      return { data: null, success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);

    try {
      const validation = await validateDataAccess(user.id, resourceType, resourceId);
      
      if (!validation.isValid) {
        await logSecurityEvent(
          `${resourceType}_access_denied`,
          resourceType,
          false,
          validation.errors.join(', ')
        );

        return {
          data: null,
          success: false,
          error: validation.errors.join(', '),
          securityScore: validation.securityScore,
        };
      }

      const data = await operation();

      await logSecurityEvent(
        `${resourceType}_access_granted`,
        resourceType,
        true,
        undefined,
        { security_score: validation.securityScore }
      );

      return {
        data,
        success: true,
        securityScore: validation.securityScore,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      await logSecurityEvent(
        `${resourceType}_access_error`,
        resourceType,
        false,
        errorMessage
      );

      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [user?.id, logSecurityEvent]);

  const secureWrite = useCallback(async <T>(
    operation: () => Promise<T>,
    resourceType: string,
    resourceId?: string,
    validationData?: any
  ): Promise<SecureAccessResult<T>> => {
    if (!user?.id) {
      return { data: null, success: false, error: 'Usuário não autenticado' };
    }

    setLoading(true);

    try {
      const validation = await validateDataAccess(user.id, resourceType, resourceId);
      
      if (!validation.isValid) {
        await logSecurityEvent(
          `${resourceType}_write_denied`,
          resourceType,
          false,
          validation.errors.join(', ')
        );

        toast({
          title: "Acesso Negado",
          description: validation.errors.join(', '),
          variant: "destructive",
        });

        return {
          data: null,
          success: false,
          error: validation.errors.join(', '),
          securityScore: validation.securityScore,
        };
      }

      if (validation.securityScore < 70 && ['bank_details', 'payment'].includes(resourceType)) {
        toast({
          title: "Segurança Insuficiente",
          description: "Complete e verifique seu perfil para realizar esta operação",
          variant: "destructive",
        });

        return {
          data: null,
          success: false,
          error: 'Nível de segurança insuficiente',
          securityScore: validation.securityScore,
        };
      }

      const data = await operation();

      await logSecurityEvent(
        `${resourceType}_write_success`,
        resourceType,
        true,
        undefined,
        { 
          security_score: validation.securityScore,
          validation_data: validationData, 
        }
      );

      return {
        data,
        success: true,
        securityScore: validation.securityScore,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      await logSecurityEvent(
        `${resourceType}_write_error`,
        resourceType,
        false,
        errorMessage
      );

      toast({
        title: "Erro na Operação",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        data: null,
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, [user?.id, logSecurityEvent, toast]);

  return {
    secureAccess,
    secureWrite,
    loading,
  };
};
