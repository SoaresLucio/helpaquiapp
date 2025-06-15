
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { validateUserAccess } from '@/utils/securityValidation';

interface UseRouteProtectionOptions {
  requiredUserType?: 'solicitante' | 'freelancer';
  allowPublic?: boolean;
}

export const useRouteProtection = (options: UseRouteProtectionOptions = {}) => {
  const { isAuthenticated, userType, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { requiredUserType, allowPublic = false } = options;

  useEffect(() => {
    // Don't check while loading
    if (loading) return;

    // If public route and no specific user type required, allow access
    if (allowPublic && !requiredUserType) return;

    // Check authentication
    if (!isAuthenticated) {
      console.log('🔐 Route protection: User not authenticated, redirecting to login');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Check user type access if required
    if (requiredUserType) {
      const accessValidation = validateUserAccess(userType, requiredUserType);
      
      if (!accessValidation.isValid) {
        console.warn('🚫 Route protection:', accessValidation.error);
        
        // Redirect to appropriate page based on user type
        if (userType === 'solicitante') {
          navigate('/solicitante-plans', { replace: true });
        } else if (userType === 'freelancer') {
          navigate('/freelancer-plans', { replace: true });
        } else {
          navigate('/user-type', { replace: true });
        }
        return;
      }
    }

    console.log('✅ Route protection: Access granted for', userType || 'any user');
  }, [isAuthenticated, userType, loading, requiredUserType, allowPublic, navigate, location.pathname]);

  return {
    isAuthenticated,
    userType,
    loading,
    hasAccess: !loading && isAuthenticated && (!requiredUserType || userType === requiredUserType)
  };
};
