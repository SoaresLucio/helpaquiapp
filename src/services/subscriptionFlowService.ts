
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // em dias
  features: string[];
  popular?: boolean;
}

export interface UserSubscriptionFlow {
  id: string;
  user_id: string;
  plan_name: string;
  plan_price: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  payment_reference?: string;
  payment_method?: 'pix' | 'credit_card' | 'debit_card';
  created_at: string;
  updated_at: string;
}

export interface PixPayment {
  id: string;
  user_id: string;
  subscription_id?: string;
  pix_code: string;
  qr_code_url?: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
  expires_at: string;
  created_at: string;
}

// Planos disponíveis
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 29.90,
    duration: 30,
    features: [
      'Até 5 solicitações por mês',
      'Acesso a profissionais verificados',
      'Suporte por chat',
      'Histórico de serviços'
    ]
  },
  {
    id: 'premium',
    name: 'Plano Premium',
    price: 49.90,
    duration: 30,
    features: [
      'Solicitações ilimitadas',
      'Prioridade nas solicitações',
      'Suporte prioritário 24/7',
      'Histórico completo',
      'Relatórios mensais'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Plano Empresarial',
    price: 99.90,
    duration: 30,
    features: [
      'Todas as funcionalidades Premium',
      'Múltiplos usuários',
      'API personalizada',
      'Suporte dedicado',
      'Integração customizada'
    ]
  }
];

export const createSubscription = async (
  planName: string,
  planPrice: number,
  paymentMethod: 'pix' | 'credit_card' | 'debit_card',
  paymentReference?: string
): Promise<{ data: UserSubscriptionFlow | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      throw new Error('Usuário não autenticado');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 30); // 30 dias de assinatura

    const { data, error } = await supabase
      .from('user_subscriptions_flow')
      .insert({
        user_id: user.user.id,
        plan_name: planName,
        plan_price: planPrice,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        status: 'active'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { data: null, error };
  }
};

export const createPixPayment = async (
  subscriptionId: string,
  amount: number
): Promise<{ data: PixPayment | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      throw new Error('Usuário não autenticado');
    }

    // Simular geração do código PIX (em produção, seria integrado com API do banco)
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${Math.random().toString(36).substring(2, 15)}52040000530398654${amount.toFixed(2).replace('.', '')}5802BR5909HELPAQUI6008BRASILIA62070503***6304`;
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // PIX expira em 30 minutos

    const { data, error } = await supabase
      .from('pix_payments')
      .insert({
        user_id: user.user.id,
        subscription_id: subscriptionId,
        pix_code: pixCode,
        amount: amount,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error creating PIX payment:', error);
    return { data: null, error };
  }
};

export const getUserSubscriptions = async (): Promise<{ data: UserSubscriptionFlow[] | null; error: any }> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('user_subscriptions_flow')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { data: null, error };
  }
};

export const getPixPayment = async (paymentId: string): Promise<{ data: PixPayment | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('pix_payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching PIX payment:', error);
    return { data: null, error };
  }
};

export const updatePixPaymentStatus = async (
  paymentId: string, 
  status: 'pending' | 'paid' | 'expired'
): Promise<{ data: PixPayment | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('pix_payments')
      .update({ status })
      .eq('id', paymentId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error updating PIX payment status:', error);
    return { data: null, error };
  }
};
