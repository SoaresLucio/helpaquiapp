
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, User, Calendar, DollarSign, Clock, FileText } from 'lucide-react';
import ServiceProposalDialog from './ServiceProposalDialog';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  budget_min: number;
  budget_max: number;
  status: string;
  urgency: string;
  created_at: string;
  client_id: string;
  client_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface ServiceRequestCardProps {
  request: ServiceRequest;
}

const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({ request }) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgente':
        return 'destructive';
      case 'alta':
        return 'destructive';
      case 'normal':
        return 'default';
      case 'baixa':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'urgente':
        return 'Urgente';
      case 'alta':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'baixa':
        return 'Baixa';
      default:
        return 'Normal';
    }
  };

  const formatBudget = (min: number, max: number) => {
    if (min && max) {
      return `R$ ${(min / 100).toLocaleString()} - R$ ${(max / 100).toLocaleString()}`;
    } else if (min) {
      return `A partir de R$ ${(min / 100).toLocaleString()}`;
    } else if (max) {
      return `Até R$ ${(max / 100).toLocaleString()}`;
    }
    return 'A negociar';
  };

  const getClientName = () => {
    if (request.client_profile) {
      const { first_name, last_name } = request.client_profile;
      return `${first_name} ${last_name}`.trim() || 'Cliente';
    }
    return 'Cliente';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{request.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{request.category}</span>
              </div>
              {request.location_address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{request.location_address}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{getClientName()}</span>
              </div>
              <Badge variant={getUrgencyColor(request.urgency)}>
                <Clock className="h-3 w-3 mr-1" />
                {getUrgencyLabel(request.urgency)}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                <DollarSign className="h-4 w-4" />
                <span>{formatBudget(request.budget_min, request.budget_max)}</span>
              </div>
            </div>
          </div>
          <ServiceProposalDialog 
            serviceRequestId={request.id}
            serviceTitle={request.title}
          >
            <Button>
              Enviar Proposta
            </Button>
          </ServiceProposalDialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {request.description && (
          <div>
            <h4 className="font-medium mb-2">Observações do Cliente</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{request.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceRequestCard;
