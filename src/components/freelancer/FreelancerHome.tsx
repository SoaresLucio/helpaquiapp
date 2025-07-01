
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSubscription } from '@/services/subscriptionService';
import FreelancerMainActions from './FreelancerMainActions';

const FreelancerHome: React.FC = () => {
  const navigate = useNavigate();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [profileViews, setProfileViews] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const subscription = await getCurrentSubscription();
      setCurrentSubscription(subscription);
      
      // Simular views baseado no plano
      if (subscription?.subscription_plans) {
        const planName = subscription.subscription_plans.name;
        if (planName === 'Help Ouro') {
          setProfileViews(Math.floor(Math.random() * 300) + 150);
        } else if (planName === 'Help Prata') {
          setProfileViews(Math.floor(Math.random() * 150) + 70);
        } else {
          setProfileViews(Math.floor(Math.random() * 50) + 20);
        }
      }
    };
    
    loadData();
  }, []);

  const getPlanUpgradeMessage = () => {
    const planName = currentSubscription?.subscription_plans?.name;
    
    if (planName === 'Help Bronze') {
      return {
        title: 'Upgrade para Help Prata',
        description: 'Mais visibilidade e oportunidades de trabalho',
        color: 'from-gray-50 to-gray-100 border-gray-200'
      };
    } else if (planName === 'Help Prata') {
      return {
        title: 'Upgrade para Help Ouro',
        description: 'Acesso ilimitado e selo de recomendação',
        color: 'from-yellow-50 to-amber-50 border-yellow-200'
      };
    }
    
    return null;
  };

  const upgradeMessage = getPlanUpgradeMessage();

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Upgrade Suggestion */}
      {upgradeMessage && (
        <Card className={`bg-gradient-to-r ${upgradeMessage.color}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-600" />
              {upgradeMessage.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{upgradeMessage.description}</p>
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/freelancer-plans')}
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
      <FreelancerMainActions 
        currentSubscription={currentSubscription}
        profileViews={profileViews}
      />

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">💼</span>
              Mais Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Conecte-se com clientes que precisam dos seus serviços. 
              Construa sua reputação profissional.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/service-requests')}
              className="w-full"
            >
              Buscar Oportunidades
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">⭐</span>
              Destaque Profissional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Apareça entre os primeiros resultados e ganhe a confiança 
              dos clientes com um perfil completo.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/freelancer-profile')}
              className="w-full"
            >
              Completar Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerHome;
