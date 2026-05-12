
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PaymentMethod {
  id: string;
  method_type: string;
  card_last_four?: string;
  card_brand?: string;
  is_default: boolean;
  is_active: boolean;
}

interface NewPaymentMethod {
  type: 'card' | 'pix';
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  pixKey: string;
  pixType: string;
}

export const usePaymentMethods = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPaymentMethods = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false });

      if (error) {
        console.error('Error loading payment methods:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os métodos de pagamento.",
          variant: "destructive"
        });
      } else {
        setPaymentMethods(data || []);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  // PCI: never collect card data in the app. Cards are saved by the Asaas webhook
  // after a successful hosted checkout. This stub remains for backwards compatibility.
  const addPaymentMethod = async (_newMethod?: NewPaymentMethod) => {
    toast({
      title: "Use o checkout seguro",
      description: "Os métodos de pagamento são salvos automaticamente após o pagamento via Asaas.",
    });
    return false;
  };


  const removeMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(methods => methods.filter(m => m.id !== id));
      
      toast({
        title: "Método removido",
        description: "Método de pagamento removido com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  const setDefaultMethod = async (id: string) => {
    try {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user?.id);

      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      setPaymentMethods(methods => 
        methods.map(m => ({ ...m, is_default: m.id === id }))
      );
      
      toast({
        title: "Método padrão alterado",
        description: "Método de pagamento padrão alterado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o método padrão.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, [user, toast]);

  return {
    paymentMethods,
    loading,
    addPaymentMethod,
    removeMethod,
    setDefaultMethod
  };
};
