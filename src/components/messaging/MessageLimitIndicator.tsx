
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Crown, Zap } from 'lucide-react';

interface MessageLimitIndicatorProps {
  used: number;
  total: number;
  planName?: string;
  className?: string;
}

const MessageLimitIndicator: React.FC<MessageLimitIndicatorProps> = ({
  used,
  total,
  planName = 'Help Bronze',
  className = '',
}) => {
  const isUnlimited = total === -1;
  const percentage = isUnlimited ? 100 : Math.min((used / total) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && used >= total;

  const getPlanIcon = () => {
    if (planName.includes('Ouro')) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (planName.includes('Prata')) return <Zap className="h-4 w-4 text-blue-500" />;
    return <MessageCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-orange-600';
    return 'text-green-600';
  };

  const getProgressColor = () => {
    if (isAtLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getPlanIcon()}
            <span className="text-sm font-medium">{planName}</span>
          </div>
          <div className={`text-sm font-semibold ${getStatusColor()}`}>
            {isUnlimited ? 'Ilimitado' : `${used}/${total}`}
          </div>
        </div>

        {!isUnlimited && (
          <>
            <Progress 
              value={percentage} 
              className="mb-2 h-2"
            />
            <div className="text-xs text-gray-600">
              {isAtLimit ? (
                <span className="text-red-600">
                  Limite de mensagens atingido. Faça upgrade para continuar.
                </span>
              ) : isNearLimit ? (
                <span className="text-orange-600">
                  Você está próximo do limite de mensagens.
                </span>
              ) : (
                <span>
                  Você pode iniciar {total - used} novas conversas este mês.
                </span>
              )}
            </div>
          </>
        )}

        {isUnlimited && (
          <div className="text-xs text-green-600">
            Você tem mensagens ilimitadas com este plano!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MessageLimitIndicator;
