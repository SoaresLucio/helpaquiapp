
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  User, 
  FileText, 
  CreditCard,
  Crown,
  Briefcase,
  Calendar,
  Star,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickActionsButtons from './QuickActionsButtons';
import FreelancerHome from '@/components/freelancer/FreelancerHome';
import { getCurrentSubscription } from '@/services/subscriptionService';
import { useEffect, useState } from 'react';

interface IndexMainContentProps {
  userType: 'solicitante' | 'freelancer';
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onChatRedirect: () => void;
  currentUser: any;
}

const IndexMainContent: React.FC<IndexMainContentProps> = ({
  userType,
  selectedCategory,
  onSelectCategory,
  activeTab,
  onTabChange,
  onChatRedirect,
  currentUser
}) => {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [profileViews, setProfileViews] = useState(0);

  useEffect(() => {
    const loadSubscription = async () => {
      const subscription = await getCurrentSubscription();
      setCurrentSubscription(subscription);
      
      // Simular views do perfil baseado no plano
      if (subscription?.subscription_plans) {
        const planName = subscription.subscription_plans.name;
        if (planName === 'Help Ouro') {
          setProfileViews(Math.floor(Math.random() * 200) + 100);
        } else if (planName === 'Help Prata') {
          setProfileViews(Math.floor(Math.random() * 100) + 50);
        } else {
          setProfileViews(Math.floor(Math.random() * 30) + 10);
        }
      }
    };
    
    loadSubscription();
  }, []);

  if (userType === 'freelancer') {
    return <FreelancerHome />;
  }

  const getPlanUpgradeMessage = () => {
    const planName = currentSubscription?.subscription_plans?.name;
    
    if (planName === 'Help Bronze') {
      return {
        title: 'Upgrade para Help Prata',
        description: 'Destaque nas buscas e mais solicitações por mês',
        color: 'from-silver-50 to-gray-50 border-gray-200'
      };
    } else if (planName === 'Help Prata') {
      return {
        title: 'Upgrade para Help Ouro',
        description: 'Solicitações ilimitadas e suporte dedicado',
        color: 'from-yellow-50 to-amber-50 border-yellow-200'
      };
    }
    
    return null;
  };

  const upgradeMessage = getPlanUpgradeMessage();

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Estatísticas do Perfil */}
      {currentSubscription && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Plano Atual</p>
                  <p className="text-2xl font-bold text-helpaqui-blue">
                    {currentSubscription.subscription_plans?.name || 'Help Bronze'}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Visualizações</p>
                  <p className="text-2xl font-bold text-green-600">{profileViews}</p>
                  <p className="text-xs text-gray-500">este mês</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Solicitações</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentSubscription.requests_used_this_month || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    de {currentSubscription.subscription_plans?.max_requests_per_month === -1 
                      ? '∞' 
                      : currentSubscription.subscription_plans?.max_requests_per_month || 6}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Suggestion */}
      {upgradeMessage && (
        <Card className={`bg-gradient-to-r ${upgradeMessage.color}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-600" />
              {upgradeMessage.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{upgradeMessage.description}</p>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/solicitante-plans')}
                className="bg-helpaqui-blue hover:bg-blue-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Ver Planos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Principais */}
      <QuickActionsButtons 
        userType={userType}
        currentSubscription={currentSubscription}
      />

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">🔍</span>
              Encontre Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Acesse uma rede de profissionais qualificados e verificados. 
              Compare propostas e escolha a melhor opção.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/freelancers')}
              className="w-full"
            >
              Buscar Freelancers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">💰</span>
              Preços Transparentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Receba orçamentos detalhados e compare preços antes de contratar. 
              Tudo transparente e justo.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/how-it-works')}
              className="w-full"
            >
              Como Funciona
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndexMainContent;
