
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Wifi, WifiOff, Database, Clock, AlertCircle } from 'lucide-react';
import { useAdminSync } from '@/hooks/useAdminSync';
import { useToast } from '@/components/ui/use-toast';

const AdminSyncPanel: React.FC = () => {
  const {
    syncData,
    syncStatus,
    isRealtimeEnabled,
    syncAll,
    syncTable,
    enableRealtime,
    updateSettings
  } = useAdminSync();
  const { toast } = useToast();

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDataCounts = () => {
    if (!syncData) return {};
    
    return {
      profiles: syncData.profiles?.length || 0,
      categories: syncData.categories?.length || 0,
      service_requests: syncData.service_requests?.length || 0,
      subscription_plans: syncData.subscription_plans?.length || 0,
      promotional_banners: syncData.promotional_banners?.length || 0,
      app_settings: syncData.app_settings?.length || 0
    };
  };

  const dataCounts = getDataCounts();

  return (
    <div className="space-y-6">
      {/* Status da Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status da Sincronização
          </CardTitle>
          <CardDescription>
            Gerenciar sincronização de dados com o painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Última sincronização:</span>
              <span className="font-medium">{formatLastSync(syncStatus.lastSync)}</span>
            </div>
            <div className="flex items-center gap-2">
              {isRealtimeEnabled ? (
                <Badge variant="default" className="bg-green-500">
                  <Wifi className="h-3 w-3 mr-1" />
                  Tempo Real Ativo
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Tempo Real Inativo
                </Badge>
              )}
            </div>
          </div>

          {syncStatus.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{syncStatus.error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={syncAll}
              disabled={syncStatus.isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
              {syncStatus.isLoading ? 'Sincronizando...' : 'Sincronizar Tudo'}
            </Button>
            
            <Button
              onClick={enableRealtime}
              disabled={isRealtimeEnabled}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Wifi className="h-4 w-4" />
              {isRealtimeEnabled ? 'Tempo Real Ativo' : 'Ativar Tempo Real'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dados Sincronizados */}
      {syncData && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Sincronizados</CardTitle>
            <CardDescription>
              Visualização dos dados atualmente sincronizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Perfis</span>
                  <Badge variant="outline">{dataCounts.profiles}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => syncTable('profiles')}
                  className="w-full"
                >
                  Sincronizar
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Categorias</span>
                  <Badge variant="outline">{dataCounts.categories}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => syncTable('categorias')}
                  className="w-full"
                >
                  Sincronizar
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Solicitações</span>
                  <Badge variant="outline">{dataCounts.service_requests}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => syncTable('service_requests')}
                  className="w-full"
                >
                  Sincronizar
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Planos</span>
                  <Badge variant="outline">{dataCounts.subscription_plans}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => syncTable('subscription_plans')}
                  className="w-full"
                >
                  Sincronizar
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Banners</span>
                  <Badge variant="outline">{dataCounts.promotional_banners}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => syncTable('promotional_banners')}
                  className="w-full"
                >
                  Sincronizar
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Configurações</span>
                  <Badge variant="outline">{dataCounts.app_settings}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => syncTable('app_settings')}
                  className="w-full"
                >
                  Sincronizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSyncPanel;
