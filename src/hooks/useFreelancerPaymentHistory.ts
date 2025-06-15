
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  service_title?: string;
}

export const useFreelancerPaymentHistory = (userId: string | null) => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPaymentHistory = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data: historyData, error: historyError } = await supabase
          .from('payments')
          .select('id, amount, status, created_at, service_title')
          .eq('freelancer_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyError) {
          console.error('Error loading payment history:', historyError);
        } else {
          setPaymentHistory(historyData || []);
        }
      } catch (error) {
        console.error('Error loading payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadPaymentHistory();
    }
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return {
    paymentHistory,
    loading,
    formatCurrency,
    formatDate
  };
};
