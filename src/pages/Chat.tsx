import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ConversationData {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantType: 'freelancer' | 'client';
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: string;
  jobTitle: string;
  jobCategory: string;
  jobStatus: string;
  agreedValue: number;
  location: { address: string; lat: number; lng: number };
  isOnline: boolean;
}

const Chat = () => {
  const { user, userType } = useAuth();
  const location = useLocation();
  const { conversations, loading } = useRealTimeChat();
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [realConversations, setRealConversations] = useState<ConversationData[]>([]);
  const [enriching, setEnriching] = useState(false);

  // Determine other participant id from current user
  const myId = user?.id ?? null;

  // Build base list with the correct "other" participant id, then enrich with profile + service_request data
  useEffect(() => {
    let cancelled = false;
    const enrich = async () => {
      if (!myId || conversations.length === 0) {
        setRealConversations([]);
        return;
      }
      setEnriching(true);

      // Determine participant ids and gather request ids
      const base = conversations.map((conv) => {
        const isClient = conv.client_id === myId;
        const participantId = isClient ? conv.freelancer_id : conv.client_id;
        const participantType: 'freelancer' | 'client' = isClient ? 'freelancer' : 'client';
        return { conv, participantId, participantType };
      });

      const participantIds = Array.from(new Set(base.map(b => b.participantId).filter(Boolean)));
      const requestIds = Array.from(new Set(
        base.map(b => (b.conv as any).service_request_id).filter(Boolean)
      ));

      // Fetch profiles in parallel via the public RPC (respects privacy)
      const profilePromises = participantIds.map(id =>
        supabase.rpc('get_public_profile', { p_user_id: id }).then(r => ({ id, data: r.data?.[0] ?? null }))
      );
      const requestsPromise = requestIds.length
        ? supabase
            .from('service_requests')
            .select('id, title, category, status, budget_max, location_address')
            .in('id', requestIds as string[])
        : Promise.resolve({ data: [] as any[] });

      // Fetch last message per conversation in parallel
      const lastMsgPromises = base.map(({ conv }) =>
        supabase
          .from('chat_messages')
          .select('content, created_at, sender_id, message_type')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          .then(r => ({ id: conv.id, msg: r.data }))
      );
      const unreadPromises = base.map(({ conv }) =>
        supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', myId)
          .then(r => ({ id: conv.id, count: r.count ?? 0 }))
      );

      const [profileResults, requestsRes, lastMsgs, unreads] = await Promise.all([
        Promise.all(profilePromises),
        requestsPromise,
        Promise.all(lastMsgPromises),
        Promise.all(unreadPromises),
      ]);

      if (cancelled) return;

      const profileMap = new Map<string, any>();
      profileResults.forEach(p => profileMap.set(p.id, p.data));
      const requestMap = new Map<string, any>();
      (requestsRes.data || []).forEach((r: any) => requestMap.set(r.id, r));
      const lastMsgMap = new Map<string, any>();
      lastMsgs.forEach(m => lastMsgMap.set(m.id, m.msg));
      const unreadMap = new Map<string, number>();
      unreads.forEach(u => unreadMap.set(u.id, u.count));

      const mapped: ConversationData[] = base.map(({ conv, participantId, participantType }) => {
        const profile = profileMap.get(participantId);
        const fullName = profile
          ? [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'Usuário'
          : 'Usuário';
        const avatar = profile?.avatar_url || '/placeholder.svg';
        const sr = (conv as any).service_request_id ? requestMap.get((conv as any).service_request_id) : null;
        const lastMsg = lastMsgMap.get(conv.id);
        const lastContent = lastMsg
          ? (lastMsg.message_type === 'file'
              ? '📎 Arquivo'
              : lastMsg.message_type === 'schedule_suggestion'
                ? '📋 Proposta enviada'
                : (lastMsg.content || '').slice(0, 80))
          : 'Conversa iniciada';

        return {
          id: conv.id,
          participantId,
          participantName: fullName,
          participantAvatar: avatar,
          participantType,
          lastMessage: lastContent,
          timestamp: new Date(lastMsg?.created_at || conv.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          unreadCount: unreadMap.get(conv.id) || 0,
          status: conv.status,
          jobTitle: sr?.title || 'Conversa direta',
          jobCategory: sr?.category || 'Geral',
          jobStatus: sr?.status || conv.status,
          agreedValue: sr?.budget_max || 0,
          location: { address: sr?.location_address || 'Local não especificado', lat: 0, lng: 0 },
          isOnline: false,
        };
      });

      setRealConversations(mapped);
      setEnriching(false);
    };
    enrich();
    return () => { cancelled = true; };
  }, [conversations, myId]);

  // Auto-select conversation from navigation state, or first conversation
  useEffect(() => {
    if (realConversations.length === 0) return;
    const targetId = location.state?.conversationId;
    if (targetId) {
      const found = realConversations.find(c => c.id === targetId);
      if (found) { setSelectedConversation(found); return; }
    }
    setSelectedConversation(prev => {
      if (prev) {
        const refreshed = realConversations.find(c => c.id === prev.id);
        return refreshed || prev;
      }
      return realConversations[0];
    });
  }, [realConversations, location.state]);

  const updateConversationUnreadCount = (conversationId: string, count: number) => {
    setRealConversations(prev => prev.map(conv => conv.id === conversationId ? { ...conv, unreadCount: count } : conv));
  };

  const isLoading = loading || enriching;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex-1 container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px] max-h-[calc(100vh-140px)]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-1">
            <ChatSidebar conversations={realConversations} selectedConversation={selectedConversation as any} onSelectConversation={setSelectedConversation} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-3">
            {selectedConversation ? (
              <ChatWindow conversation={selectedConversation} userType={userType} onUpdateUnreadCount={updateConversationUnreadCount} />
            ) : (
              <Card className="h-full flex items-center justify-center rounded-2xl border-border/50 shadow-sm">
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-medium">
                    {isLoading ? 'Carregando conversas...' : 'Selecione uma conversa para começar'}
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

export default Chat;
