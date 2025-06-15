
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';
import PageContainer from '@/components/common/PageContainer';
import BackButton from '@/components/ui/back-button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { useSubscriptionHistory } from '@/hooks/useSubscriptionHistory';

const SubscriptionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { subscriptions, loading, loadSubscriptions } = useSubscriptionHistory();

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner text="Carregando histórico..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <BackButton to="/" label="Voltar ao Início" />
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Histórico de Assinaturas
              </h1>
              <p className="text-gray-600">
                Acompanhe todas as suas assinaturas e pagamentos
              </p>
            </div>
            <Button onClick={() => navigate('/subscription-flow')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          </div>

          {subscriptions.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title="Nenhuma assinatura encontrada"
              description="Você ainda não possui assinaturas. Assine um plano e aproveite todos os benefícios!"
              actionLabel="Assinar Agora"
              onAction={() => navigate('/subscription-flow')}
            />
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {subscription.plan_name}
                        </h3>
                        <p className="text-gray-600">
                          {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-helpaqui-blue">
                          {formatPrice(subscription.plan_price)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default SubscriptionHistoryPage;
