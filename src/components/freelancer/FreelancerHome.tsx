
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
import { motion } from 'framer-motion';

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

  const statCards = [
    { label: 'Trabalhos', value: stats.completedJobs, color: '#2b439b' },
    { label: 'Avaliação', value: stats.averageRating || '—', color: '#f59e0b' },
    { label: 'Ganhos', value: stats.totalEarnings, color: '#16a34a' },
    { label: 'Solicitações', value: stats.pendingRequests, color: '#6c2ea0' },
  ];

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

      {/* Welcome Section — card branco com barra gradiente */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
      >
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #6c2ea0, #2b439b)' }} />

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 text-sm">Painel do Freelancer</p>
              <h1 className="text-xl font-black text-slate-900">Olá, {userName}!</h1>
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(108,46,160,0.1)', color: '#6c2ea0' }}
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
              Ativo
            </div>
          </div>

          {/* Stats 2x2 */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className="text-lg font-black mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/help-requests')}
              className="flex-1 py-3 rounded-2xl text-white font-bold text-sm"
              style={{
                background: 'linear-gradient(135deg, #6c2ea0, #2b439b)',
                boxShadow: '0 4px 15px rgba(108,46,160,0.25)',
              }}
            >
              Ver Solicitações
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate('/my-offers')}
              className="flex-1 py-3 rounded-2xl font-bold text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-all"
              style={{ color: '#6c2ea0' }}
            >
              Meus Trabalhos
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/help-requests')}
            className="rounded-2xl p-3 flex flex-col items-center gap-1.5 text-white shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #6c2ea0, #2b439b)',
              boxShadow: '0 4px 16px rgba(108,46,160,0.25)',
            }}
          >
            <Briefcase className="h-5 w-5" />
            <span className="text-xs font-medium text-center">Solicitações</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/my-offers')}
            className="rounded-2xl p-3 flex flex-col items-center gap-1.5 bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50/40 transition-all shadow-sm"
          >
            <Settings className="h-5 w-5" style={{ color: '#6c2ea0' }} />
            <span className="text-xs font-medium text-slate-700 text-center">Minhas Ofertas</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/payment-freelancer-settings')}
            className="rounded-2xl p-3 flex flex-col items-center gap-1.5 bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50/40 transition-all shadow-sm"
          >
            <CreditCard className="h-5 w-5" style={{ color: '#6c2ea0' }} />
            <span className="text-xs font-medium text-slate-700 text-center">Pagamentos</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/profile')}
            className="rounded-2xl p-3 flex flex-col items-center gap-1.5 bg-white border border-slate-200 hover:border-purple-200 hover:bg-purple-50/40 transition-all shadow-sm"
          >
            <Users className="h-5 w-5" style={{ color: '#6c2ea0' }} />
            <span className="text-xs font-medium text-slate-700 text-center">Meu Perfil</span>
          </motion.button>
        </div>
      </div>

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
