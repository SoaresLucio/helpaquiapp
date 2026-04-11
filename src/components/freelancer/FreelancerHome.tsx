
import React, { useEffect, useState } from 'react';
import { Star, Clock, DollarSign, Calendar, TrendingUp, Users, Briefcase, CreditCard, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BannerCarousel from '@/components/banners/BannerCarousel';
import ServiceMap from '@/components/ServiceMap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePromotionalBanners } from '@/hooks/usePromotionalBanners';
import { supabase } from '@/integrations/supabase/client';

const FreelancerHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { banners, loading: bannersLoading, error: bannersError } = usePromotionalBanners('freelancer');
  
  const [stats, setStats] = useState({
    completedJobs: 0,
    averageRating: 0,
    totalEarnings: 'R$ 0',
    pendingRequests: 0,
    responseTime: '-',
    responseRate: 0
  });

  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  // Fetch real stats
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        // Count completed payments
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, status')
          .eq('freelancer_id', user.id);

        const completed = (payments || []).filter(p => p.status === 'completed');
        const totalEarnings = completed.reduce((sum, p) => sum + (p.amount || 0), 0);

        // Get average rating
        const { data: ratings } = await supabase
          .from('freelancer_ratings')
          .select('avg_rating, rating_count')
          .eq('freelancer_id', user.id)
          .maybeSingle();

        // Pending requests count
        const { count: pendingCount } = await supabase
          .from('service_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open');

        setStats({
          completedJobs: completed.length,
          averageRating: ratings?.avg_rating ? Number(ratings.avg_rating) : 0,
          totalEarnings: `R$ ${(totalEarnings / 100).toLocaleString('pt-BR')}`,
          pendingRequests: pendingCount || 0,
          responseTime: '-',
          responseRate: ratings?.rating_count ? 100 : 0
        });
      } catch (err) {
        // Silently fail, keep defaults
      }
    };
    fetchStats();
  }, [user]);

  // Get user categories from user metadata or default categories
  const userCategories = user?.user_metadata?.categories || ['eletrica', 'hidraulica'];
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="space-y-6">
      {/* Banner promocional - SEMPRE RENDERIZAR ESTA SEÇÃO */}
      <div className="mb-6">
        {bannersLoading && (
          <div className="bg-gray-200 animate-pulse rounded-xl h-[300px] md:h-[400px] flex items-center justify-center">
            <p className="text-gray-500">Carregando banners...</p>
          </div>
        )}
        
        {!bannersLoading && bannersError && (
          <div className="bg-red-100 border border-red-300 rounded-xl p-4">
            <p className="text-red-700">Erro ao carregar banners: {bannersError}</p>
          </div>
        )}
        
        {!bannersLoading && !bannersError && banners.length > 0 && (
          <BannerCarousel banners={banners} className="rounded-xl shadow-lg" />
        )}
        
        {!bannersLoading && !bannersError && banners.length === 0 && (
          <div className="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
            <p className="text-gray-600">Nenhum banner promocional disponível no momento.</p>
          </div>
        )}
      </div>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Bem-vindo de volta, {userName}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          Você tem {stats.pendingRequests} novas solicitações de serviço
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/help-requests')}>
            <Briefcase className="h-4 w-4 mr-2" />
            Ver Solicitações de Help
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            Meus Trabalhos
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2" />
            Ações Rápidas
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/help-requests')}
              className="bg-secondary hover:bg-secondary/90 h-16 flex flex-col gap-1"
            >
              <Briefcase className="h-5 w-5" />
              Solicitações de Help
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/my-offers')}
              className="h-16 flex flex-col gap-1 bg-green-50 hover:bg-green-100 border-green-200"
            >
              <Settings className="h-5 w-5" />
              Minhas Ofertas
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/payment-freelancer-settings')}
              className="h-16 flex flex-col gap-1 bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              <CreditCard className="h-5 w-5" />
              Pagamentos
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
              className="h-16 flex flex-col gap-1"
            >
              <Users className="h-5 w-5" />
              Meu Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map showing service requests */}
      <ServiceMap />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trabalhos Concluídos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde o mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats.averageRating}
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1" />
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em avaliações recentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhos Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              Este mês: R$ 2.340
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseTime}</div>
            <p className="text-xs text-muted-foreground">
              {stats.responseRate}% de taxa de resposta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories and Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Suas Categorias de Serviço
          </CardTitle>
          <CardDescription>
            Categorias em que você atua como freelancer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {userCategories.map((categoryId: string, index: number) => (
              <Badge key={index} variant="secondary">
                {categoryId}
              </Badge>
            ))}
          </div>
          <Button variant="outline" onClick={() => navigate('/profile')}>
            Gerenciar Serviços
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Trabalhos Recentes
          </CardTitle>
          <CardDescription>
            Histórico dos seus últimos trabalhos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-sm text-gray-500">Cliente: {job.client}</p>
                  <p className="text-xs text-gray-400">{job.date}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-medium text-green-600">{job.amount}</p>
                  {job.rating && (
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs ml-1">{job.rating}</span>
                    </div>
                  )}
                  <Badge 
                    variant={job.status === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {job.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4">
            Ver Todos os Trabalhos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelancerHome;
