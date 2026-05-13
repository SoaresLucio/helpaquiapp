import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
import PendingHireProposals from '@/components/freelancer/PendingHireProposals';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

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

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const { data: payments } = await supabase.from('payments').select('amount, status').eq('freelancer_id', user.id);
        const completed = (payments || []).filter(p => p.status === 'completed');
        const totalEarnings = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
        const { data: ratings } = await supabase.from('freelancer_ratings').select('avg_rating, rating_count').eq('freelancer_id', user.id).maybeSingle();
        const { count: pendingCount } = await supabase.from('service_requests_public' as any).select('id', { count: 'exact', head: true });
        setStats({
          completedJobs: completed.length,
          averageRating: ratings?.avg_rating ? Number(ratings.avg_rating) : 0,
          totalEarnings: `R$ ${(totalEarnings / 100).toLocaleString('pt-BR')}`,
          pendingRequests: pendingCount || 0,
          responseTime: '-',
          responseRate: ratings?.rating_count ? 100 : 0
        });
      } catch {
        // Keep defaults
      }
    };
    fetchStats();
  }, [user]);

  const userCategories = user?.user_metadata?.categories || ['eletrica', 'hidraulica'];
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';

  const statCards = [
    { title: 'Trabalhos Concluídos', value: stats.completedJobs, sub: '+12% desde o mês passado', icon: Calendar, iconColor: 'text-muted-foreground' },
    { title: 'Avaliação Média', value: stats.averageRating, sub: 'Baseado em avaliações recentes', icon: Star, iconColor: 'text-yellow-500', suffix: <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 ml-1" /> },
    { title: 'Ganhos Totais', value: stats.totalEarnings, sub: 'Este mês: R$ 2.340', icon: DollarSign, iconColor: 'text-emerald-500', valueClass: 'text-emerald-600' },
    { title: 'Tempo de Resposta', value: stats.responseTime, sub: `${stats.responseRate}% de taxa de resposta`, icon: Clock, iconColor: 'text-blue-500' },
  ];

  const quickActions = [
    { label: 'Solicitações de Help', icon: Briefcase, route: '/help-requests', className: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' },
    { label: 'Minhas Ofertas', icon: Settings, route: '/my-offers', className: 'bg-accent hover:bg-accent/80 text-accent-foreground border border-border/50' },
    { label: 'Pagamentos', icon: CreditCard, route: '/payment-freelancer-settings', className: 'bg-accent hover:bg-accent/80 text-accent-foreground border border-border/50' },
    { label: 'Meu Perfil', icon: Users, route: '/profile', className: 'bg-accent hover:bg-accent/80 text-accent-foreground border border-border/50' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
        {bannersLoading && (
          <div className="bg-muted animate-pulse rounded-2xl h-[300px] md:h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Carregando banners...</p>
          </div>
        )}
        {!bannersLoading && bannersError && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4">
            <p className="text-destructive">Erro ao carregar banners: {bannersError}</p>
          </div>
        )}
        {!bannersLoading && !bannersError && banners.length > 0 && (
          <BannerCarousel banners={banners} className="rounded-2xl shadow-lg" />
        )}
        {!bannersLoading && !bannersError && banners.length === 0 && (
          <div className="bg-muted border border-border/50 rounded-2xl p-4 text-center">
            <p className="text-muted-foreground">Nenhum banner promocional disponível no momento.</p>
          </div>
        )}
      </motion.div>

      {/* Welcome */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="gradient-primary rounded-2xl p-6 text-white shadow-lg shadow-primary/20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMThjOS45NCAwIDE4LTguMDYgMTgtMTgiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta, {userName}! 👋</h1>
          <p className="opacity-90 mb-4">Você tem {stats.pendingRequests} novas solicitações de serviço</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/help-requests')} className="rounded-xl shadow-sm">
              <Briefcase className="h-4 w-4 mr-2" />Ver Solicitações
            </Button>
            <Button variant="outline" onClick={() => navigate('/my-offers')} className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl">
              Meus Trabalhos
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Briefcase className="h-5 w-5 mr-2 text-primary" />Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Button key={action.route} onClick={() => navigate(action.route)} className={`h-16 flex flex-col gap-1 rounded-xl ${action.className}`}>
                  <action.icon className="h-5 w-5" />{action.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Map */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
        <ServiceMap />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.title} variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
            <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center ${stat.valueClass || ''}`}>
                  {stat.value}{stat.suffix}
                </div>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="h-5 w-5 mr-2 text-primary" />Suas Categorias de Serviço</CardTitle>
            <CardDescription>Categorias em que você atua como freelancer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {userCategories.map((categoryId: string, index: number) => (
                <Badge key={index} variant="secondary" className="rounded-lg">{categoryId}</Badge>
              ))}
            </div>
            <Button variant="outline" onClick={() => navigate('/profile')} className="rounded-xl">Gerenciar Serviços</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Jobs */}
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-primary" />Trabalhos Recentes</CardTitle>
            <CardDescription>Histórico dos seus últimos trabalhos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm">Nenhum trabalho recente encontrado</p>
              <Button variant="outline" onClick={() => navigate('/help-requests')} className="mt-4 rounded-xl">
                Ver Solicitações Disponíveis
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FreelancerHome;
