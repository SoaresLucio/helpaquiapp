import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import BackButton from '@/components/ui/back-button';
import { Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptionPlans, type SubscriptionPlan } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';

const AdminPlanManagement: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const [solicitantePlans, freelancerPlans] = await Promise.all([
        getSubscriptionPlans('solicitante'),
        getSubscriptionPlans('freelancer')
      ]);
      
      const allPlans = [...solicitantePlans, ...freelancerPlans];
      setPlans(allPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditPrice(plan.price_monthly);
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setEditPrice(0);
  };

  const handleSavePrice = async (planId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ 
          price_monthly: editPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;

      toast.success('Preço atualizado com sucesso!');
      setEditingPlan(null);
      await loadPlans();
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Erro ao atualizar preço');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPlanTypeColor = (userType: string) => {
    return userType === 'freelancer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Gerenciamento de Planos
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Gerencie os preços dos planos de assinatura da plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">
                    {plan.name}
                  </CardTitle>
                  <Badge className={getPlanTypeColor(plan.user_type || 'solicitante')}>
                    {plan.user_type === 'freelancer' ? 'Freelancer' : 'Solicitante'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  {editingPlan === plan.id ? (
                    <div className="space-y-3">
                      <Label htmlFor={`price-${plan.id}`}>Preço Mensal (R$)</Label>
                      <Input
                        id={`price-${plan.id}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        placeholder="0.00"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSavePrice(plan.id)}
                          disabled={saving}
                          className="flex-1"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {saving ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-helpaqui-blue">
                        {plan.price_monthly === 0 ? 'Grátis' : formatPrice(plan.price_monthly)}
                        {plan.price_monthly > 0 && (
                          <span className="text-sm font-normal text-gray-500">/mês</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(plan)}
                        className="w-full"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar Preço
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600">
                  <p><strong>Max. Solicitações:</strong> {
                    plan.max_requests_per_month === -1 ? 'Ilimitadas' : 
                    plan.max_requests_per_month || '0'
                  }</p>
                  <p><strong>Suporte Prioritário:</strong> {
                    plan.priority_support ? 'Sim' : 'Não'
                  }</p>
                </div>

                <div className="text-xs text-gray-500">
                  <p>ID: {plan.id}</p>
                  <p>Atualizado: {new Date(plan.updated_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Atenção</h3>
          <p className="text-sm text-yellow-700">
            As alterações de preços serão aplicadas imediatamente para novos usuários que se inscreverem nos planos. 
            Usuários já assinantes manterão o preço contratado até a próxima renovação.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPlanManagement;