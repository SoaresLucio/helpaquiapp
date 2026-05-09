
-- 1) Remove direct RLS access to bank_details; force usage of SECURITY DEFINER RPCs
DROP POLICY IF EXISTS "Users manage own bank details" ON public.bank_details;

-- Add an explicit deny-all policy for end users (RPCs run as SECURITY DEFINER and bypass)
CREATE POLICY "Deny direct bank_details access"
ON public.bank_details
AS RESTRICTIVE
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- 2) Restrict Realtime channel subscriptions
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can receive own conversation broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can receive own conversation broadcasts"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  (realtime.topic() LIKE 'messages-%' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = replace(realtime.topic(), 'messages-', '')
      AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
  ))
  OR (realtime.topic() = 'conversations')
);

DROP POLICY IF EXISTS "Authenticated users can send own conversation broadcasts" ON realtime.messages;
CREATE POLICY "Authenticated users can send own conversation broadcasts"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (realtime.topic() LIKE 'messages-%' AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id::text = replace(realtime.topic(), 'messages-', '')
      AND (c.client_id = auth.uid() OR c.freelancer_id = auth.uid())
  ))
  OR (realtime.topic() = 'conversations')
);
