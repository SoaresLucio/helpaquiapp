
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MessageCircle, 
  Clock, 
  Send,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock data para conversas
const mockConversations = [
  {
    id: '1',
    participantName: 'João Silva',
    participantAvatar: '/placeholder.svg',
    lastMessage: 'Ótimo! Quando podemos começar o projeto?',
    timestamp: '10:30',
    unreadCount: 2,
    status: 'negociando',
    jobTitle: 'Desenvolvimento de Website'
  },
  {
    id: '2',
    participantName: 'Maria Santos',
    participantAvatar: '/placeholder.svg',
    lastMessage: 'O valor está dentro do orçamento, vamos fechar!',
    timestamp: 'Ontem',
    unreadCount: 0,
    status: 'acordado',
    jobTitle: 'Design de Logo'
  },
  {
    id: '3',
    participantName: 'Pedro Costa',
    participantAvatar: '/placeholder.svg',
    lastMessage: 'Preciso de mais detalhes sobre o prazo...',
    timestamp: '15:45',
    unreadCount: 1,
    status: 'negociando',
    jobTitle: 'Consultoria em Marketing'
  }
];

const mockMessages = [
  {
    id: '1',
    senderId: 'other',
    content: 'Olá! Vi seu interesse no projeto de desenvolvimento.',
    timestamp: '10:25'
  },
  {
    id: '2',
    senderId: 'me',
    content: 'Oi! Sim, tenho muito interesse. Qual seria o valor?',
    timestamp: '10:27'
  },
  {
    id: '3',
    senderId: 'other',
    content: 'Para um projeto desse escopo, estou pensando em R$ 2.500',
    timestamp: '10:28'
  },
  {
    id: '4',
    senderId: 'me',
    content: 'Ótimo! Quando podemos começar o projeto?',
    timestamp: '10:30'
  }
];

const Chat = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = mockConversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Aqui você adicionaria a lógica para enviar a mensagem
      console.log('Enviando mensagem:', newMessage);
      setNewMessage('');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'negociando':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Negociando</Badge>;
      case 'acordado':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Acordo Fechado</Badge>;
      default:
        return <Badge variant="outline">Ativo</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
          {/* Lista de Conversas */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversas Ativas
              </CardTitle>
              <div className="relative">
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                      selectedConversation.id === conversation.id 
                        ? 'bg-blue-50 border-l-blue-500' 
                        : 'border-l-transparent'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={conversation.participantAvatar} />
                        <AvatarFallback>{conversation.participantName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">{conversation.participantName}</h4>
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{conversation.jobTitle}</p>
                        <p className="text-sm text-gray-600 truncate mb-2">{conversation.lastMessage}</p>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(conversation.status)}
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Área de Chat */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.participantAvatar} />
                    <AvatarFallback>{selectedConversation.participantName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{selectedConversation.participantName}</h3>
                    <p className="text-sm text-gray-600">{selectedConversation.jobTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator />
            </CardHeader>
            
            <CardContent className="flex flex-col h-[400px]">
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {mockMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === 'me'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className={`text-xs ${
                        message.senderId === 'me' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Nova Mensagem */}
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Chat;
