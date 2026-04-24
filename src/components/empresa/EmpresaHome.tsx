
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Briefcase, Megaphone, Users, Settings, Crown, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const EmpresaHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, activeJobs: 0, applications: 0, companyName: '' });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [jobsRes, companyRes] = await Promise.all([
        supabase.from('job_listings').select('id, is_active').eq('owner_id', user.id),
        supabase.from('empresa_profiles').select('company_name').eq('user_id', user.id).maybeSingle()
      ]);

      const jobs = jobsRes.data || [];
      const activeJobs = jobs.filter(j => j.is_active).length;

      let appCount = 0;
      if (jobs.length > 0) {
        const { count } = await supabase
          .from('job_applications')
          .select('id', { count: 'exact', head: true })
          .in('job_listing_id', jobs.map(j => j.id));
        appCount = count || 0;
      }

      setStats({
        jobs: jobs.length,
        activeJobs,
        applications: appCount,
        companyName: companyRes.data?.company_name || 'Empresa'
      });
    };
    fetchStats();
  }, [user]);

  const statCards = [
    { label: 'Total de Vagas', value: stats.jobs, icon: FileText },
    { label: 'Vagas Ativas', value: stats.activeJobs, icon: Eye },
    { label: 'Candidaturas', value: stats.applications, icon: Users },
  ];

  const quickActions = [
    {
      icon: Briefcase,
      title: 'Gerenciar Vagas',
      description: 'Crie, edite e monitore vagas e candidatos',
      action: () => navigate('/empresa/jobs'),
    },
    {
      icon: Megaphone,
      title: 'Divulgação',
      description: 'Promova sua empresa no aplicativo',
      action: () => navigate('/offers'),
    },
    {
      icon: Users,
      title: 'Buscar Freelancers',
      description: 'Encontre profissionais qualificados',
      action: () => navigate('/jobs'),
    },
    {
      icon: Settings,
      title: 'Planos & Assinatura',
      description: 'Gerencie sua assinatura empresarial',
      action: () => navigate('/empresa-plans'),
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{stats.companyName}</h2>
          <p className="text-muted-foreground">Painel da Empresa</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
            onClick={action.action}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <action.icon className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">{action.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{action.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EmpresaHome;
