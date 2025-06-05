
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Settings } from 'lucide-react';

interface AppSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
}

const AppSettings = () => {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    plan_pricing: {
      solicitante: { basic: 0, premium: 0, pro: 0 },
      freelancer: { basic: 0, premium: 0, pro: 0 }
    },
    platform_fees: { percentage: 0, minimum: 0 },
    terms_of_service: '',
    privacy_policy: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });

      setFormData({
        plan_pricing: settingsMap.plan_pricing || formData.plan_pricing,
        platform_fees: settingsMap.platform_fees || formData.platform_fees,
        terms_of_service: settingsMap.terms_of_service?.text || '',
        privacy_policy: settingsMap.privacy_policy?.text || ''
      });

      setSettings(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        {
          key: 'plan_pricing',
          value: formData.plan_pricing,
          description: 'Preços dos planos'
        },
        {
          key: 'platform_fees',
          value: formData.platform_fees,
          description: 'Taxas da plataforma'
        },
        {
          key: 'terms_of_service',
          value: { text: formData.terms_of_service },
          description: 'Termos de serviço'
        },
        {
          key: 'privacy_policy',
          value: { text: formData.privacy_policy },
          description: 'Política de privacidade'
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('app_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({ title: 'Configurações salvas com sucesso!' });
      fetchSettings();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações do App</h1>
        <p className="text-gray-600">Gerencie configurações globais do HelpAqui</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preços dos Planos - Solicitantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sol_basic">Plano Básico (R$)</Label>
              <Input
                id="sol_basic"
                type="number"
                step="0.01"
                value={formData.plan_pricing.solicitante.basic}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  plan_pricing: {
                    ...prev.plan_pricing,
                    solicitante: {
                      ...prev.plan_pricing.solicitante,
                      basic: parseFloat(e.target.value) || 0
                    }
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="sol_premium">Plano Premium (R$)</Label>
              <Input
                id="sol_premium"
                type="number"
                step="0.01"
                value={formData.plan_pricing.solicitante.premium}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  plan_pricing: {
                    ...prev.plan_pricing,
                    solicitante: {
                      ...prev.plan_pricing.solicitante,
                      premium: parseFloat(e.target.value) || 0
                    }
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="sol_pro">Plano Pro (R$)</Label>
              <Input
                id="sol_pro"
                type="number"
                step="0.01"
                value={formData.plan_pricing.solicitante.pro}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  plan_pricing: {
                    ...prev.plan_pricing,
                    solicitante: {
                      ...prev.plan_pricing.solicitante,
                      pro: parseFloat(e.target.value) || 0
                    }
                  }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preços dos Planos - Freelancers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="free_basic">Plano Básico (R$)</Label>
              <Input
                id="free_basic"
                type="number"
                step="0.01"
                value={formData.plan_pricing.freelancer.basic}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  plan_pricing: {
                    ...prev.plan_pricing,
                    freelancer: {
                      ...prev.plan_pricing.freelancer,
                      basic: parseFloat(e.target.value) || 0
                    }
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="free_premium">Plano Premium (R$)</Label>
              <Input
                id="free_premium"
                type="number"
                step="0.01"
                value={formData.plan_pricing.freelancer.premium}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  plan_pricing: {
                    ...prev.plan_pricing,
                    freelancer: {
                      ...prev.plan_pricing.freelancer,
                      premium: parseFloat(e.target.value) || 0
                    }
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="free_pro">Plano Pro (R$)</Label>
              <Input
                id="free_pro"
                type="number"
                step="0.01"
                value={formData.plan_pricing.freelancer.pro}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  plan_pricing: {
                    ...prev.plan_pricing,
                    freelancer: {
                      ...prev.plan_pricing.freelancer,
                      pro: parseFloat(e.target.value) || 0
                    }
                  }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taxas da Plataforma</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fee_percentage">Porcentagem (%)</Label>
              <Input
                id="fee_percentage"
                type="number"
                step="0.1"
                value={formData.platform_fees.percentage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  platform_fees: {
                    ...prev.platform_fees,
                    percentage: parseFloat(e.target.value) || 0
                  }
                }))}
              />
            </div>
            <div>
              <Label htmlFor="fee_minimum">Taxa Mínima (R$)</Label>
              <Input
                id="fee_minimum"
                type="number"
                step="0.01"
                value={formData.platform_fees.minimum}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  platform_fees: {
                    ...prev.platform_fees,
                    minimum: parseFloat(e.target.value) || 0
                  }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termos de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.terms_of_service}
              onChange={(e) => setFormData(prev => ({ ...prev, terms_of_service: e.target.value }))}
              rows={6}
              placeholder="Digite os termos de serviço..."
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Política de Privacidade</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.privacy_policy}
              onChange={(e) => setFormData(prev => ({ ...prev, privacy_policy: e.target.value }))}
              rows={6}
              placeholder="Digite a política de privacidade..."
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default AppSettings;
