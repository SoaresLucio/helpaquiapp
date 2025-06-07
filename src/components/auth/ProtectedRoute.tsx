
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'solicitante' | 'freelancer';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType, 
  redirectTo = "/login" 
}) => {
  const { isAuthenticated, loading, userType } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user type matches required type
  if (requiredUserType && userType !== requiredUserType) {
    console.warn(`Access denied: User type '${userType}' cannot access '${requiredUserType}' content`);
    
    // Redirect to appropriate home based on user type
    if (userType === 'solicitante') {
      return <Navigate to="/solicitante-plans" replace />;
    } else if (userType === 'freelancer') {
      return <Navigate to="/freelancer-plans" replace />;
    } else {
      // Se não tem tipo definido, vai para seleção de tipo
      return <Navigate to="/user-type-selection" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
