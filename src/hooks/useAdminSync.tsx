
import { useState, useEffect, useCallback } from 'react';
import { adminSyncService, SyncData, SyncStatus } from '@/services/adminSyncService';
import { useToast } from '@/components/ui/use-toast';

export const useAdminSync = () => {
  const [syncData, setSyncData] = useState<SyncData | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    lastSync: null,
    error: null
  });
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(false);
  const { toast } = useToast();

  // Configurar toast no serviço
  useEffect(() => {
    adminSyncService.setToast(toast);
  }, [toast]);

  // Sincronização completa
  const syncAll = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await adminSyncService.syncAllData();
      if (data) {
        setSyncData(data);
        setSyncStatus({
          isLoading: false,
          lastSync: new Date(),
          error: null
        });
      } else {
        setSyncStatus(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error: any) {
      setSyncStatus({
        isLoading: false,
        lastSync: null,
        error: error.message
      });
    }
  }, []);

  // Sincronização de tabela específica
  const syncTable = useCallback(async (tableName: string) => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      const data = await adminSyncService.syncTableData(tableName);
      if (data && syncData) {
        setSyncData(prev => prev ? { ...prev, [tableName]: data } : null);
      }
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
      return data;
    } catch (error: any) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      return null;
    }
  }, [syncData]);

  // Verificar status
  const checkStatus = useCallback(async () => {
    const status = await adminSyncService.checkSyncStatus();
    setSyncStatus(status);
  }, []);

  // Habilitar sincronização em tempo real
  const enableRealtime = useCallback(async () => {
    if (isRealtimeEnabled) return;

    try {
      const channel = await adminSyncService.enableRealtimeSync((payload) => {
        console.log('Sincronização em tempo real ativada:', payload);
        
        // Atualizar dados quando houver mudanças
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
          syncTable(payload.table);
        }
      });

      setIsRealtimeEnabled(true);
      
      toast({
        title: "Sincronização em tempo real ativada",
        description: "Os dados serão atualizados automaticamente."
      });

      return () => {
        channel.unsubscribe();
        setIsRealtimeEnabled(false);
      };
    } catch (error: any) {
      toast({
        title: "Erro na sincronização em tempo real",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [isRealtimeEnabled, syncTable, toast]);

  // Atualizar configurações
  const updateSettings = useCallback(async (key: string, value: any) => {
    try {
      await adminSyncService.updateAppSettings(key, value);
      // Atualizar dados locais
      await syncTable('app_settings');
    } catch (error: any) {
      console.error('Erro ao atualizar configurações:', error);
    }
  }, [syncTable]);

  // Verificar status na inicialização
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    syncData,
    syncStatus,
    isRealtimeEnabled,
    syncAll,
    syncTable,
    checkStatus,
    enableRealtime,
    updateSettings
  };
};
