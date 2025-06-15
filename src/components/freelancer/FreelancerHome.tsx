
import React from 'react';
import { PlusCircle, DollarSign, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMyOffers } from '@/hooks/useMyOffers';
import MyOffersSection from '@/components/freelancer/MyOffersSection';

const FreelancerHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { offers, loading, reloadOffers } = useMyOffers();
  
  const firstName = user?.user_metadata?.first_name || 
                   localStorage.getItem('userFirstName') || 
                   'Freelancer';

  const stats = [
    {
      title: "Ofertas Ativas",
      value: offers.filter(offer => offer.is_active).length.toString(),
      icon: PlusCircle,
      description: "Serviços disponíveis"
    },
    {
      title: "Total de Ofertas",
      value: offers.length.toString(),
      icon: TrendingUp,
      description: "Criadas até agora"
    },
    {
      title: "Avaliação Média",
      value: "4.8",
      icon: Star,
      description: "Baseada em avaliações"
    },
    {
      title: "Ganhos do Mês",
      value: "R$ 2.450",
      icon: DollarSign,
      description: "Valor estimado"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bem-vindo, {firstName}! 👋
        </h1>
        <p className="text-gray-600 mb-4">
          Gerencie suas ofertas de serviços e acompanhe seu desempenho
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate('/profile')}
            className="helpaqui-button-green"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Nova Oferta
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            Ver Perfil
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Offers Section */}
      <MyOffersSection offers={offers} onReload={reloadOffers} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="h-16 flex flex-col gap-1"
            >
              <PlusCircle className="h-5 w-5" />
              Nova Oferta
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/payments')}
              className="h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              <DollarSign className="h-5 w-5" />
              Pagamentos
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="h-16 flex flex-col gap-1"
            >
              <Star className="h-5 w-5" />
              Meu Perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerHome;
