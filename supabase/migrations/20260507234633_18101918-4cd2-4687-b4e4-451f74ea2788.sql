-- Fix security finding: user_subscriptions_counter_bypass
-- Prevent users from resetting their own usage counters to bypass subscription limits

-- Drop the existing UPDATE policy and recreate it with counter column protection
DROP POLICY IF EXISTS "Users can update usage counters only" ON public.user_subscriptions;

CREATE POLICY "Users can update usage counters only" 
ON public.user_subscriptions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND NOT plan_id IS DISTINCT FROM (SELECT us.plan_id FROM user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND NOT status IS DISTINCT FROM (SELECT us.status FROM user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND NOT current_period_start IS DISTINCT FROM (SELECT us.current_period_start FROM user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND NOT current_period_end IS DISTINCT FROM (SELECT us.current_period_end FROM user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND NOT messages_used_this_month IS DISTINCT FROM (SELECT us.messages_used_this_month FROM user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND NOT requests_used_this_month IS DISTINCT FROM (SELECT us.requests_used_this_month FROM user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND NOT profile_views_this_month IS DISTINCT FROM (SELECT us.profile_views_this_month FROM user_subscriptions us WHERE us.id = user_subscriptions.id)
);

-- Fix security finding: realtime_messages_no_rls
-- Remove private user data tables from the Supabase Realtime publication
-- to prevent potential unauthorized channel subscriptions

ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
ALTER PUBLICATION supabase_realtime DROP TABLE public.service_requests;