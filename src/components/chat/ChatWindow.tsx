
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSecurity from './ChatSecurity';

interface ChatWindowProps {
  conversation: {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar: string;
    participantType: 'freelancer' | 'client';
    jobTitle: string;
    jobCategory: string;
    jobStatus: string;
    agreedValue: number;
    location: {
      address: string;
      lat: number;
      lng: number;
    };
    isOnline: boolean;
  };
  userType: string | null;
  onUpdateUnreadCount: (conversationId: string, count: number) => void;
}

// Mock messages com diferentes tipos
const mockMessages = [
  {
    id: '1',
    senderId: 'user_123',
    senderName: 'João Silva',
    content: 'Olá! Vi seu interesse no projeto de desenvolvimento.',
    timestamp: '10:25',
    type: 'text',
    read: true
  },
  {
    id: '2',
    senderId: 'me',
    senderName: 'Você',
    content: 'Oi! Sim, tenho muito interesse. Qual seria o valor?',
    timestamp: '10:27',
    type: 'text',
    read: true
  },
  {
    id: '3',
    senderId: 'user_123',
    senderName: 'João Silva',
    content: 'Para um projeto desse escopo, estou pensando em R$ 2.500',
    timestamp: '10:28',
    type: 'text',
    read: true
  },
  {
    id: '4',
    senderId: 'user_123',
    senderName: 'João Silva',
    content: '',
    timestamp: '10:29',
    type: 'schedule_suggestion',
    scheduleData: {
      date: '2024-06-15',
      time: '14:00',
      message: 'Que tal começarmos na sexta-feira às 14h?'
    },
    read: true
  },
  {
    id: '5',
    senderId: 'me',
    senderName: 'Você',
    content: 'Ótimo! Quando podemos começar o projeto?',
    timestamp: '10:30',
    type: 'text',
    read: false
  }
];

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  userType,
  onUpdateUnreadCount
}) => {
  const [messages, setMessages] = useState(mockMessages);
  const [blockedContent, setBlockedContent] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Marcar mensagens como lidas quando o chat é aberto
    onUpdateUnreadCount(conversation.id, 0);
    scrollToBottom();
  }, [conversation.id, onUpdateUnreadCount]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string, type: 'text' | 'file' | 'schedule_suggestion' = 'text', additionalData?: any) => {
    // Verificar segurança antes de enviar
    const securityCheck = ChatSecurity.checkMessage(content);
    if (!securityCheck.isValid) {
      setBlockedContent(prev => [...prev, content]);
      return false;
    }

    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      senderName: 'Você',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
      ...additionalData
    };

    setMessages(prev => [...prev, newMessage]);
    return true;
  };

  const handleConfirmSchedule = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, scheduleData: { ...msg.scheduleData, confirmed: true } }
          : msg
      )
    );
  };

  const handleViewLocation = () => {
    // Abrir mapa com a localização
    const { lat, lng } = conversation.location;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader 
        conversation={conversation}
        userType={userType}
        onViewLocation={handleViewLocation}
      />
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ChatMessages 
          messages={messages}
          conversation={conversation}
          userType={userType}
          onConfirmSchedule={handleConfirmSchedule}
          messagesEndRef={messagesEndRef}
        />
        
        <ChatInput 
          onSendMessage={handleSendMessage}
          userType={userType}
          conversation={conversation}
        />
      </CardContent>
      
      {blockedContent.length > 0 && (
        <div className="p-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600">
            Conteúdo bloqueado por motivos de segurança
          </p>
        </div>
      )}
    </Card>
  );
};

export default ChatWindow;
