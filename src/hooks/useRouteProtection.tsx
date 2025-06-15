
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from './useSecureAuth';
import { validateUserAccess } from '@/utils/securityValidation';

interface UseRouteProtectionOptions {
  requiredUserType?: 'solicitante' | 'freelancer';
  allowPublic?: boolean;
}

export const useRouteProtection = (options: UseRouteProtectionOptions = {}) => {
  const { isAuthenticated, userType, loading, user, isUserValid, securityErrors } = useSecureAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { requiredUserType, allowPublic = false } = options;

  useEffect(() => {
    // Don't check while loading
    if (loading) {
      console.log('🔐 Route protection: Still loading, waiting...');
      return;
    }

    console.log('🔐 Route protection check:', {
      isAuthenticated,
      userType,
      requiredUserType,
      allowPublic,
      isUserValid,
      pathname: location.pathname
    });

    // If public route and no specific user type required, allow access
    if (allowPublic && !requiredUserType) {
      console.log('✅ Route protection: Public route, access allowed');
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      console.log('🔐 Route protection: User not authenticated, redirecting to login');
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return;
    }

    // Check user validation
    if (!isUserValid) {
      console.error('🔒 Route protection: User validation failed:', securityErrors);
      navigate('/login', { replace: true });
      return;
    }

    // If no userType and not on user-type page, redirect to user-type selection
    if (!userType && location.pathname !== '/user-type') {
      console.log('🚫 Route protection: No userType, redirecting to user-type selection');
      navigate('/user-type', { replace: true });
      return;
    }

    // Check user type access if required
    if (requiredUserType && userType) {
      const accessValidation = validateUserAccess(userType, requiredUserType);
      
      if (!accessValidation.isValid) {
        console.warn('🚫 Route protection:', accessValidation.error);
        
        // Redirect to appropriate page based on user type
        if (userType === 'solicitante') {
          navigate('/solicitante-plans', { replace: true });
        } else if (userType === 'freelancer') {
          navigate('/freelancer-plans', { replace: true });
        }
        return;
      }
    }

    console.log('✅ Route protection: Access granted for', userType || 'any user');
  }, [isAuthenticated, userType, loading, requiredUserType, allowPublic, navigate, location.pathname, isUserValid, securityErrors]);

  const hasAccess = !loading && 
                    isAuthenticated && 
                    isUserValid && 
                    (allowPublic || !!userType) && 
                    (!requiredUserType || userType === requiredUserType);

  return {
    isAuthenticated,
    userType,
    loading,
    hasAccess,
    user,
    isUserValid,
    securityErrors
  };
};
