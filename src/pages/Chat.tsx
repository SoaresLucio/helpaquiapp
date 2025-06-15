
import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

// Interface para conversas compatível com ambos os componentes
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
  agreedValue: number; // em centavos
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  isOnline: boolean;
}

// Mock data para conversas com mais detalhes
const mockConversations: ConversationData[] = [
  {
    id: '1',
    participantId: 'user_123',
    participantName: 'João Silva',
    participantAvatar: '/placeholder.svg',
    participantType: 'freelancer',
    lastMessage: 'Ótimo! Quando podemos começar o projeto?',
    timestamp: '10:30',
    unreadCount: 2,
    status: 'negociando',
    jobTitle: 'Desenvolvimento de Website',
    jobCategory: 'Tecnologia',
    jobStatus: 'aguardando_inicio',
    agreedValue: 250000,
    location: {
      address: 'Rua das Flores, 123 - Centro',
      lat: -23.5505,
      lng: -46.6333
    },
    isOnline: true
  },
  {
    id: '2',
    participantId: 'user_456',
    participantName: 'Maria Santos',
    participantAvatar: '/placeholder.svg',
    participantType: 'client',
    lastMessage: 'O valor está dentro do orçamento, vamos fechar!',
    timestamp: 'Ontem',
    unreadCount: 0,
    status: 'acordado',
    jobTitle: 'Design de Logo',
    jobCategory: 'Design',
    jobStatus: 'em_andamento',
    agreedValue: 150000,
    location: {
      address: 'Av. Paulista, 1000 - Bela Vista',
      lat: -23.5614,
      lng: -46.6558
    },
    isOnline: false
  },
  {
    id: '3',
    participantId: 'user_789',
    participantName: 'Pedro Costa',
    participantAvatar: '/placeholder.svg',
    participantType: 'freelancer',
    lastMessage: 'Preciso de mais detalhes sobre o prazo...',
    timestamp: '15:45',
    unreadCount: 1,
    status: 'negociando',
    jobTitle: 'Consultoria em Marketing',
    jobCategory: 'Marketing',
    jobStatus: 'aguardando_inicio',
    agreedValue: 300000,
    location: {
      address: 'Rua Augusta, 500 - Consolação',
      lat: -23.5558,
      lng: -46.6396
    },
    isOnline: true
  }
];

const Chat = () => {
  const { userType } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<ConversationData>(mockConversations[0]);
  const [conversations, setConversations] = useState<ConversationData[]>(mockConversations);

  const updateConversationUnreadCount = (conversationId: string, count: number) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: count }
          : conv
      )
    );
  };

  const handleSelectConversation = (conversation: ConversationData) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-[600px] max-h-[calc(100vh-140px)]">
          {/* Sidebar com lista de conversas */}
          <div className="lg:col-span-1">
            <ChatSidebar 
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
            />
          </div>

          {/* Janela de chat principal */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <ChatWindow 
                conversation={selectedConversation}
                userType={userType}
                onUpdateUnreadCount={updateConversationUnreadCount}
              />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>Selecione uma conversa para começar</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
