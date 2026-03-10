
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMyRequests } from '@/hooks/useMyRequests';
import { useRequestApplications } from '@/hooks/useRequestApplications';

const MyRequests: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { requests, loading, deleteRequest } = useMyRequests();

  // Redirect if not solicitante
  React.useEffect(() => {
    if (userType && userType !== 'solicitante') {
      navigate('/');
    }
  }, [userType, navigate]);

  if (!userType || userType !== 'solicitante') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando seus pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos de Ajuda</h1>
            <p className="text-gray-600">Gerencie todos os seus pedidos de serviço</p>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-helpaqui-blue hover:bg-helpaqui-blue/90"
          >
            Novo Pedido
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum pedido criado
              </h3>
              <p className="text-gray-500 mb-4">
                Você ainda não criou nenhum pedido de ajuda.
              </p>
              <Button 
                onClick={() => navigate('/')}
                className="bg-helpaqui-blue hover:bg-helpaqui-blue/90"
              >
                Criar Primeiro Pedido
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onDelete={deleteRequest}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface RequestCardProps {
  request: any;
  onDelete: (requestId: string) => Promise<void>;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onDelete }) => {
  const { applications, loading } = useRequestApplications(request.id);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      setIsDeleting(true);
      try {
        await onDelete(request.id);
      } catch (error) {
        console.error('Erro ao excluir pedido:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'open': { label: 'Aberto', variant: 'default' as const },
      'in_progress': { label: 'Em Andamento', variant: 'secondary' as const },
      'completed': { label: 'Concluído', variant: 'outline' as const },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.open;
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyMap = {
      'low': { label: 'Baixa', className: 'bg-green-100 text-green-800' },
      'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
      'high': { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
      'urgent': { label: 'Urgente', className: 'bg-red-100 text-red-800' }
    };
    
    const urgencyInfo = urgencyMap[urgency as keyof typeof urgencyMap] || urgencyMap.normal;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyInfo.className}`}>
        {urgencyInfo.label}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg">{request.title}</CardTitle>
              {getStatusBadge(request.status)}
              {getUrgencyBadge(request.urgency)}
            </div>
            <p className="text-gray-600 mt-1">{request.description}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Badge variant="secondary">{request.category}</Badge>
              </div>
              
              {request.location_address && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{request.location_address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{new Date(request.created_at).toLocaleDateString()}</span>
              </div>
              
              {(request.budget_min || request.budget_max) && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4" />
                  <span>
                    {request.budget_min && request.budget_max 
                      ? `R$ ${request.budget_min} - R$ ${request.budget_max}`
                      : request.budget_min 
                        ? `A partir de R$ ${request.budget_min}`
                        : `Até R$ ${request.budget_max}`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-4 w-4 text-helpaqui-blue" />
          <span className="text-sm font-medium text-helpaqui-blue">
            {loading ? 'Carregando...' : `${applications.length} candidatura(s)`}
          </span>
        </div>
        
        {applications.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Freelancers Candidatos:
            </h4>
            <div className="space-y-3">
              {applications.slice(0, 3).map((application: any) => (
                <div key={application.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Freelancer #{application.freelancer_id.slice(0, 8)}
                    </span>
                    <div className="flex items-center space-x-2">
                      {application.proposed_price && (
                        <span className="text-sm font-medium text-green-600">
                          R$ {application.proposed_price}
                        </span>
                      )}
                      <Badge variant="outline">
                        {application.status === 'pending' ? 'Pendente' : 
                         application.status === 'accepted' ? 'Aceito' : 
                         application.status === 'rejected' ? 'Rejeitado' : application.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {application.message && (
                    <p className="text-xs text-gray-600 mb-2">
                      "{application.message}"
                    </p>
                  )}
                  
                  {application.estimated_time && (
                    <p className="text-xs text-gray-500">
                      Tempo estimado: {application.estimated_time}
                    </p>
                  )}
                  
                  {application.status === 'pending' && (
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" className="bg-helpaqui-green hover:bg-helpaqui-green/90">
                        Aceitar
                      </Button>
                      <Button size="sm" variant="outline">
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {applications.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{applications.length - 3} candidatura(s) a mais
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyRequests;
