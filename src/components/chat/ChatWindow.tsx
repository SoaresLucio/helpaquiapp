import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSecurity from './ChatSecurity';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';

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

// Define proper message types
interface BaseMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface TextMessage extends BaseMessage {
  type: 'text';
}

interface ScheduleMessage extends BaseMessage {
  type: 'schedule_suggestion';
  scheduleData: {
    date: string;
    time: string;
    message: string;
    confirmed?: boolean;
  };
}

interface FileMessage extends BaseMessage {
  type: 'file';
  fileData: {
    name: string;
    size: string;
    type: 'image' | 'document';
    url: string;
  };
}

type Message = TextMessage | ScheduleMessage | FileMessage;

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  userType,
  onUpdateUnreadCount
}) => {
  const { messages, loading, sendMessage, markAsRead } = useRealTimeChat(conversation.id);
  const [blockedContent, setBlockedContent] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Convert real chat messages to the expected format
  const formattedMessages: Message[] = messages.map(msg => {
    const baseMessage = {
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender_id === 'me' ? 'Você' : conversation.participantName,
      content: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: msg.is_read,
    };

    if (msg.message_type === 'schedule_suggestion') {
      return {
        ...baseMessage,
        type: 'schedule_suggestion' as const,
        scheduleData: msg.metadata as any || {
          date: '',
          time: '',
          message: msg.content,
          confirmed: false
        }
      };
    } else if (msg.message_type === 'file') {
      return {
        ...baseMessage,
        type: 'file' as const,
        fileData: msg.metadata as any || {
          name: 'arquivo',
          size: '0kb',
          type: 'document' as const,
          url: ''
        }
      };
    } else {
      return {
        ...baseMessage,
        type: 'text' as const
      };
    }
  });

  useEffect(() => {
    // Mark messages as read when the chat is opened
    markAsRead(conversation.id);
    onUpdateUnreadCount(conversation.id, 0);
    scrollToBottom();
  }, [conversation.id, onUpdateUnreadCount, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [formattedMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (content: string, type: 'text' | 'file' | 'schedule_suggestion' = 'text', additionalData?: any): boolean => {
    // Check security before sending
    const securityCheck = ChatSecurity.checkMessage(content);
    if (!securityCheck.isValid) {
      setBlockedContent(prev => [...prev, content]);
      return false;
    }

    // Send message asynchronously but return true immediately for UI feedback
    const sendAsync = async () => {
      try {
        let metadata = {};
        if (type === 'schedule_suggestion' && additionalData?.scheduleData) {
          metadata = additionalData.scheduleData;
        } else if (type === 'file' && additionalData?.fileData) {
          metadata = additionalData.fileData;
        }

        await sendMessage(conversation.id, content, type, metadata);
        } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error sending message:', error);
        }
      }
    };
    
    sendAsync();
    return true;
  };

    const handleConfirmSchedule = (messageId: string) => {
    // This would be handled by the backend in a real implementation
    if (process.env.NODE_ENV === 'development') {
    }
  };

  const handleViewLocation = () => {
    // Open map with location
    const { lat, lng } = conversation.location;
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <Card className="h-full max-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>Carregando mensagens...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full max-h-[calc(100vh-140px)] flex flex-col">
      <ChatHeader 
        conversation={conversation}
        userType={userType}
        onViewLocation={handleViewLocation}
      />
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ChatMessages 
          messages={formattedMessages}
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
