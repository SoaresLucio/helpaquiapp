
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileImage,
  Download,
  MapPin,
  DollarSign
} from 'lucide-react';

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

interface ChatMessagesProps {
  messages: Message[];
  conversation: any;
  userType: string | null;
  onConfirmSchedule: (messageId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  conversation,
  userType,
  onConfirmSchedule,
  messagesEndRef
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === 'me';

    return (
      <div key={message.id} className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          <div
            className={`rounded-lg px-4 py-3 ${
              isOwnMessage
                ? 'bg-helpaqui-blue text-white rounded-tr-none'
                : 'bg-white border border-gray-200 rounded-tl-none shadow-sm'
            }`}
          >
            {message.type === 'text' && (
              <p className="text-sm leading-relaxed">{message.content}</p>
            )}

            {message.type === 'schedule_suggestion' && (
              <div className="space-y-3">
                <div className={`flex items-center gap-2 ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium text-sm">Sugestão de Horário</span>
                </div>
                <p className="text-sm">{message.scheduleData.message}</p>
                <div className={`flex items-center gap-2 text-sm ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(message.scheduleData.date).toLocaleDateString('pt-BR')} às {message.scheduleData.time}
                  </span>
                </div>
                
                {!isOwnMessage && !message.scheduleData.confirmed && (
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onConfirmSchedule(message.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Confirmar Horário
                  </Button>
                )}
                
                {message.scheduleData.confirmed && (
                  <Badge className="bg-green-100 text-green-800 w-full justify-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Horário Confirmado
                  </Badge>
                )}
              </div>
            )}

            {message.type === 'file' && (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                  <FileImage className="h-4 w-4" />
                  <span className="font-medium text-sm">Arquivo enviado</span>
                </div>
                <div className={`p-2 rounded border ${isOwnMessage ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <p className="text-sm font-medium">{message.fileData.name}</p>
                  <p className="text-xs opacity-75">{message.fileData.size}</p>
                  <Button size="sm" variant="outline" className="mt-2 w-full">
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                {message.timestamp}
              </span>
              
              {isOwnMessage && (
                <span className="ml-2">
                  {message.read ? (
                    <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Agrupar mensagens por data
  const groupMessagesByDate = () => {
    const groups: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      const date = new Date().toLocaleDateString(); // Simplificado para demo
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
      {/* Resumo do serviço - sempre visível */}
      <div className="bg-white rounded-lg p-4 border-l-4 border-helpaqui-blue shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-helpaqui-blue" />
          <span className="font-medium text-sm">Resumo do Serviço</span>
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <p><strong>Serviço:</strong> {conversation.jobTitle}</p>
          <p><strong>Categoria:</strong> {conversation.jobCategory}</p>
          <p><strong>Valor Acordado:</strong> {formatCurrency(conversation.agreedValue)}</p>
          <p><strong>Local:</strong> {conversation.location.address}</p>
        </div>
      </div>

      {/* Mensagens agrupadas por data */}
      {Object.entries(messageGroups).map(([date, msgs]) => (
        <div key={date}>
          <div className="flex justify-center mb-4">
            <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              {date === new Date().toLocaleDateString() ? 'Hoje' : date}
            </span>
          </div>
          
          {msgs.map(renderMessage)}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
