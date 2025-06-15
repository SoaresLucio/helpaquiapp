
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, Clock, AlertTriangle } from 'lucide-react';

type VerificationStatus = 'verified' | 'pending' | 'incomplete';

interface VerificationStatusBadgeProps {
  status: VerificationStatus;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'verified':
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <BadgeCheck className="h-3 w-3 mr-1" />
          Perfil Verificado
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="text-yellow-500 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Você será notificado assim que seu perfil for aprovado.
        </Badge>
      );
    case 'incomplete':
      return (
        <Badge variant="outline" className="text-red-500 border-red-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Seu perfil está incompleto. Envie suas informações pessoais e bancárias para utilizar todos os recursos do HelpAqui.
        </Badge>
      );
    default:
      return null;
  }
};

export default VerificationStatusBadge;
