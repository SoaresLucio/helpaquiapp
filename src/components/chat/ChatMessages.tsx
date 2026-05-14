import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar, Clock, CheckCircle, FileImage, Download, DollarSign, Loader2, AlertCircle, X, RefreshCw, FileText,
} from 'lucide-react';
import { calculatePlatformFee } from '@/services/asaasService';

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
  fileData: { name: string; size: string; type: 'image' | 'document'; url: string; mime?: string };
}
export interface BudgetProposalMessage extends BaseMessage {
  type: 'budget_proposal';
  proposalData: {
    title: string; description?: string; valueCents: number;
    deliveryDays?: number; proposedBy?: string;
    status?: 'pending' | 'accepted' | 'rejected' | 'paid';
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
  onCounterProposal?: (msg: BudgetProposalMessage) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const formatBRL = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((cents || 0) / 100);

const statusBadge = (status?: string) => {
  switch (status) {
    case 'accepted': return { label: 'Aceita', variant: 'default' as const, className: 'bg-emerald-600 hover:bg-emerald-600 text-white' };
    case 'rejected': return { label: 'Recusada', variant: 'destructive' as const, className: '' };
    case 'paid': return { label: 'Paga', variant: 'default' as const, className: 'bg-primary text-primary-foreground' };
    default: return { label: 'Pendente', variant: 'secondary' as const, className: '' };
  }
};

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages, conversation, userType, currentUserId,
  onConfirmSchedule, onAcceptProposal, onRejectProposal, onCounterProposal, messagesEndRef,
}) => {
  const canHire = userType === 'solicitante' || userType === 'empresa' || userType === 'ambos';

  const renderMessage = (message: Message) => {
    const isOwnMessage = currentUserId ? message.senderId === currentUserId : false;

    return (
      <div key={message.id} className={`mb-3 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[85%] lg:max-w-md">
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

            {message.type === 'budget_proposal' && (() => {
              const p = message.proposalData;
              const status = p.status || 'pending';
              const sb = statusBadge(status);
              const { fee } = calculatePlatformFee(p.valueCents);
              const isClosed = status === 'accepted' || status === 'paid' || status === 'rejected';
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 opacity-90">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium text-sm">Proposta de Orçamento</span>
                    </div>
                    <Badge variant={sb.variant} className={`text-[10px] ${sb.className}`}>{sb.label}</Badge>
                  </div>
                  <p className="text-sm font-semibold">{p.title}</p>
                  {p.description && (
                    <p className="text-xs opacity-90 whitespace-pre-wrap">{p.description}</p>
                  )}

                  <div className="rounded-lg bg-background/30 border border-border/30 p-2 text-xs space-y-0.5">
                    <div className="flex justify-between">
                      <span className="opacity-80">Serviço</span>
                      <span className="font-medium">{formatBRL(p.valueCents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Taxa da plataforma (10%)</span>
                      <span>{formatBRL(fee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border/30 pt-1">
                      <span className="font-semibold">Total a pagar</span>
                      <span className="font-bold">{formatBRL(p.valueCents)}</span>
                    </div>
                  </div>

                  {p.deliveryDays != null && (
                    <div className="text-xs opacity-90">Prazo: {p.deliveryDays} dia(s)</div>
                  )}

                  {!isOwnMessage && canHire && status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => onAcceptProposal?.(message)}>
                        <CheckCircle className="h-3 w-3 mr-1" /> Aceitar e pagar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => onRejectProposal?.(message)}>
                        <X className="h-3 w-3 mr-1" /> Recusar
                      </Button>
                    </div>
                  )}

                  {status === 'rejected' && onCounterProposal && (
                    <Button size="sm" variant="outline" className="w-full mt-1" onClick={() => onCounterProposal(message)}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Enviar contraproposta
                    </Button>
                  )}

                  {isOwnMessage && status === 'pending' && (
                    <p className="text-[10px] opacity-80">Aguardando resposta da outra parte…</p>
                  )}
                  {!isClosed === false && status !== 'rejected' && (
                    <p className="text-[10px] opacity-80">{status === 'paid' ? 'Pagamento recebido. Boa parceria!' : status === 'accepted' ? 'Proposta aceita. Aguardando pagamento.' : ''}</p>
                  )}
                </div>
              );
            })()}

            {message.type === 'file' && (() => {
              const f = message.fileData;
              const isImage = f.type === 'image' || (f.mime || '').startsWith('image/');
              return (
                <div className="space-y-2">
                  {isImage && f.url ? (
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="block">
                      <img
                        src={f.url}
                        alt={f.name}
                        loading="lazy"
                        className="rounded-lg max-h-60 w-full object-cover border border-border/40"
                      />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded border border-border/40 bg-background/40">
                      <FileText className="h-5 w-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{f.name}</p>
                        <p className="text-xs opacity-75">{f.size}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="opacity-80 truncate" title={f.name}>{f.name}{f.size ? ` · ${f.size}` : ''}</span>
                    {f.url && (
                      <a href={f.url} target="_blank" rel="noopener noreferrer" download={f.name}>
                        <Button size="sm" variant="outline" className="h-7 px-2">
                          <Download className="h-3 w-3 mr-1" /> Baixar
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              );
            })()}

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
            <FileImage className="h-8 w-8 mx-auto mb-2 opacity-50" />
            Inicie a conversa enviando uma mensagem, anexo ou proposta de orçamento.
          </div>
        )}
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
