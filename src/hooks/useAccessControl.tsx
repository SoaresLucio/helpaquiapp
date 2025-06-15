
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AccessControlOptions {
  requiredUserType?: 'solicitante' | 'freelancer';
  requireAuth?: boolean;
}

/**
 * Hook para controle de acesso a páginas e funcionalidades
 * Verifica se o usuário tem permissão para acessar determinado recurso
 * 
 * @param options - Opções de controle de acesso
 * @returns Estado de acesso, tipo de usuário, ID do usuário e carregamento
 */
export const useAccessControl = (options: AccessControlOptions = {}) => {
  const { isAuthenticated, userType, loading: authLoading, user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Verificando controle de acesso:', { 
      isAuthenticated, 
      userType, 
      userId: user?.id,
      requiredUserType: options.requiredUserType,
      requireAuth: options.requireAuth 
    });

    // Se ainda está carregando a autenticação, aguardar
    if (authLoading) {
      return;
    }

    // Verificar se autenticação é necessária
    if (options.requireAuth !== false && !isAuthenticated) {
      console.log('❌ Acesso negado: usuário não autenticado');
      setHasAccess(false);
      setLoading(false);
      return;
    }

    // Verificar tipo de usuário específico
    if (options.requiredUserType && userType !== options.requiredUserType) {
      console.log('❌ Acesso negado: tipo de usuário incorreto');
      setHasAccess(false);
      setLoading(false);
      return;
    }

    // Acesso liberado
    console.log('✅ Acesso permitido');
    setHasAccess(true);
    setLoading(false);
  }, [isAuthenticated, userType, authLoading, user?.id, options.requiredUserType, options.requireAuth]);

  return {
    hasAccess,
    userType,
    userId: user?.id,
    loading,
    isAuthenticated
  };
};
