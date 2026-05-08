
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseBusiness, UserRound, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";

type UserType = 'solicitante' | 'freelancer' | 'empresa';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const userTypes = [
  {
    type: 'solicitante' as UserType,
    icon: UserRound,
    title: 'Sou Solicitante',
    desc: 'Preciso encontrar profissionais para meus projetos',
    features: ['Publique suas necessidades', 'Receba propostas de freelancers', 'Escolha o melhor profissional', 'Acompanhe o progresso'],
    gradient: 'from-primary to-primary/80',
  },
  {
    type: 'freelancer' as UserType,
    icon: BriefcaseBusiness,
    title: 'Sou Freelancer',
    desc: 'Quero oferecer meus serviços e encontrar oportunidades',
    features: ['Cadastre seus serviços', 'Encontre clientes próximos', 'Gerencie seus trabalhos', 'Receba pagamentos seguros'],
    gradient: 'from-secondary to-secondary/80',
  },
  {
    type: 'empresa' as UserType,
    icon: Building2,
    title: 'Sou Empresa',
    desc: 'Quero divulgar vagas, serviços e minha marca',
    features: ['Divulgue vagas de emprego', 'Promova sua empresa', 'Encontre freelancers', 'Ofereça serviços'],
    gradient: 'from-accent-foreground to-accent-foreground/80',
  },
];

const UserTypeSelection = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkExistingType = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const existingType = user.user_metadata?.user_type;
        if (existingType && ['solicitante', 'freelancer', 'empresa'].includes(existingType)) {
          localStorage.setItem('userType', existingType);
          navigate('/dashboard', { replace: true });
          return;
        }
      } else {
        // No session — return to login
        navigate('/login', { replace: true });
        return;
      }
      setChecking(false);
    };
    checkExistingType();
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Verificando...</p>
        </motion.div>
      </div>
    );
  }

  const handleTypeSelection = async (userType: UserType) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { user_type: userType } });
      if (error) throw error;
      localStorage.setItem('userType', userType);
      const labels: Record<UserType, string> = { solicitante: 'Solicitante', freelancer: 'Freelancer', empresa: 'Empresa' };
      toast.success(`Tipo de usuário definido como ${labels[userType]}.`);
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Erro ao definir tipo de usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="mb-10 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-extrabold text-2xl text-gradient-primary">HelpAqui</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">Como você quer usar o HelpAqui?</h1>
        <p className="text-muted-foreground">Escolha o perfil que melhor se encaixa com você</p>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5">
        {userTypes.map((item, i) => {
          const isSelected = selectedType === item.type;
          return (
            <motion.div key={item.type} variants={scaleIn} initial="hidden" animate="visible" custom={i + 1}>
              <Card
                className={`cursor-pointer transition-all duration-300 rounded-2xl border-border/50 hover:shadow-lg group ${
                  isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/10 border-primary/30' : 'hover:border-primary/20'
                }`}
                onClick={() => setSelectedType(item.type)}
              >
                <CardHeader className="text-center pb-3">
                  <motion.div
                    animate={isSelected ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="mx-auto mb-3"
                  >
                    <div className={`p-3.5 rounded-2xl bg-accent ${isSelected ? 'bg-primary/10' : ''} transition-colors`}>
                      <item.icon className={`h-8 w-8 ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'} transition-colors`} />
                    </div>
                  </motion.div>
                  <CardTitle className="text-lg text-foreground">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground/50'} transition-colors`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="mt-8">
        <Button
          size="lg"
          disabled={!selectedType || loading}
          onClick={() => selectedType && handleTypeSelection(selectedType)}
          className="h-12 px-10 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25 hover:shadow-xl transition-all text-base font-semibold"
        >
          {loading ? "Configurando..." : "Continuar"}
          {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;
