
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Building2, Crown } from 'lucide-react';
import BackButton from '@/components/ui/back-button';
import { toast } from 'sonner';
import { getSubscriptionPlans, subscribeToPlan, type SubscriptionPlan } from '@/services/subscriptionService';

const EmpresaPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const data = await getSubscriptionPlans('empresa');
        setPlans(data);
      } catch (error) {
        console.error('Error loading plans:', error);
        toast.error('Erro ao carregar planos');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSubscribing(true);
    try {
      const success = await subscribeToPlan(plan.id);
      if (success) {
        toast.success(`Plano ${plan.name} ativado com sucesso!`);
        navigate('/dashboard');
      } else {
        toast.error('Erro ao ativar plano');
      }
    } catch {
      toast.error('Erro ao processar assinatura');
    } finally {
      setSubscribing(false);
    }
  };

  const isGold = (plan: SubscriptionPlan) => plan.price_monthly > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="helpaqui-container py-8">
        <BackButton />
        <div className="text-center mb-8">
          <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Planos para Empresas</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para sua empresa e aproveite todos os benefícios do HelpAqui.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all hover:shadow-lg ${
                  isGold(plan) ? 'border-2 border-yellow-500 shadow-yellow-100' : ''
                }`}
              >
                {isGold(plan) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-yellow-500 text-white flex items-center gap-1">
                      <Crown className="h-3 w-3" /> Recomendado
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price_monthly === 0 ? 'Grátis' : `R$ ${plan.price_monthly.toFixed(2)}`}
                    </span>
                    {plan.price_monthly > 0 && <span className="text-muted-foreground">/mês</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${isGold(plan) ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing}
                  >
                    {subscribing ? 'Processando...' : plan.price_monthly === 0 ? 'Começar Grátis' : 'Assinar Agora'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpresaPlans;
