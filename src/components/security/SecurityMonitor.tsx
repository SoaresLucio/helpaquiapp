
import React, { useEffect } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const SecurityMonitor: React.FC = () => {
  const { securityErrors, isUserValid, isAuthenticated } = useSecureAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (securityErrors.length > 0 && isAuthenticated) {
      securityErrors.forEach(error => {
        toast({
          title: "Alerta de Segurança",
          description: error,
          variant: "destructive"
        });
      });
    }
  }, [securityErrors, toast, isAuthenticated]);

  if (!isAuthenticated || securityErrors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Problemas de segurança detectados. Por favor, faça login novamente.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityMonitor;
