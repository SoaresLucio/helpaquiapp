
import React from 'react';
import { Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SecurityEvent {
  id: string;
  action: string;
  resource_type: string;
  success: boolean;
  created_at: string;
  error_message?: string;
  metadata?: any;
}

interface SecurityEventsListProps {
  events: SecurityEvent[];
  loading: boolean;
}

const SecurityEventsList: React.FC<SecurityEventsListProps> = ({
  events,
  loading
}) => {
  const getEventIcon = (event: SecurityEvent) => {
    if (event.success) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getEventDescription = (event: SecurityEvent) => {
    const actionMap: Record<string, string> = {
      'login': 'Login realizado',
      'logout': 'Logout realizado',
      'profile_access': 'Acesso ao perfil',
      'bank_details_save': 'Dados bancários salvos',
      'bank_details_access': 'Dados bancários acessados',
      'payment_created': 'Pagamento criado',
      'security_audit': 'Auditoria de segurança',
      'data_access_validation': 'Validação de acesso a dados'
    };

    return actionMap[event.action] || event.action;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Eventos de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            Carregando eventos...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Eventos de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhum evento de segurança registrado
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {getEventIcon(event)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {getEventDescription(event)}
                    </p>
                    <Badge variant={event.success ? "default" : "destructive"}>
                      {event.success ? "Sucesso" : "Falha"}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDistanceToNow(new Date(event.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </div>
                  {event.error_message && (
                    <p className="mt-1 text-xs text-red-600">
                      {event.error_message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 capitalize">
                    {event.resource_type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityEventsList;
