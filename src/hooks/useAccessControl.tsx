
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface UseAccessControlOptions {
  requiredUserType?: 'solicitante' | 'freelancer' | 'helladmin';
  redirectOnMismatch?: boolean;
}

export const useAccessControl = (options: UseAccessControlOptions = {}) => {
  const { isAuthenticated, userType, loading, user } = useAuth();
  const navigate = useNavigate();
  const { requiredUserType, redirectOnMismatch = true } = options;
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);

  // Check admin role separately
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated || !user || requiredUserType !== 'helladmin') {
        setIsAdmin(false);
        return;
      }

      setAdminCheckLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'helpadmin')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    };

    if (!loading) {
      checkAdminRole();
    }
  }, [user, isAuthenticated, loading, requiredUserType]);

  // Verify user authentication and type
  const hasAccess = isAuthenticated && 
    (!requiredUserType || 
     (requiredUserType === 'helladmin' ? isAdmin : userType === requiredUserType));

  // Verify user ID consistency
  const isUserValid = user?.id && user.email;

  useEffect(() => {
    if (!loading && !adminCheckLoading && !isAuthenticated) {
      console.warn('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    if (!loading && !adminCheckLoading && isAuthenticated && !isUserValid) {
      console.error('Invalid user data detected:', { userId: user?.id, email: user?.email });
      navigate('/login');
      return;
    }

    if (!loading && !adminCheckLoading && isAuthenticated && requiredUserType && !hasAccess) {
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
  }, [isAuthenticated, userType, loading, adminCheckLoading, requiredUserType, user, navigate, redirectOnMismatch, isUserValid, hasAccess]);

  return {
    hasAccess,
    isAuthenticated,
    userType,
    loading: loading || adminCheckLoading,
    isUserValid,
    userId: user?.id,
    isAdmin
  };
};
