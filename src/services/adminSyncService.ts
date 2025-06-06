
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface SyncData {
  profiles: any[];
  categories: any[];
  service_requests: any[];
  subscription_plans: any[];
  promotional_banners: any[];
  app_settings: any[];
}

export interface SyncStatus {
  isLoading: boolean;
  lastSync: Date | null;
  error: string | null;
}

// Define the allowed table names for synchronization
type SyncableTableNames = 
  | 'profiles'
  | 'categorias'
  | 'service_requests'
  | 'subscription_plans'
  | 'promotional_banners'
  | 'app_settings';

class AdminSyncService {
  private toast: any;

  constructor() {
    // Toast será injetado quando necessário
  }

  setToast(toast: any) {
    this.toast = toast;
  }

  // Sincronizar todos os dados do painel administrativo
  async syncAllData(): Promise<SyncData | null> {
    try {
      console.log('Iniciando sincronização completa dos dados...');

      const [
        profilesResponse,
        categoriesResponse,
        serviceRequestsResponse,
        subscriptionPlansResponse,
        bannersResponse,
        settingsResponse
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('categorias').select('*'),
        supabase.from('service_requests').select('*'),
        supabase.from('subscription_plans').select('*'),
        supabase.from('promotional_banners').select('*'),
        supabase.from('app_settings').select('*')
      ]);

      // Verificar erros em qualquer consulta
      const responses = [
        profilesResponse,
        categoriesResponse,
        serviceRequestsResponse,
        subscriptionPlansResponse,
        bannersResponse,
        settingsResponse
      ];

      for (const response of responses) {
        if (response.error) {
          throw new Error(`Erro na sincronização: ${response.error.message}`);
        }
      }

      const syncData: SyncData = {
        profiles: profilesResponse.data || [],
        categories: categoriesResponse.data || [],
        service_requests: serviceRequestsResponse.data || [],
        subscription_plans: subscriptionPlansResponse.data || [],
        promotional_banners: bannersResponse.data || [],
        app_settings: settingsResponse.data || []
      };

      console.log('Sincronização completa realizada com sucesso:', syncData);
      
      if (this.toast) {
        this.toast({
          title: "Sincronização concluída",
          description: "Todos os dados foram sincronizados com sucesso."
        });
      }

      return syncData;
    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      
      if (this.toast) {
        this.toast({
          title: "Erro na sincronização",
          description: error.message,
          variant: "destructive"
        });
      }

      return null;
    }
  }

  // Sincronizar dados específicos por tabela
  async syncTableData(tableName: SyncableTableNames) {
    try {
      console.log(`Sincronizando dados da tabela: ${tableName}`);

      const { data, error } = await supabase
        .from(tableName)
        .select('*');

      if (error) {
        throw new Error(`Erro ao sincronizar ${tableName}: ${error.message}`);
      }

      console.log(`Dados da tabela ${tableName} sincronizados:`, data);
      
      if (this.toast) {
        this.toast({
          title: "Sincronização parcial concluída",
          description: `Tabela ${tableName} sincronizada com sucesso.`
        });
      }

      return data;
    } catch (error: any) {
      console.error(`Erro na sincronização da tabela ${tableName}:`, error);
      
      if (this.toast) {
        this.toast({
          title: "Erro na sincronização",
          description: error.message,
          variant: "destructive"
        });
      }

      return null;
    }
  }

  // Verificar status da sincronização
  async checkSyncStatus(): Promise<SyncStatus> {
    try {
      // Verificar se há dados recentes nas tabelas principais
      const { data: recentData, error } = await supabase
        .from('app_settings')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        return {
          isLoading: false,
          lastSync: null,
          error: error.message
        };
      }

      const lastSync = recentData && recentData.length > 0 
        ? new Date(recentData[0].updated_at) 
        : null;

      return {
        isLoading: false,
        lastSync,
        error: null
      };
    } catch (error: any) {
      return {
        isLoading: false,
        lastSync: null,
        error: error.message
      };
    }
  }

  // Forçar sincronização em tempo real
  async enableRealtimeSync(callback: (payload: any) => void) {
    try {
      console.log('Habilitando sincronização em tempo real...');

      const channel = supabase
        .channel('admin-sync-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('Mudança detectada em profiles:', payload);
            callback(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'categorias'
          },
          (payload) => {
            console.log('Mudança detectada em categorias:', payload);
            callback(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'service_requests'
          },
          (payload) => {
            console.log('Mudança detectada em service_requests:', payload);
            callback(payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'app_settings'
          },
          (payload) => {
            console.log('Mudança detectada em app_settings:', payload);
            callback(payload);
          }
        )
        .subscribe();

      return channel;
    } catch (error: any) {
      console.error('Erro ao habilitar sincronização em tempo real:', error);
      throw error;
    }
  }

  // Atualizar configurações do app
  async updateAppSettings(key: string, value: any) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar configuração: ${error.message}`);
      }

      console.log('Configuração atualizada:', data);
      
      if (this.toast) {
        this.toast({
          title: "Configuração atualizada",
          description: `A configuração "${key}" foi atualizada com sucesso.`
        });
      }

      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      
      if (this.toast) {
        this.toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive"
        });
      }

      throw error;
    }
  }
}

export const adminSyncService = new AdminSyncService();
