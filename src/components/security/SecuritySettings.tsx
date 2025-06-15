
import React from 'react';
import { Shield, Eye, EyeOff, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import SecurityEventsList from './SecurityEventsList';
import SecurityAlert from './SecurityAlert';

const SecuritySettings: React.FC = () => {
  const { 
    securityEvents, 
    securityStats, 
    loading,
    clearSecurityEvents,
    refreshEvents 
  } = useSecurityMonitor();

  const [showSensitiveData, setShowSensitiveData] = React.useState(false);
  const [enableNotifications, setEnableNotifications] = React.useState(true);
  const [enable2FA, setEnable2FA] = React.useState(false);

  const exportSecurityData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      events: securityEvents,
      stats: securityStats
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Alertas de Segurança */}
      {securityStats.suspiciousActivity && (
        <SecurityAlert
          type="warning"
          title="Atividade Suspeita Detectada"
          message="Foram detectadas múltiplas tentativas de acesso falharam recentemente. Verifique sua conta."
          actions={
            <Button size="sm" onClick={refreshEvents}>
              Atualizar Status
            </Button>
          }
        />
      )}

      {securityStats.failedAttempts > 10 && (
        <SecurityAlert
          type="error"
          title="Muitas Tentativas de Acesso Falharam"
          message="Sua conta teve muitas tentativas de acesso falharam. Considere alterar sua senha."
          actions={
            <Button size="sm" variant="destructive">
              Alterar Senha
            </Button>
          }
        />
      )}

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visibilidade de Dados Sensíveis */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-sensitive">Mostrar Dados Sensíveis</Label>
              <p className="text-sm text-gray-500">
                Exibir números de conta e CPF completos
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {showSensitiveData ? (
                <Eye className="w-4 h-4 text-gray-500" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-500" />
              )}
              <Switch
                id="show-sensitive"
                checked={showSensitiveData}
                onCheckedChange={setShowSensitiveData}
              />
            </div>
          </div>

          {/* Notificações de Segurança */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-notifications">Notificações de Segurança</Label>
              <p className="text-sm text-gray-500">
                Receber alertas sobre atividades suspeitas
              </p>
            </div>
            <Switch
              id="security-notifications"
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
            />
          </div>

          {/* Autenticação de Dois Fatores */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
              <p className="text-sm text-gray-500">
                Camada extra de segurança para sua conta
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={enable2FA}
              onCheckedChange={setEnable2FA}
            />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {securityStats.totalEvents}
              </div>
              <div className="text-sm text-gray-500">Total de Eventos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {securityStats.failedAttempts}
              </div>
              <div className="text-sm text-gray-500">Tentativas Falharam</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {securityStats.totalEvents - securityStats.failedAttempts}
              </div>
              <div className="text-sm text-gray-500">Acessos Bem-sucedidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {securityStats.suspiciousActivity ? 'Sim' : 'Não'}
              </div>
              <div className="text-sm text-gray-500">Atividade Suspeita</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Eventos */}
      <SecurityEventsList events={securityEvents} loading={loading} />

      {/* Ações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Segurança</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={refreshEvents} variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Atualizar Eventos
            </Button>
            
            <Button onClick={exportSecurityData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>

            <Button 
              onClick={clearSecurityEvents} 
              variant="destructive"
              disabled={securityEvents.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Histórico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
