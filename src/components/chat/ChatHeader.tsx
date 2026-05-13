
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  Briefcase,
} from 'lucide-react';


interface ChatHeaderProps {
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
    };
    isOnline: boolean;
  };
  userType: string | null;
  onViewLocation: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  userType,
  onViewLocation
}) => {
  const navigate = useNavigate();
  const canHire = (userType === 'solicitante' || userType === 'empresa' || userType === 'ambos')
    && conversation.participantType === 'freelancer';

  const goToHireConfirmation = () => {
    navigate('/hire/confirm', {
      state: {
        conversationId: conversation.id,
        freelancerId: conversation.participantId,
        freelancerName: conversation.participantName,
        defaultTitle: conversation.jobTitle && conversation.jobTitle !== 'Conversa' && conversation.jobTitle !== 'Conversa direta' ? conversation.jobTitle : '',
      },
    });
  };
  const getJobStatusBadge = (status: string) => {
    const statusConfig = {
      'aguardando_inicio': { 
        icon: Clock, 
        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', 
        text: 'Aguardando Início' 
      },
      'em_andamento': { 
        icon: AlertTriangle, 
        color: 'bg-blue-50 text-blue-700 border-blue-200', 
        text: 'Em Andamento' 
      },
      'finalizado': { 
        icon: CheckCircle, 
        color: 'bg-green-50 text-green-700 border-green-200', 
        text: 'Finalizado' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aguardando_inicio;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.participantAvatar} />
              <AvatarFallback className="bg-helpaqui-purple text-white">
                {conversation.participantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {conversation.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{conversation.participantName}</h3>
              <Badge variant="secondary" className="text-xs">
                {conversation.participantType === 'freelancer' ? 'Profissional' : 'Cliente'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">{conversation.jobTitle}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{conversation.jobCategory}</span>
              <span>•</span>
              <span>{formatCurrency(conversation.agreedValue)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/u/${conversation.participantId}`)}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Ver Perfil</span>
          </Button>
          {canHire && (
            <Button size="sm" onClick={goToHireConfirmation} className="bg-primary hover:bg-primary/90">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Contratar</span>
            </Button>
          )}
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          {getJobStatusBadge(conversation.jobStatus)}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewLocation}
            className="flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" />
            <span className="text-xs">Ver Local no Mapa</span>
          </Button>
        </div>
        
        {userType === 'freelancer' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              Solicitar Alteração de Horário
            </Button>
            <Button variant="outline" size="sm" className="text-xs text-red-600">
              Relatar Problema
            </Button>
          </div>
        )}
        
        {userType === 'solicitante' && conversation.jobStatus === 'em_andamento' && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
            Confirmar Conclusão
          </Button>
        )}
      </div>
      
      <Separator />
    </CardHeader>
  );
};

export default ChatHeader;
