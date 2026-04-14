
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Briefcase, Megaphone, Users, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const EmpresaHome: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: Briefcase,
      title: 'Gerenciar Vagas',
      description: 'Crie, edite e monitore suas vagas de emprego e candidatos',
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
      action: () => navigate('/'),
    },
    {
      icon: Settings,
      title: 'Planos',
      description: 'Gerencie sua assinatura',
      action: () => navigate('/empresa-plans'),
    }
  ];

  return (
    <div className="flex-1 space-y-6">
      {/* Hero — card branco com barra gradiente invertida (azul→roxo) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
      >
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #2b439b, #6c2ea0)' }} />

        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #2b439b, #6c2ea0)' }}
            >
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-slate-500 text-xs">Painel Empresarial</p>
              <h1 className="text-lg font-black text-slate-900">Gestão de Vagas</h1>
            </div>
          </div>

          <p className="text-slate-500 text-sm mb-5">
            Publique vagas, encontre freelancers e promova sua empresa
          </p>

          {/* Botão publicar vaga */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/empresa/jobs')}
            className="w-full py-3 rounded-2xl text-white font-bold text-sm mb-3"
            style={{
              background: 'linear-gradient(135deg, #2b439b, #6c2ea0)',
              boxShadow: '0 4px 15px rgba(43,67,155,0.25)',
            }}
          >
            + Publicar Vaga
          </motion.button>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <Card
            key={action.title}
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border border-slate-200 rounded-2xl"
            onClick={action.action}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(43,67,155,0.08)' }}
                >
                  <action.icon className="h-5 w-5" style={{ color: '#2b439b' }} />
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
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
