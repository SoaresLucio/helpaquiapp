
import React, { useState, useRef, useEffect } from 'react';
import { Send, PaperclipIcon, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockMessages, currentUser } from '@/data/mockData';

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
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll para a mensagem mais recente
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Atualizar mensagens como lidas
  useEffect(() => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.receiver === currentUser.id && !msg.read 
          ? { ...msg, read: true } 
          : msg
      )
    );
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    const timestamp = new Date().toISOString();
    
    const message = {
      id: `msg_${Date.now()}`,
      sender: currentUser.id,
      receiver: recipientId,
      text: newMessage,
      timestamp,
      read: false
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };
  
  // Formatação da data/hora das mensagens
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Agrupamento de mensagens por data
  const groupMessagesByDate = () => {
    const groups: Record<string, typeof messages> = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();

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
                className={`mb-3 flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    msg.sender === currentUser.id 
                      ? 'bg-helpaqui-blue text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 rounded-tl-none'
                  }`}
                >
                  <p className="mb-1">{msg.text}</p>
                  <div className="flex items-center justify-end">
                    <span className={`text-xs ${
                      msg.sender === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatMessageTime(msg.timestamp)}
                    </span>
                    
                    {msg.sender === currentUser.id && (
                      <span className="ml-1">
                        {msg.read ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-100">
                            <path d="M18 6L9.7 16.4a1 1 0 01-1.5 0L3 11"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-100">
                            <path d="M18 6l-8.5 10-5.5-5"></path>
                          </svg>
                        )}
                      </span>
                    )}
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
