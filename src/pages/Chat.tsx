
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
  location: { address: string; lat: number; lng: number; };
  isOnline: boolean;
}

const Chat = () => {
  const { userType } = useAuth();
  const location = useLocation();
  const { conversations, loading } = useRealTimeChat();
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  const [realConversations, setRealConversations] = useState<ConversationData[]>([]);

  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const targetConversation = conversations.find(c => c.id === location.state.conversationId);
      if (targetConversation) {
        const mappedConversation: ConversationData = {
          id: targetConversation.id,
          participantId: targetConversation.freelancer_id || targetConversation.client_id,
          participantName: location.state.freelancerName || 'Usuário',
          participantAvatar: '/placeholder.svg',
          participantType: userType === 'freelancer' ? 'client' : 'freelancer',
          lastMessage: 'Conversa iniciada',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          unreadCount: 0, status: 'ativo', jobTitle: 'Conversa direta', jobCategory: 'Geral', jobStatus: 'ativo', agreedValue: 0,
          location: { address: 'Local não especificado', lat: 0, lng: 0 }, isOnline: true
        };
        setSelectedConversation(mappedConversation);
      }
    }
  }, [location.state, conversations, userType]);

  useEffect(() => {
    if (conversations.length > 0) {
      const mapped = conversations.map(conv => ({
        id: conv.id,
        participantId: conv.freelancer_id || conv.client_id,
        participantName: 'Usuário',
        participantAvatar: '/placeholder.svg',
        participantType: (userType === 'freelancer' ? 'client' : 'freelancer') as 'freelancer' | 'client',
        lastMessage: 'Conversa ativa',
        timestamp: new Date(conv.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        unreadCount: 0, status: conv.status, jobTitle: 'Conversa', jobCategory: 'Geral', jobStatus: conv.status, agreedValue: 0,
        location: { address: 'Local não especificado', lat: 0, lng: 0 }, isOnline: true
      }));
      setRealConversations(mapped);
      if (!selectedConversation && mapped.length > 0) setSelectedConversation(mapped[0]);
    }
  }, [conversations, userType, selectedConversation]);

  const updateConversationUnreadCount = (conversationId: string, count: number) => {
    setRealConversations(prev => prev.map(conv => conv.id === conversationId ? { ...conv, unreadCount: count } : conv));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="flex-1 container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px] max-h-[calc(100vh-140px)]">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-1">
            <ChatSidebar conversations={realConversations} selectedConversation={selectedConversation} onSelectConversation={setSelectedConversation} />
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
                  <p className="font-medium">{loading ? 'Carregando conversas...' : 'Selecione uma conversa para começar'}</p>
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
