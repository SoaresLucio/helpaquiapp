
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useEnhancedAccessControl } from '@/hooks/useEnhancedAccessControl';

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
  const location = useLocation();
  const { 
    hasAccess, 
    isAuthenticated, 
    userType, 
    loading, 
    isUserValid,
    securityErrors 
  } = useEnhancedAccessControl({ 
    requiredUserType,
    redirectOnMismatch: false, // We'll handle redirects manually
    requireValidation: true 
  });

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: User not authenticated, redirecting to login from:', location.pathname);
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // User validation failed - security issue
  if (!isUserValid) {
    console.error('🔒 ProtectedRoute: User validation failed:', securityErrors);
    return <Navigate to="/login" state={{ 
      from: location.pathname,
      error: 'Sessão inválida. Faça login novamente.' 
    }} replace />;
  }

  // Access control check failed
  if (!hasAccess) {
    console.warn('⛔ ProtectedRoute: Access denied for user type:', userType, 'required:', requiredUserType);
    
    // Redirect to appropriate home based on actual user type
    const redirectPath = userType === 'solicitante' 
      ? '/solicitante-plans' 
      : userType === 'freelancer' 
        ? '/freelancer-plans' 
        : '/user-type';
    
    return <Navigate to={redirectPath} replace />;
  }

  // All checks passed - render children
  console.log('✅ ProtectedRoute: Access granted for user type:', userType);
  return <>{children}</>;
};

export default ProtectedRoute;
