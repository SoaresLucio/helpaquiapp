import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSecurity from './ChatSecurity';
import BudgetProposalDialog from './BudgetProposalDialog';
import { useRealTimeChat } from '@/hooks/useRealTimeChat';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

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
    location: { address: string; lat: number; lng: number };
    isOnline: boolean;
  };
  userType: string | null;
  onUpdateUnreadCount: (conversationId: string, count: number) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, userType, onUpdateUnreadCount }) => {
  const { messages, loading, sendMessage, markAsRead, userId } = useRealTimeChat(conversation.id);
  const [blockedContent, setBlockedContent] = useState<string[]>([]);
  const [proposalOpen, setProposalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const formattedMessages = messages.map(msg => {
    const base = {
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender_id === userId ? 'Você' : conversation.participantName,
      content: msg.content,
      timestamp: new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: msg.is_read,
      pending: !!msg._optimistic,
      failed: !!msg._failed,
      metadata: msg.metadata,
    };
    if (msg.message_type === 'schedule_suggestion') {
      // Could be either a real schedule or our budget_proposal (kind in metadata)
      if (msg.metadata?.kind === 'budget_proposal') {
        return { ...base, type: 'budget_proposal' as const, proposalData: msg.metadata };
      }
      return {
        ...base, type: 'schedule_suggestion' as const,
        scheduleData: msg.metadata as any || { date: '', time: '', message: msg.content, confirmed: false },
      };
    }
    if (msg.message_type === 'file') {
      return {
        ...base, type: 'file' as const,
        fileData: msg.metadata as any || { name: 'arquivo', size: '0kb', type: 'document' as const, url: '' },
      };
    }
    return { ...base, type: 'text' as const };
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    markAsRead(conversation.id);
    onUpdateUnreadCount(conversation.id, 0);
    scrollToBottom();
  }, [conversation.id, onUpdateUnreadCount, markAsRead, scrollToBottom]);

  useEffect(() => { scrollToBottom(); }, [messages.length, scrollToBottom]);

  const handleSendMessage = (content: string, type: 'text' | 'file' | 'schedule_suggestion' = 'text', additionalData?: any): boolean => {
    const securityCheck = ChatSecurity.checkMessage(content);
    if (!securityCheck.isValid) {
      setBlockedContent(prev => [...prev, content]);
      return false;
    }
    let metadata: Record<string, any> = {};
    if (type === 'schedule_suggestion' && additionalData?.scheduleData) metadata = additionalData.scheduleData;
    if (type === 'file' && additionalData?.fileData) metadata = additionalData.fileData;
    sendMessage(conversation.id, content, type, metadata).catch(() => {});
    return true;
  };

  const handleSendBudgetProposal = (data: { title: string; description: string; valueCents: number; deliveryDays?: number }) => {
    const valueFmt = (data.valueCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const summary = `📋 Proposta de Orçamento — ${data.title} • ${valueFmt}`;
    sendMessage(conversation.id, summary, 'schedule_suggestion', {
      kind: 'budget_proposal',
      title: data.title,
      description: data.description,
      valueCents: data.valueCents,
      deliveryDays: data.deliveryDays,
      proposedBy: userId,
      status: 'pending',
    }).catch(() => toast.error('Não foi possível enviar a proposta'));
    setProposalOpen(false);
  };

  const handleAcceptProposal = (msg: any) => {
    const data = msg.proposalData;
    if (!data) return;
    // Solicitante/empresa accepts → go to payment confirmation flow
    navigate('/hire/confirm', {
      state: {
        conversationId: conversation.id,
        freelancerId: conversation.participantType === 'freelancer'
          ? conversation.participantId
          : (data.proposedBy ?? conversation.participantId),
        freelancerName: conversation.participantName,
        defaultTitle: data.title,
        defaultDescription: data.description,
        defaultValue: (data.valueCents / 100).toFixed(2).replace('.', ','),
      },
    });
  };

  const handleRejectProposal = (msg: any) => {
    sendMessage(conversation.id, '❌ Proposta recusada. Vamos negociar outro valor?', 'text').catch(() => {});
  };

  const handleViewLocation = () => {
    const { lat, lng } = conversation.location;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  if (loading) {
    return (
      <Card className="h-full max-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center text-muted-foreground"><p>Carregando mensagens...</p></div>
      </Card>
    );
  }

  return (
    <Card className="h-full max-h-[calc(100vh-140px)] flex flex-col">
      <ChatHeader conversation={conversation} userType={userType} onViewLocation={handleViewLocation} />
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ChatMessages
          messages={formattedMessages as any}
          conversation={conversation}
          userType={userType}
          currentUserId={userId}
          onConfirmSchedule={() => {}}
          onAcceptProposal={handleAcceptProposal}
          onRejectProposal={handleRejectProposal}
          messagesEndRef={messagesEndRef}
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          onOpenBudgetProposal={() => setProposalOpen(true)}
          userType={userType}
          conversation={conversation}
        />
      </CardContent>
      {blockedContent.length > 0 && (
        <div className="p-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-xs text-destructive">Conteúdo bloqueado por motivos de segurança</p>
        </div>
      )}
      <BudgetProposalDialog
        open={proposalOpen}
        onOpenChange={setProposalOpen}
        onSubmit={handleSendBudgetProposal}
        defaultTitle={conversation.jobTitle && !['Conversa', 'Conversa direta'].includes(conversation.jobTitle) ? conversation.jobTitle : ''}
      />
    </Card>
  );
};

export default ChatWindow;
