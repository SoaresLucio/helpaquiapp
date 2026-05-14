
-- Storage bucket for chat attachments (images and documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Policies: any conversation participant can upload to their own folder; anyone authenticated can read (bucket is public)
DROP POLICY IF EXISTS "Chat attachments are publicly readable" ON storage.objects;
CREATE POLICY "Chat attachments are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');

DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own chat attachments" ON storage.objects;
CREATE POLICY "Users can delete own chat attachments"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RPC: update chat budget_proposal status (allowed for either conversation participant)
CREATE OR REPLACE FUNCTION public.update_chat_proposal_status(p_message_id uuid, p_status text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_msg RECORD;
  v_conv RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF p_status NOT IN ('pending','accepted','rejected','paid') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  SELECT * INTO v_msg FROM public.chat_messages WHERE id = p_message_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Message not found'; END IF;

  SELECT * INTO v_conv FROM public.conversations WHERE id = v_msg.conversation_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conversation not found'; END IF;

  IF v_conv.client_id <> auth.uid() AND v_conv.freelancer_id <> auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  IF COALESCE(v_msg.metadata->>'kind','') <> 'budget_proposal' THEN
    RAISE EXCEPTION 'Not a budget proposal';
  END IF;

  UPDATE public.chat_messages
  SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('status', p_status, 'status_updated_at', now()),
      is_read = is_read
  WHERE id = p_message_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_chat_proposal_status(uuid, text) TO authenticated;
