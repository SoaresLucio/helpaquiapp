
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/refactored/useAuth';

interface AccessControlOptions {
  requiredUserType?: 'solicitante' | 'freelancer';
  requireAuth?: boolean;
}

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

    if (authLoading) {
      return;
    }

    if (options.requireAuth !== false && !isAuthenticated) {
      console.log('❌ Acesso negado: usuário não autenticado');
      setHasAccess(false);
      setLoading(false);
      return;
    }

    if (options.requiredUserType && userType !== options.requiredUserType) {
      console.log('❌ Acesso negado: tipo de usuário incorreto');
      setHasAccess(false);
      setLoading(false);
      return;
    }

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
