import React, { useState, useRef, useEffect } from 'react';
import { Send, PaperclipIcon, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
}

interface ChatInterfaceProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  recipientId,
  recipientName,
  recipientAvatar
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // ID fixo da conversa por enquanto
  const conversationId = '1';

  // Scroll para a mensagem mais recente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Buscar histórico de mensagens
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configurar escuta em tempo real
  useEffect(() => {
    fetchMessages();

    // Inscrever-se em novas mensagens
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Scroll quando mensagens mudarem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          content: newMessage,
          sender_id: user.id,
          conversation_id: conversationId
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Formatação da data/hora das mensagens
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Agrupamento de mensagens por data
  const groupMessagesByDate = () => {
    const groups: Record<string, Message[]> = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  if (loading) {
    return (
      <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-md overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl shadow-md overflow-hidden">
      {/* Cabeçalho do chat */}
      <div className="p-3 border-b bg-gray-50 flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <img 
            src={recipientAvatar} 
            alt={recipientName}
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h3 className="font-medium">{recipientName}</h3>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
      
      {/* Área de mensagens */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date} className="mb-4">
            <div className="flex justify-center mb-3">
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {date === new Date().toLocaleDateString() ? 'Hoje' : date}
              </span>
            </div>
            
            {msgs.map(msg => (
              <div 
                key={msg.id}
                className={`mb-3 flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    msg.sender_id === user?.id 
                      ? 'bg-helpaqui-blue text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="mb-1">{msg.content}</p>
                  <div className="flex items-center justify-end">
                    <span className={`text-xs ${
                      msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Área de digitação */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          className="text-gray-500"
        >
          <PaperclipIcon className="h-5 w-5" />
        </Button>
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="helpaqui-input mx-2 flex-1 bg-gray-50"
        />
        
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          className="text-gray-500 mr-1"
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <Button 
          type="submit" 
          className="helpaqui-button-primary"
          disabled={!newMessage.trim()}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;