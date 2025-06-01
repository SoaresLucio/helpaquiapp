
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Calendar,
  Clock,
  Image,
  FileText
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatInputProps {
  onSendMessage: (content: string, type?: 'text' | 'file' | 'schedule_suggestion', additionalData?: any) => boolean;
  userType: string | null;
  conversation: any;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  userType,
  conversation
}) => {
  const [message, setMessage] = useState('');
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  // Mensagens rápidas baseadas no tipo de usuário
  const quickMessages = {
    freelancer: [
      "Olá, tudo bem? Recebi sua solicitação.",
      "Pode me confirmar o horário e local, por favor?",
      "Serviço concluído. Pode confirmar no app?",
      "Estou a caminho do local combinado.",
      "Preciso de alguns materiais adicionais."
    ],
    solicitante: [
      "Olá! Obrigado por aceitar meu pedido.",
      "O horário está confirmado.",
      "Aguardo você no local combinado.",
      "Ficou excelente! Muito obrigado.",
      "Preciso remarcar o horário."
    ]
  };

  const getCurrentQuickMessages = () => {
    if (userType === 'freelancer') return quickMessages.freelancer;
    return quickMessages.solicitante;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const success = onSendMessage(message.trim());
    if (success) {
      setMessage('');
    }
  };

  const handleQuickMessage = (quickMsg: string) => {
    const success = onSendMessage(quickMsg);
    if (success) {
      setShowQuickMessages(false);
    }
  };

  const handleScheduleSuggestion = (date: string, time: string) => {
    const scheduleMessage = `Que tal nos encontrarmos no dia ${new Date(date).toLocaleDateString('pt-BR')} às ${time}?`;
    
    const success = onSendMessage('', 'schedule_suggestion', {
      scheduleData: {
        date,
        time,
        message: scheduleMessage
      }
    });

    if (success) {
      setShowSchedulePicker(false);
    }
  };

  const handleFileUpload = (type: 'image' | 'document') => {
    // Simular upload de arquivo
    const fileName = type === 'image' ? 'foto_local.jpg' : 'documento.pdf';
    onSendMessage('', 'file', {
      fileData: {
        name: fileName,
        size: '2.3 MB',
        type,
        url: '/placeholder.svg'
      }
    });
  };

  return (
    <div className="p-4 border-t bg-white">
      {/* Mensagens rápidas */}
      {showQuickMessages && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Mensagens Rápidas:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {getCurrentQuickMessages().map((quickMsg, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="cursor-pointer hover:bg-helpaqui-blue hover:text-white transition-colors"
                onClick={() => handleQuickMessage(quickMsg)}
              >
                {quickMsg}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Seletor de horário */}
      {showSchedulePicker && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-helpaqui-blue" />
            <span className="text-sm font-medium text-gray-700">Sugerir Horário:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" className="text-sm" />
            <Input type="time" className="text-sm" />
          </div>
          <div className="flex gap-2 mt-2">
            <Button 
              size="sm" 
              onClick={() => handleScheduleSuggestion('2024-06-15', '14:00')}
              className="bg-helpaqui-blue hover:bg-helpaqui-blue/90"
            >
              Enviar Sugestão
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowSchedulePicker(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Área de input principal */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="min-h-[50px] max-h-[120px] resize-none bg-gray-50 border-gray-200 focus:bg-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          {/* Botões de ação */}
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleFileUpload('image')}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Enviar Foto
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => handleFileUpload('document')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Enviar Documento
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowSchedulePicker(!showSchedulePicker)}
            >
              <Calendar className="h-4 w-4" />
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowQuickMessages(!showQuickMessages)}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Botão de enviar */}
          <Button 
            type="submit" 
            disabled={!message.trim()}
            className="bg-helpaqui-blue hover:bg-helpaqui-blue/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
