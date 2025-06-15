
import { useSecureAuth } from './useSecureAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateUserSession, validateUserType } from '@/utils/securityValidation';

interface UseEnhancedAccessControlOptions {
  requiredUserType?: 'solicitante' | 'freelancer';
  redirectOnMismatch?: boolean;
  requireValidation?: boolean;
}

export const useEnhancedAccessControl = (options: UseEnhancedAccessControlOptions = {}) => {
  const { isAuthenticated, userType, loading, user, isUserValid, securityErrors } = useSecureAuth();
  const navigate = useNavigate();
  const { requiredUserType, redirectOnMismatch = true, requireValidation = true } = options;
  const [accessGranted, setAccessGranted] = useState(false);

  // Enhanced access control logic
  useEffect(() => {
    if (loading) {
      setAccessGranted(false);
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      console.warn('Access denied: User not authenticated');
      if (redirectOnMismatch) {
        navigate('/login');
      }
      setAccessGranted(false);
      return;
    }

    // Check user validation if required
    if (requireValidation && !isUserValid) {
      console.error('Access denied: User validation failed', securityErrors);
      if (redirectOnMismatch) {
        navigate('/login');
      }
      setAccessGranted(false);
      return;
    }

    // Check user type if specified
    if (requiredUserType && userType !== requiredUserType) {
      console.warn(`Access denied: User type '${userType}' cannot access '${requiredUserType}' content`);
      
      if (redirectOnMismatch) {
        // Redirect to appropriate home based on user type
        if (userType === 'solicitante') {
          navigate('/solicitante-plans');
        } else if (userType === 'freelancer') {
          navigate('/freelancer-plans');
        } else {
          navigate('/user-type');
        }
      }
      setAccessGranted(false);
      return;
    }

    // Additional validation checks
    if (user) {
      const userValidation = validateUserSession(user);
      const typeValidation = validateUserType(userType);
      
      if (!userValidation.isValid || !typeValidation.isValid) {
        console.error('Access denied: Enhanced validation failed');
        if (redirectOnMismatch) {
          navigate('/login');
        }
        setAccessGranted(false);
        return;
      }
    }

    setAccessGranted(true);
  }, [
    isAuthenticated, 
    userType, 
    loading, 
    requiredUserType, 
    user, 
    navigate, 
    redirectOnMismatch, 
    isUserValid, 
    securityErrors,
    requireValidation
  ]);

  return {
    hasAccess: accessGranted,
    isAuthenticated,
    userType,
    loading,
    isUserValid,
    userId: user?.id,
    securityErrors
  };
};
