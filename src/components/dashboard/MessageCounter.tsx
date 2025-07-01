
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Crown } from 'lucide-react';
import { useMessageLimit } from '@/hooks/useMessageLimit';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface MessageCounterProps {
  userType: 'freelancer' | 'solicitante';
}

const MessageCounter: React.FC<MessageCounterProps> = ({ userType }) => {
  const navigate = useNavigate();
  const { messageLimit, loading } = useMessageLimit();

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusMessage = () => {
    if (messageLimit.isUnlimited) {
      return {
        message: 'Mensagens ilimitadas',
        color: 'text-green-600',
        icon: '🚀'
      };
    }

    const percentage = (messageLimit.messagesUsed / messageLimit.messagesLimit) * 100;
    
    if (percentage >= 90) {
      return {
        message: 'Limite quase atingido!',
        color: 'text-red-600',
        icon: '⚠️'
      };
    } else if (percentage >= 70) {
      return {
        message: 'Cuidado com o limite',
        color: 'text-yellow-600',
        icon: '⚡'
      };
    } else {
      return {
        message: 'Tudo em ordem',
        color: 'text-green-600',
        icon: '✅'
      };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getStatusMessage();
  const progressPercentage = messageLimit.isUnlimited 
    ? 100 
    : (messageLimit.messagesUsed / messageLimit.messagesLimit) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <MessageSquare className="h-5 w-5 mr-2 text-helpaqui-blue" />
          Limite de Mensagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contador Principal */}
        <div className="text-center">
          <div className="text-3xl font-bold text-helpaqui-blue">
            {messageLimit.isUnlimited ? '∞' : messageLimit.messagesUsed}
          </div>
          <div className="text-sm text-gray-600">
            {messageLimit.isUnlimited 
              ? 'Conversas ilimitadas'
              : `de ${messageLimit.messagesLimit} conversas`
            }
          </div>
        </div>

        {/* Barra de Progresso */}
        {!messageLimit.isUnlimited && (
          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className="w-full h-3"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{messageLimit.messagesLimit}</span>
            </div>
          </div>
        )}

        {/* Status */}
        <div className={`text-center text-sm font-medium ${status.color}`}>
          {status.icon} {status.message}
        </div>

        {/* Plano Atual */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Plano Atual</div>
          <div className="font-semibold text-helpaqui-blue">
            {messageLimit.planName}
          </div>
        </div>

        {/* Botão de Upgrade */}
        {!messageLimit.isUnlimited && progressPercentage >= 70 && (
          <Button
            onClick={() => navigate(userType === 'freelancer' ? '/freelancer-plans' : '/solicitante-plans')}
            className="w-full bg-gradient-to-r from-helpaqui-blue to-blue-600 hover:from-blue-600 hover:to-blue-700"
            size="sm"
          >
            <Crown className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        )}

        {/* Dica */}
        <div className="text-xs text-gray-500 text-center">
          {messageLimit.isUnlimited 
            ? 'Você pode conversar com quantos profissionais quiser!'
            : 'Cada nova conversa conta para o seu limite mensal.'
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageCounter;
