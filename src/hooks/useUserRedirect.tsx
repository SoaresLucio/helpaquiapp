
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { determineRedirectPath } from '@/services/loginRedirectService';

export const useUserRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType, loading } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      if (!loading && isAuthenticated && userType) {
        console.log('Checking redirect for user type:', userType);
        
        try {
          const result = await determineRedirectPath();
          
          if (result.success) {
            console.log('Redirecting to:', result.redirectPath);
            navigate(result.redirectPath, { replace: true });
          } else {
            console.error('Redirect error:', result.error);
            navigate('/login', { replace: true });
          }
        } catch (error) {
          console.error('Error in redirect logic:', error);
          navigate('/login', { replace: true });
        }
      } else if (!loading && !isAuthenticated) {
        // Se não está autenticado, redirecionar para login
        navigate('/login', { replace: true });
      }
    };

    handleRedirect();
  }, [isAuthenticated, userType, loading, navigate]);

  return { userType, loading };
};
