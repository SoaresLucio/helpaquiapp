import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, FileImage, Download, DollarSign, Loader2, AlertCircle, X } from 'lucide-react';

interface BaseMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  read: boolean;
  pending?: boolean;
  failed?: boolean;
}

interface TextMessage extends BaseMessage { type: 'text'; }
interface ScheduleMessage extends BaseMessage {
  type: 'schedule_suggestion';
  scheduleData: { date: string; time: string; message: string; confirmed?: boolean };
}
interface FileMessage extends BaseMessage {
  type: 'file';
  fileData: { name: string; size: string; type: 'image' | 'document'; url: string };
}
interface BudgetProposalMessage extends BaseMessage {
  type: 'budget_proposal';
  proposalData: {
    title: string; description?: string; valueCents: number;
    deliveryDays?: number; proposedBy?: string; status?: 'pending' | 'accepted' | 'rejected';
  };
}

type Message = TextMessage | ScheduleMessage | FileMessage | BudgetProposalMessage;

interface ChatMessagesProps {
  messages: Message[];
  conversation: any;
  userType: string | null;
  currentUserId?: string | null;
  onConfirmSchedule: (messageId: string) => void;
  onAcceptProposal?: (msg: BudgetProposalMessage) => void;
  onRejectProposal?: (msg: BudgetProposalMessage) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages, conversation, userType, currentUserId,
  onConfirmSchedule, onAcceptProposal, onRejectProposal, messagesEndRef,
}) => {
  const canHire = userType === 'solicitante' || userType === 'empresa' || userType === 'ambos';

  const renderMessage = (message: Message) => {
    const isOwnMessage = currentUserId ? message.senderId === currentUserId : false;

    return (
      <div key={message.id} className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] lg:max-w-md`}>
          <div
            className={`rounded-2xl px-4 py-2.5 shadow-sm ${
              isOwnMessage
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-muted text-foreground rounded-bl-sm'
            } ${message.failed ? 'ring-1 ring-destructive' : ''}`}
          >
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
            )}

            {message.type === 'schedule_suggestion' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 opacity-90">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium text-sm">Sugestão de Horário</span>
                </div>
                <p className="text-sm">{message.scheduleData.message}</p>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Clock className="h-3 w-3" />
                  <span>
                    {message.scheduleData.date && new Date(message.scheduleData.date).toLocaleDateString('pt-BR')} às {message.scheduleData.time}
                  </span>
                </div>
                {!isOwnMessage && !message.scheduleData.confirmed && (
                  <Button size="sm" className="w-full" onClick={() => onConfirmSchedule(message.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" /> Confirmar Horário
                  </Button>
                )}
              </div>
            )}

            {message.type === 'budget_proposal' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 opacity-90">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium text-sm">Proposta de Orçamento</span>
                </div>
                <p className="text-sm font-semibold">{message.proposalData.title}</p>
                {message.proposalData.description && (
                  <p className="text-xs opacity-90 whitespace-pre-wrap">{message.proposalData.description}</p>
                )}
                <div className="text-sm font-bold">{formatBRL(message.proposalData.valueCents)}</div>
                {message.proposalData.deliveryDays != null && (
                  <div className="text-xs opacity-90">Prazo: {message.proposalData.deliveryDays} dia(s)</div>
                )}
                {!isOwnMessage && canHire && message.proposalData.status !== 'accepted' && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => onAcceptProposal?.(message)}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Aceitar e pagar
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => onRejectProposal?.(message)}>
                      <X className="h-3 w-3 mr-1" /> Recusar
                    </Button>
                  </div>
                )}
                {isOwnMessage && (
                  <Badge variant="secondary" className="text-[10px]">Aguardando resposta</Badge>
                )}
              </div>
            )}

            {message.type === 'file' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 opacity-90">
                  <FileImage className="h-4 w-4" />
                  <span className="font-medium text-sm">Arquivo enviado</span>
                </div>
                <div className="p-2 rounded border border-border/50 bg-background/40">
                  <p className="text-sm font-medium">{message.fileData.name}</p>
                  <p className="text-xs opacity-75">{message.fileData.size}</p>
                  <Button size="sm" variant="outline" className="mt-2 w-full">
                    <Download className="h-3 w-3 mr-1" /> Baixar
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[10px] opacity-70">{message.timestamp}</span>
              {isOwnMessage && message.pending && <Loader2 className="w-3 h-3 animate-spin opacity-70" />}
              {isOwnMessage && message.failed && <AlertCircle className="w-3 h-3 text-destructive" />}
              {isOwnMessage && !message.pending && !message.failed && (
                <CheckCircle className="w-3 h-3 opacity-70" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-4 space-y-2">
        {conversation.agreedValue > 0 && (
          <div className="bg-card rounded-lg p-3 border-l-4 border-primary shadow-sm mb-2">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Resumo do Serviço</span>
            </div>
            <div className="space-y-0.5 text-xs text-muted-foreground">
              <p><strong>Serviço:</strong> {conversation.jobTitle}</p>
              <p><strong>Valor:</strong> {formatBRL(conversation.agreedValue)}</p>
              {conversation.location?.address && conversation.location.address !== 'Local não especificado' && (
                <p><strong>Local:</strong> {conversation.location.address}</p>
              )}
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8 text-sm">
            Inicie a conversa enviando uma mensagem ou uma proposta de orçamento.
          </div>
        )}
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
