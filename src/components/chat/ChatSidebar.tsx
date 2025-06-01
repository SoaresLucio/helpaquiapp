
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, MessageCircle, Clock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: string;
  jobTitle: string;
  jobCategory: string;
  isOnline: boolean;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation;
  onSelectConversation: (conversation: Conversation) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.jobCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'negociando': { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'Negociando' },
      'acordado': { color: 'bg-green-50 text-green-700 border-green-200', text: 'Acordo Fechado' },
      'finalizado': { color: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Finalizado' },
      'cancelado': { color: 'bg-red-50 text-red-700 border-red-200', text: 'Cancelado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.negociando;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    if (timestamp.includes(':')) {
      return timestamp;
    }
    return timestamp;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
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
        <div className="space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-all duration-200 ${
                selectedConversation.id === conversation.id 
                  ? 'bg-blue-50 border-l-blue-500 shadow-sm' 
                  : 'border-l-transparent'
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback className="bg-helpaqui-blue text-white">
                      {conversation.participantName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm truncate pr-2">
                      {conversation.participantName}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(conversation.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    {conversation.jobTitle}
                  </p>
                  
                  <p className="text-sm text-gray-600 truncate mb-3 leading-relaxed">
                    {conversation.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(conversation.status)}
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 w-5 p-0 flex items-center justify-center">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatSidebar;
