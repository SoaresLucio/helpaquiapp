
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAccessControlOptions {
  requiredUserType?: 'solicitante' | 'freelancer';
  redirectOnMismatch?: boolean;
}

export const useAccessControl = (options: UseAccessControlOptions = {}) => {
  const { isAuthenticated, userType, loading, user } = useAuth();
  const navigate = useNavigate();
  const { requiredUserType, redirectOnMismatch = true } = options;

  // Verify user authentication and type
  const hasAccess = isAuthenticated && 
    (!requiredUserType || userType === requiredUserType);

  // Verify user ID consistency
  const isUserValid = user?.id && user.email;

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

    if (!loading && isAuthenticated && requiredUserType && !hasAccess) {
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
  }, [isAuthenticated, userType, loading, requiredUserType, user, navigate, redirectOnMismatch, isUserValid, hasAccess]);

  return {
    hasAccess,
    isAuthenticated,
    userType,
    loading,
    isUserValid,
    userId: user?.id
  };
};
