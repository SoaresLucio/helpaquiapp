
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Briefcase, Megaphone, Users, Settings } from 'lucide-react';

const EmpresaHome: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Briefcase,
      title: 'Gerenciar Vagas',
      description: 'Crie, edite e monitore suas vagas de emprego e candidatos',
      action: () => navigate('/empresa/jobs'),
      color: 'text-primary'
    },
    {
      icon: Megaphone,
      title: 'Divulgação',
      description: 'Promova sua empresa no aplicativo',
      action: () => navigate('/offers'),
      color: 'text-primary'
    },
    {
      icon: Users,
      title: 'Buscar Freelancers',
      description: 'Encontre profissionais qualificados',
      action: () => navigate('/'),
      color: 'text-primary'
    },
    {
      icon: Settings,
      title: 'Planos',
      description: 'Gerencie sua assinatura',
      action: () => navigate('/empresa-plans'),
      color: 'text-primary'
    }
  ];

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Painel da Empresa</h2>
          <p className="text-muted-foreground">Gerencie suas publicações e encontre profissionais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
            onClick={action.action}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <action.icon className={`h-6 w-6 ${action.color}`} />
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
