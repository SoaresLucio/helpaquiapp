
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  stripe_price_id: string | null;
  features: string[];
  max_requests_per_month: number | null;
  priority_support: boolean | null;
  user_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string | null;
  plan_id: string | null;
  stripe_subscription_id: string | null;
  status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  requests_used_this_month: number | null;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan;
}

// Helper function to convert Json to string array
const convertFeaturesToStringArray = (features: Json): string[] => {
  if (Array.isArray(features)) {
    return features.filter((item): item is string => typeof item === 'string');
  }
  return [];
};

// Get all available subscription plans, optionally filtered by user type
export const getSubscriptionPlans = async (userType?: 'solicitante' | 'freelancer' | 'empresa'): Promise<SubscriptionPlan[]> => {
  try {
    let query = supabase
      .from('subscription_plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (userType) {
      query = query.eq('user_type', userType);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // Convert the data to match our interface
    return (data || []).map(plan => ({
      ...plan,
      features: convertFeaturesToStringArray(plan.features)
    }));
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
};

// Get user's current subscription
export const getCurrentSubscription = async (): Promise<UserSubscription | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userData.user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    
    if (!data) return null;

    // Convert the nested subscription_plans features
    if (data.subscription_plans) {
      data.subscription_plans.features = convertFeaturesToStringArray(data.subscription_plans.features);
    }
    
    return data as UserSubscription;
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return null;
  }
};

// Check if user can make a new request
export const checkRequestLimit = async (): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      return false;
    }

    const { data, error } = await supabase.rpc('check_request_limit', {
      p_user_id: userData.user.id
    });

    if (error) throw error;
    
    return data || false;
  } catch (error) {
    console.error('Error checking request limit:', error);
    return false;
  }
};

// Subscribe to a free plan via edge function (server-side only writes to subscriptions)
export const subscribeToPlan = async (planId: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase.functions.invoke('activate-free-plan', {
      body: { planId }
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    return false;
  }
};

// Cancel subscription
export const cancelSubscription = async (): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userData.user.id)
      .eq('status', 'active');

    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return false;
  }
};
