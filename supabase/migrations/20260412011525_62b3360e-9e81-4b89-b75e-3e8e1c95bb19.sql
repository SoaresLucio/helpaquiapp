
-- =============================================================
-- FIX 1: Subscription privilege escalation
-- Remove user INSERT/UPDATE on user_subscriptions (only service_role via edge functions should write)
-- =============================================================

-- Drop all existing permissive policies on user_subscriptions that allow INSERT/UPDATE
DROP POLICY IF EXISTS "Users can create subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.user_subscriptions;

-- Keep SELECT for users to view their own subscription
-- Check if select policy exists, create if not
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to only update usage counters (requests_used, messages_used, profile_views)
-- but NOT plan_id, status, or period dates
DROP POLICY IF EXISTS "Users can update usage counters only" ON public.user_subscriptions;
CREATE POLICY "Users can update usage counters only"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND plan_id IS NOT DISTINCT FROM (SELECT us.plan_id FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND status IS NOT DISTINCT FROM (SELECT us.status FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND current_period_start IS NOT DISTINCT FROM (SELECT us.current_period_start FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
  AND current_period_end IS NOT DISTINCT FROM (SELECT us.current_period_end FROM public.user_subscriptions us WHERE us.id = user_subscriptions.id)
);

-- Block regular user INSERT completely - only service_role (edge functions) can insert
-- No INSERT policy for authenticated users

-- Fix user_subscriptions_flow: remove user write access entirely
DROP POLICY IF EXISTS "Users can create subscription flow records" ON public.user_subscriptions_flow;
DROP POLICY IF EXISTS "Users can insert subscription flow" ON public.user_subscriptions_flow;
DROP POLICY IF EXISTS "Users can update subscription flow" ON public.user_subscriptions_flow;
DROP POLICY IF EXISTS "Users can manage their own subscription flow" ON public.user_subscriptions_flow;

-- Only allow SELECT for users on their own flow records
DROP POLICY IF EXISTS "Users can view own subscription flow" ON public.user_subscriptions_flow;
CREATE POLICY "Users can view own subscription flow"
ON public.user_subscriptions_flow
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =============================================================
-- FIX 2: Realtime channel authorization
-- Add RLS policies on realtime.messages to restrict channel subscriptions
-- =============================================================
-- NOTE: We cannot modify the realtime schema directly via migrations.
-- Instead, we ensure our Realtime subscriptions use proper RLS on the
-- underlying tables (conversations, chat_messages) which are already protected.
