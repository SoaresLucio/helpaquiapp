
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AnalyticsReport {
  id: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  date_from: string;
  date_to: string;
  data: any;
  generated_by: string;
  created_at: string;
}

interface AnalyticsData {
  total_users: number;
  total_service_requests: number;
  total_freelancer_offers: number;
  total_payments: number;
  ai_support_conversations: number;
  pending_verifications: number;
}

export const useAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<AnalyticsReport[]>([]);
  const [currentData, setCurrentData] = useState<AnalyticsData | null>(null);

  const generateAnalyticsData = useCallback(async (
    startDate?: string,
    endDate?: string
  ) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_analytics_data', {
        start_date: startDate || undefined,
        end_date: endDate || undefined
      });

      if (error) throw error;

      const analyticsData: AnalyticsData = {
        total_users: parseInt(data.total_users || '0'),
        total_service_requests: parseInt(data.total_service_requests || '0'),
        total_freelancer_offers: parseInt(data.total_freelancer_offers || '0'),
        total_payments: parseInt(data.total_payments || '0'),
        ai_support_conversations: parseInt(data.ai_support_conversations || '0'),
        pending_verifications: parseInt(data.pending_verifications || '0'),
      };

      setCurrentData(analyticsData);
      return analyticsData;
    } catch (error) {
      console.error('Erro ao gerar dados de analytics:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar dados de analytics",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const saveReport = useCallback(async (
    reportType: AnalyticsReport['report_type'],
    dateFrom: string,
    dateTo: string,
    data: any
  ) => {
    try {
      const { data: report, error } = await supabase
        .from('analytics_reports')
        .insert({
          report_type: reportType,
          date_from: dateFrom,
          date_to: dateTo,
          data: data,
          generated_by: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [report, ...prev]);
      toast({
        title: "Sucesso",
        description: "Relatório salvo com sucesso",
      });

      return report;
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar relatório",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    reports,
    currentData,
    generateAnalyticsData,
    saveReport,
    loadReports,
  };
};
