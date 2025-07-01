
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MessageSquare, Settings, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface QuickActionsButtonsProps {
  userType: 'solicitante' | 'freelancer';
  currentSubscription?: any;
}

const QuickActionsButtons: React.FC<QuickActionsButtonsProps> = ({ 
  userType, 
  currentSubscription 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPlanBadge = (planName?: string) => {
    if (!planName) return null;
    
    const planColors = {
      'Help Bronze': 'bg-amber-600 text-white',
      'Help Prata': 'bg-gray-400 text-white', 
      'Help Ouro': 'bg-yellow-500 text-white'
    };
    
    const planIcons = {
      'Help Bronze': '🥉',
      'Help Prata': '🥈',
      'Help Ouro': '🥇'
    };

    return (
      <Badge className={`${planColors[planName as keyof typeof planColors]} ml-2`}>
        {planIcons[planName as keyof typeof planIcons]} {planName}
      </Badge>
    );
  };

  const getMainAction = () => {
    if (userType === 'freelancer') {
      return {
        title: 'Oferecer Help',
        description: 'Crie uma nova oferta de serviço',
        icon: Plus,
        action: () => navigate('/create-offer'),
        color: 'bg-green-600 hover:bg-green-700'
      };
    } else {
      return {
        title: 'Solicitar Help',
        description: 'Publique uma nova solicitação',
        icon: Plus,
        action: () => navigate('/create-request'),
        color: 'bg-blue-600 hover:bg-blue-700'
      };
    }
  };

  const getSecondaryActions = () => {
    if (userType === 'freelancer') {
      return [
        {
          title: 'Buscar Solicitações',
          description: 'Encontre oportunidades de trabalho',
          icon: Search,
          action: () => navigate('/service-requests'),
          color: 'bg-purple-600 hover:bg-purple-700'
        },
        {
          title: 'Meu Perfil',
          description: 'Gerencie seu perfil profissional',
          icon: Settings,
          action: () => navigate('/freelancer-profile'),
          color: 'bg-gray-600 hover:bg-gray-700'
        }
      ];
    } else {
      return [
        {
          title: 'Buscar Freelancers',
          description: 'Encontre profissionais qualificados',
          icon: Search,
          action: () => navigate('/freelancers'),
          color: 'bg-purple-600 hover:bg-purple-700'
        },
        {
          title: 'Minhas Solicitações',
          description: 'Acompanhe suas solicitações',
          icon: Settings,
          action: () => navigate('/my-requests'),
          color: 'bg-gray-600 hover:bg-gray-700'
        }
      ];
    }
  };

  const mainAction = getMainAction();
  const secondaryActions = getSecondaryActions();

  return (
    <div className="space-y-4">
      {/* Plano Atual */}
      {currentSubscription && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Plano Atual</h3>
                <div className="flex items-center">
                  <span className="text-gray-600">Você está no plano</span>
                  {getPlanBadge(currentSubscription.subscription_plans?.name)}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ação Principal */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <Button
            onClick={mainAction.action}
            className={`w-full h-16 text-lg ${mainAction.color}`}
          >
            <mainAction.icon className="h-6 w-6 mr-3" />
            <div className="text-left">
              <div className="font-semibold">{mainAction.title}</div>
              <div className="text-sm opacity-90">{mainAction.description}</div>
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* Ações Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {secondaryActions.map((action, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <Button
                onClick={action.action}
                variant="outline"
                className="w-full h-12"
              >
                <action.icon className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chat */}
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
              <div className="text-xs text-gray-500">Converse com profissionais</div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActionsButtons;
