
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Settings, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PlanBadge from '../common/PlanBadge';
import MessageCounter from '../dashboard/MessageCounter';

interface FreelancerMainActionsProps {
  currentSubscription?: any;
  profileViews?: number;
}

const FreelancerMainActions: React.FC<FreelancerMainActionsProps> = ({ 
  currentSubscription,
  profileViews = 0
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Ação Principal - Oferecer Help */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Plus className="h-6 w-6 mr-2" />
            Pronto para Oferecer Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700 mb-4">
            Crie uma oferta de serviço e conecte-se com clientes em potencial
          </p>
          <Button 
            onClick={() => navigate('/create-offer')}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Oferecer Help
          </Button>
        </CardContent>
      </Card>

      {/* Estatísticas e Plano */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plano Atual */}
        {currentSubscription && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <PlanBadge 
                  planName={currentSubscription.subscription_plans?.name || 'Help Bronze'} 
                  size="lg"
                />
                <p className="text-xs text-gray-600">
                  {currentSubscription.subscription_plans?.max_requests_per_month === -1 
                    ? 'Serviços ilimitados'
                    : `${currentSubscription.requests_used_this_month || 0} de ${currentSubscription.subscription_plans?.max_requests_per_month || 4} serviços`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visualizações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
              Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {profileViews}
              </div>
              <p className="text-xs text-gray-600">
                visualizações este mês
              </p>
              {profileViews > 50 && (
                <p className="text-xs text-green-600 font-medium">
                  🚀 Seu perfil está se destacando!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contador de Mensagens */}
      <MessageCounter userType="freelancer" />

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Button
              onClick={() => navigate('/service-requests')}
              variant="outline"
              className="w-full h-16 flex-col space-y-1"
            >
              <Search className="h-5 w-5" />
              <span className="text-sm font-medium">Buscar Solicitações</span>
              <span className="text-xs text-gray-500">Encontre oportunidades</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <Button
              onClick={() => navigate('/freelancer-profile')}
              variant="outline"
              className="w-full h-16 flex-col space-y-1"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Meu Perfil</span>
              <span className="text-xs text-gray-500">Configurar perfil</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bate Papo */}
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <Button
            onClick={() => navigate('/chat')}
            variant="outline"
            className="w-full h-12"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            <div className="text-left">
              <div className="font-medium">Bate Papo</div>
              <div className="text-xs text-gray-500">Converse com clientes</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerMainActions;
