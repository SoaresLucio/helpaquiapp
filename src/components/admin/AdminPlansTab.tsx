import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptionPlans, type SubscriptionPlan } from '@/services/subscriptionService';
import { supabase } from '@/integrations/supabase/client';

const AdminPlansTab: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const [sol, free] = await Promise.all([
        getSubscriptionPlans('solicitante'),
        getSubscriptionPlans('freelancer'),
      ]);
      setPlans([...sol, ...free]);
    } catch (error) {
      toast.error('Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (planId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ price_monthly: editPrice, updated_at: new Date().toISOString() })
        .eq('id', planId);
      if (error) throw error;
      toast.success('Preço atualizado!');
      setEditingPlan(null);
      await loadPlans();
    } catch (error) {
      toast.error('Erro ao atualizar preço');
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Gerenciar Planos</h2>
        <p className="text-muted-foreground">Edite preços dos planos de assinatura</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plano</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Preço Mensal</TableHead>
                    <TableHead>Max Solicitações</TableHead>
                    <TableHead>Suporte Prioritário</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <Badge className={plan.user_type === 'freelancer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {plan.user_type === 'freelancer' ? 'Freelancer' : 'Solicitante'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {editingPlan === plan.id ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number(e.target.value))}
                            className="w-28"
                          />
                        ) : (
                          <span className="font-semibold">
                            {plan.price_monthly === 0 ? 'Grátis' : formatPrice(plan.price_monthly)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{plan.max_requests_per_month === -1 ? 'Ilimitadas' : plan.max_requests_per_month || 0}</TableCell>
                      <TableCell>{plan.priority_support ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>
                        {editingPlan === plan.id ? (
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => handleSave(plan.id)} disabled={saving}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingPlan(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => { setEditingPlan(plan.id); setEditPrice(plan.price_monthly); }}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-muted rounded-lg border">
        <h3 className="font-semibold text-foreground mb-1">⚠️ Atenção</h3>
        <p className="text-sm text-muted-foreground">
          Alterações de preços são aplicadas para novos assinantes. Assinantes atuais mantêm o preço até a renovação.
        </p>
      </div>
    </div>
  );
};

export default AdminPlansTab;
