
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useUserRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userType, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && userType) {
      console.log('Redirecting user based on type:', userType);
      
      // Redirecionar baseado no tipo de usuário
      if (userType === 'solicitante') {
        navigate('/solicitante-plans', { replace: true });
      } else if (userType === 'freelancer') {
        navigate('/freelancer-plans', { replace: true });
      } else {
        // Fallback para página de seleção de tipo de usuário
        navigate('/user-type-selection', { replace: true });
      }
    }
  }, [isAuthenticated, userType, loading, navigate]);

  return { userType, loading };
};
