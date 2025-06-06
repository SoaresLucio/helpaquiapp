
import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminSyncService } from '@/services/adminSyncService';

interface UseAccessControlOptions {
  requiredUserType?: 'solicitante' | 'freelancer';
  redirectOnMismatch?: boolean;
  enableAdminSync?: boolean;
}

export const useAccessControl = (options: UseAccessControlOptions = {}) => {
  const { isAuthenticated, userType, loading, user } = useAuth();
  const navigate = useNavigate();
  const { requiredUserType, redirectOnMismatch = true, enableAdminSync = false } = options;

  // Verify user authentication and type
  const hasAccess = isAuthenticated && 
    (!requiredUserType || userType === requiredUserType);

  // Verify user ID consistency
  const isUserValid = user?.id && user.email;

  // Initialize admin sync if enabled and user has access
  useEffect(() => {
    if (enableAdminSync && hasAccess && isUserValid) {
      console.log('Inicializando sincronização administrativa...');
      
      // Verificar se o usuário tem permissão para usar o painel administrativo
      adminSyncService.checkSyncStatus().then(status => {
        console.log('Status da sincronização administrativa:', status);
      });
    }
  }, [enableAdminSync, hasAccess, isUserValid]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.warn('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (!loading && isAuthenticated && !isUserValid) {
      console.error('Invalid user data detected:', { userId: user?.id, email: user?.email });
      navigate('/login');
      return;
    }

    if (!loading && isAuthenticated && requiredUserType && userType !== requiredUserType) {
      console.warn(`Access control: User type '${userType}' cannot access '${requiredUserType}' content`);
      
      if (redirectOnMismatch) {
        // Redirect to appropriate home based on user type
        if (userType === 'solicitante') {
          navigate('/solicitante-plans');
        } else if (userType === 'freelancer') {
          navigate('/freelancer-plans');
        } else {
          navigate('/');
        }
      }
    }
  }, [isAuthenticated, userType, loading, requiredUserType, user, navigate, redirectOnMismatch, isUserValid]);

  return {
    hasAccess,
    isAuthenticated,
    userType,
    loading,
    isUserValid,
    userId: user?.id,
    // Métodos de sincronização administrativa
    syncService: enableAdminSync ? adminSyncService : null
  };
};
