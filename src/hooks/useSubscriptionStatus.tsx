
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCurrentSubscription } from '@/services/subscriptionService';

export const useSubscriptionStatus = () => {
  const { user, userType } = useAuth();
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const subscription = await getCurrentSubscription();
        setHasActiveSubscription(!!subscription && subscription.status === 'active');
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasActiveSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  return {
    hasActiveSubscription,
    loading,
    userType
  };
};
