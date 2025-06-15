
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, CreditCard } from 'lucide-react';
import { UserSubscription } from '@/services/subscriptionService';

interface SubscriptionStatusCardProps {
  currentSubscription: UserSubscription;
  onCancelClick: () => void;
}

/**
 * Card de status da assinatura atual do freelancer
 * Exibe informações detalhadas sobre o plano ativo e opções de gerenciamento
 * 
 * Informações exibidas:
 * - Nome do plano atual
 * - Oportunidades utilizadas no mês
 * - Status da assinatura
 * - Data de renovação
 * - Botão para cancelar (apenas planos pagos)
 */
const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  currentSubscription,
  onCancelClick
}) => {
  /**
   * Formata o limite de oportunidades para exibição
   */
  const formatMaxRequests = (maxRequests: number | null) => {
    if (maxRequests === -1) return "Ilimitadas";
    if (maxRequests === null) return "0";
    return maxRequests.toString();
  };

  /**
   * Formata data para o padrão brasileiro
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  /**
   * Retorna cor do badge baseado no status
   */
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'cancelled': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  /**
   * Retorna texto do status em português
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'cancelled': return 'Cancelado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  return (
    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      {/* Título da seção */}
      <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
        <CreditCard className="h-5 w-5 mr-2" />
        Status da Sua Assinatura
      </h3>
      
      {/* Grid de informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-blue-800 mb-4">
        {/* Plano atual */}
        <div className="flex flex-col">
          <span className="font-medium mb-1">Plano Atual:</span>
          <span className="font-semibold">{currentSubscription.subscription_plans?.name}</span>
        </div>
        
        {/* Uso mensal */}
        <div className="flex flex-col">
          <span className="font-medium mb-1">Oportunidades este mês:</span>
          <span>
            {currentSubscription.requests_used_this_month || 0} / {
              formatMaxRequests(currentSubscription.subscription_plans?.max_requests_per_month || null)
            }
          </span>
        </div>
        
        {/* Status */}
        <div className="flex flex-col">
          <span className="font-medium mb-1">Status:</span>
          <Badge variant={getStatusBadgeVariant(currentSubscription.status || 'inactive')}>
            {getStatusText(currentSubscription.status || 'inactive')}
          </Badge>
        </div>
        
        {/* Próxima renovação */}
        <div className="flex flex-col">
          <span className="font-medium mb-1">Próxima renovação:</span>
          <span className="flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(currentSubscription.current_period_end)}
          </span>
        </div>
      </div>
      
      {/* Botão de cancelamento (apenas para planos pagos) */}
      {currentSubscription.subscription_plans?.price_monthly && 
       currentSubscription.subscription_plans.price_monthly > 0 && 
       currentSubscription.status === 'active' && (
        <div className="pt-4 border-t border-blue-200">
          <Button
            variant="outline"
            onClick={onCancelClick}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar Assinatura
          </Button>
          
          {/* Aviso sobre cancelamento */}
          <p className="text-xs text-blue-600 mt-2">
            Ao cancelar, você manterá acesso até o final do período atual.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStatusCard;
