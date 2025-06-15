
import { useSecureAuth } from './useSecureAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    if (loading) {
      setAccessGranted(false);
      return;
    }

    if (!isAuthenticated) {
      console.warn('Access denied: User not authenticated');
      if (redirectOnMismatch) {
        navigate('/login');
      }
      setAccessGranted(false);
      return;
    }

    if (requireValidation && !isUserValid) {
      console.error('Access denied: User validation failed', securityErrors);
      if (redirectOnMismatch) {
        navigate('/login');
      }
      setAccessGranted(false);
      return;
    }

    if (requiredUserType && userType !== requiredUserType) {
      console.warn(`Access denied: User type '${userType}' cannot access '${requiredUserType}' content`);
      
      if (redirectOnMismatch) {
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
