import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionHistory } from '@/hooks/useSubscriptionHistory';
import BackButton from '@/components/ui/back-button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SubscriptionHistory: React.FC = () => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expirado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string | undefined) => {
    if (!method) return 'N/A';
    switch (method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      default: return method;
    }
  };

  const isExpiringSoon = (endDate: string) => {
    const expiration = new Date(endDate);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando histórico...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
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
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma assinatura encontrada
                </h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não possui assinaturas. Assine um plano e aproveite todos os benefícios!
                </p>
                <Button onClick={() => navigate('/subscription-flow')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Assinar Agora
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className={`${
                  subscription.status === 'active' ? 'ring-2 ring-green-200 border-green-200' : ''
                }`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl mb-2">
                          {subscription.plan_name}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                          </span>
                          <span className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {getPaymentMethodLabel(subscription.payment_method)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(subscription.status)}
                        <div className="text-xl font-bold text-helpaqui-blue mt-1">
                          {formatPrice(subscription.plan_price)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {subscription.status === 'active' && isExpiringSoon(subscription.end_date) && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                          <div>
                            <h4 className="font-medium text-orange-800">
                              Assinatura expirando em breve
                            </h4>
                            <p className="text-sm text-orange-700">
                              Sua assinatura expira em {formatDate(subscription.end_date)}. 
                              Renove para continuar aproveitando os benefícios.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Criado em:</span>
                        <div className="font-medium">{formatDate(subscription.created_at)}</div>
                      </div>
                      
                      {subscription.payment_reference && (
                        <div>
                          <span className="text-gray-600">Referência:</span>
                          <div className="font-medium font-mono text-xs">
                            {subscription.payment_reference}
                          </div>
                        </div>
                      )}
                      
                      <div className="md:col-span-2 flex justify-end">
                        {subscription.status === 'active' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate('/subscription-flow')}
                          >
                            Renovar Assinatura
                          </Button>
                        )}
                        
                        {subscription.status === 'expired' && (
                          <Button 
                            size="sm"
                            onClick={() => navigate('/subscription-flow')}
                          >
                            Assinar Novamente
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SubscriptionHistory;
