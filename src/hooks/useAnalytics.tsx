
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
      // Since the function doesn't exist, we'll manually query the tables
      const [
        usersResult,
        serviceRequestsResult,
        freelancerOffersResult,
        paymentsResult,
        conversationsResult,
        verificationsResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('service_requests').select('id', { count: 'exact', head: true }),
        supabase.from('freelancer_service_offers').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('id', { count: 'exact', head: true }),
        supabase.from('ai_support_conversations').select('id', { count: 'exact', head: true }),
        supabase.from('profile_verifications').select('id').eq('status', 'pending')
      ]);

      const analyticsData: AnalyticsData = {
        total_users: usersResult.count || 0,
        total_service_requests: serviceRequestsResult.count || 0,
        total_freelancer_offers: freelancerOffersResult.count || 0,
        total_payments: paymentsResult.count || 0,
        ai_support_conversations: conversationsResult.count || 0,
        pending_verifications: verificationsResult.data?.length || 0,
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
      // Since the table doesn't exist, we'll store it in notes for now
      const { data: report, error } = await supabase
        .from('notes')
        .insert({
          title: `Analytics Report - ${reportType}`,
          content: JSON.stringify({
            report_type: reportType,
            date_from: dateFrom,
            date_to: dateTo,
            data: data,
            generated_by: (await supabase.auth.getUser()).data.user?.id || ''
          }),
          user_id: (await supabase.auth.getUser()).data.user?.id || ''
        })
        .select()
        .single();

      if (error) throw error;

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
      // Load reports from notes for now
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .like('title', 'Analytics Report%')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform notes into reports format
      const transformedReports: AnalyticsReport[] = (data || []).map(note => {
        try {
          const reportData = JSON.parse(note.content || '{}');
          return {
            id: note.id,
            report_type: reportData.report_type || 'custom',
            date_from: reportData.date_from || note.created_at,
            date_to: reportData.date_to || note.created_at,
            data: reportData.data || {},
            generated_by: reportData.generated_by || '',
            created_at: note.created_at,
          };
        } catch {
          return {
            id: note.id,
            report_type: 'custom' as const,
            date_from: note.created_at,
            date_to: note.created_at,
            data: {},
            generated_by: '',
            created_at: note.created_at,
          };
        }
      });

      setReports(transformedReports);
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
