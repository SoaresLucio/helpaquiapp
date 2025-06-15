
import React from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SecurityAlertProps {
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  onDismiss?: () => void;
  actions?: React.ReactNode;
}

const SecurityAlert: React.FC<SecurityAlertProps> = ({
  type,
  title,
  message,
  onDismiss,
  actions
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <Alert variant={getVariant()} className="relative">
      {getIcon()}
      <AlertTitle className="pr-8">{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
      
      {actions && (
        <div className="mt-3 flex gap-2">
          {actions}
        </div>
      )}
    </Alert>
  );
};

export default SecurityAlert;
