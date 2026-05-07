-- Remove sensitive private tables from the Supabase Realtime publication
-- to prevent potential data exposure through realtime broadcasts

ALTER PUBLICATION supabase_realtime DROP TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime DROP TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime DROP TABLE public.ai_support_conversations;
ALTER PUBLICATION supabase_realtime DROP TABLE public.ai_support_messages;