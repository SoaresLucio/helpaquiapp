import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSecurity } from './SecurityProvider';

export const SecurityBadge = () => {
  const { securityLevel, hasActiveThreats } = useSecurity();

  const getSecurityConfig = () => {
    if (hasActiveThreats) {
      return {
        variant: 'destructive' as const,
        icon: AlertTriangle,
        text: 'Ameaças Detectadas',
        className: 'bg-destructive text-destructive-foreground'
      };
    }

    switch (securityLevel) {
      case 'high':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          text: 'Segurança Alta',
          className: 'bg-green-500 text-white'
        };
      case 'medium':
        return {
          variant: 'secondary' as const,
          icon: Shield,
          text: 'Segurança Média',
          className: 'bg-yellow-500 text-white'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: Shield,
          text: 'Segurança Básica',
          className: 'bg-gray-500 text-white'
        };
    }
  };

  const config = getSecurityConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </Badge>
  );
};