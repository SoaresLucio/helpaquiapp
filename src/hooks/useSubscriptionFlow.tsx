
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  createSubscription, 
  createPixPayment, 
  getUserSubscriptions, 
  updatePixPaymentStatus,
  type UserSubscriptionFlow,
  type PixPayment,
  type SubscriptionPlan 
} from '@/services/subscriptionFlowService';

export const useSubscriptionFlow = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscriptionFlow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPixPayment, setCurrentPixPayment] = useState<PixPayment | null>(null);

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await getUserSubscriptions();
      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error('Error loading subscriptions:', error);
      toast.error('Erro ao carregar assinaturas');
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const subscribe = async (
    plan: SubscriptionPlan,
    paymentMethod: 'pix' | 'credit_card' | 'debit_card'
  ) => {
    setLoading(true);
    try {
      const { data: subscription, error } = await createSubscription(
        plan.name,
        plan.price,
        paymentMethod
      );

      if (error) throw error;

      if (paymentMethod === 'pix' && subscription) {
        const { data: pixPayment, error: pixError } = await createPixPayment(
          subscription.id,
          plan.price
        );

        if (pixError) throw pixError;
        setCurrentPixPayment(pixPayment);
      }

      await loadSubscriptions();
      toast.success('Assinatura criada com sucesso!');
      
      return { subscription, pixPayment: currentPixPayment };
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error(error.message || 'Erro ao criar assinatura');
      return { subscription: null, pixPayment: null };
    } finally {
      setLoading(false);
    }
  };

  const confirmPixPayment = async (paymentId: string) => {
    try {
      const { data, error } = await updatePixPaymentStatus(paymentId, 'paid');
      if (error) throw error;
      
      setCurrentPixPayment(data);
      await loadSubscriptions();
      toast.success('Pagamento confirmado!');
      
      return data;
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast.error('Erro ao confirmar pagamento');
      return null;
    }
  };

  const hasActiveSubscription = () => {
    return subscriptions.some(sub => sub.status === 'active');
  };

  const getActiveSubscription = () => {
    return subscriptions.find(sub => sub.status === 'active') || null;
  };

  return {
    subscriptions,
    loading,
    currentPixPayment,
    subscribe,
    confirmPixPayment,
    loadSubscriptions,
    hasActiveSubscription,
    getActiveSubscription,
    setCurrentPixPayment
  };
};
