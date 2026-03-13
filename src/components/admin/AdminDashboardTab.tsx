import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, CreditCard, FolderOpen, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardMetrics {
  totalUsers: number;
  totalFreelancers: number;
  totalRequests: number;
  totalCategories: number;
  activeSubscriptions: number;
  totalPayments: number;
}

const AdminDashboardTab: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0, totalFreelancers: 0, totalRequests: 0,
    totalCategories: 0, activeSubscriptions: 0, totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [profiles, freelancers, requests, categories, subscriptions, payments] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('freelancer_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('service_requests').select('id', { count: 'exact', head: true }),
          supabase.from('categorias').select('id', { count: 'exact', head: true }),
          supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('payments').select('id', { count: 'exact', head: true }),
        ]);

        setMetrics({
          totalUsers: profiles.count || 0,
          totalFreelancers: freelancers.count || 0,
          totalRequests: requests.count || 0,
          totalCategories: categories.count || 0,
          activeSubscriptions: subscriptions.count || 0,
          totalPayments: payments.count || 0,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const cards = [
    { title: 'Total de Usuários', value: metrics.totalUsers, icon: Users, color: 'text-blue-600' },
    { title: 'Freelancers', value: metrics.totalFreelancers, icon: Activity, color: 'text-green-600' },
    { title: 'Solicitações', value: metrics.totalRequests, icon: FileText, color: 'text-orange-600' },
    { title: 'Categorias', value: metrics.totalCategories, icon: FolderOpen, color: 'text-purple-600' },
    { title: 'Assinaturas Ativas', value: metrics.activeSubscriptions, icon: TrendingUp, color: 'text-emerald-600' },
    { title: 'Pagamentos', value: metrics.totalPayments, icon: CreditCard, color: 'text-rose-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral da plataforma HelpAqui</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
              ) : (
                <p className="text-3xl font-bold text-foreground">{card.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboardTab;
