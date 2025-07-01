
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, Crown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PlanBadge from '@/components/common/PlanBadge';

interface MessageLimitIndicatorProps {
  messagesUsed: number;
  messagesLimit: number;
  planName: string;
  isUnlimited: boolean;
  onUpgradeClick?: () => void;
}

const MessageLimitIndicator: React.FC<MessageLimitIndicatorProps> = ({
  messagesUsed,
  messagesLimit,
  planName,
  isUnlimited,
  onUpgradeClick
}) => {
  const getProgressValue = () => {
    if (isUnlimited) return 0;
    return (messagesUsed / messagesLimit) * 100;
  };

  const getProgressColor = () => {
    const percentage = getProgressValue();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isNearLimit = !isUnlimited && messagesUsed >= messagesLimit * 0.8;
  const isAtLimit = !isUnlimited && messagesUsed >= messagesLimit;

  return (
    <Card className={`${isAtLimit ? 'border-red-200' : isNearLimit ? 'border-yellow-200' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span className="text-lg">Limite de Mensagens</span>
          </div>
          <PlanBadge planName={planName} size="sm" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isUnlimited ? (
          <div className="text-center py-4">
            <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-green-600">Mensagens Ilimitadas</p>
            <p className="text-sm text-gray-600">Você pode conversar com quantos profissionais quiser!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Conversas utilizadas</span>
              <span className={`font-semibold ${isAtLimit ? 'text-red-600' : 'text-gray-700'}`}>
                {messagesUsed} de {messagesLimit}
              </span>
            </div>
            
            <Progress 
              value={getProgressValue()} 
              className="h-2"
            />
            
            {isAtLimit && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Limite atingido</p>
                  <p className="text-red-600">
                    Você não pode iniciar novas conversas. Faça upgrade para continuar.
                  </p>
                </div>
              </div>
            )}
            
            {isNearLimit && !isAtLimit && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Próximo do limite</p>
                  <p className="text-yellow-600">
                    Considere fazer upgrade para não ficar sem mensagens.
                  </p>
                </div>
              </div>
            )}
            
            {(isAtLimit || isNearLimit) && onUpgradeClick && (
              <Button 
                onClick={onUpgradeClick}
                className="w-full mt-3"
                variant={isAtLimit ? "default" : "outline"}
              >
                <Crown className="h-4 w-4 mr-2" />
                Ver Planos de Upgrade
              </Button>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center">
          {isUnlimited ? 
            'Aproveite suas mensagens ilimitadas!' : 
            'Contador reinicia todo mês'
          }
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageLimitIndicator;
