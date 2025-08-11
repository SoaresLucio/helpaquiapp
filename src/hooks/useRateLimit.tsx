import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useRateLimit = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRateLimited, setIsRateLimited] = useState(false);

  const checkRateLimit = useCallback(async (
    actionType: string,
    maxRequests: number = 10,
    windowMinutes: number = 60
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_action_type: actionType,
        p_max_requests: maxRequests,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return true; // Be conservative - assume rate limited on error
      }

      const allowed = data as boolean;
      
      if (!allowed) {
        setIsRateLimited(true);
        toast({
          title: "Limite de Taxa Excedido",
          description: `Muitas tentativas de ${actionType}. Tente novamente em alguns minutos.`,
          variant: "destructive"
        });
        
        // Reset rate limit status after window
        setTimeout(() => setIsRateLimited(false), windowMinutes * 60 * 1000);
      }

      return !allowed;
    } catch (error) {
      console.error('Rate limit error:', error);
      return true; // Be conservative
    }
  }, [user?.id, toast]);

  return {
    checkRateLimit,
    isRateLimited
  };
};