
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SecurityBadge } from '@/components/security/SecurityBadge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'solicitante' | 'freelancer' | 'empresa';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType, 
  redirectTo = "/login" 
}) => {
  const { isAuthenticated, loading, userType, securityScore, isSecure } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to appropriate home based on user type
    if (userType === 'solicitante') {
      return <Navigate to="/solicitante-plans" replace />;
    } else if (userType === 'freelancer') {
      return <Navigate to="/freelancer-plans" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // Show security warning for low security score
  const showSecurityWarning = securityScore < 50 && location.pathname !== '/profile-verification';

  return (
    <>
      {showSecurityWarning && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Sua conta possui baixa segurança. Complete a verificação do perfil.</span>
              <SecurityBadge />
            </AlertDescription>
          </Alert>
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;
