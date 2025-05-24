
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign, User, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { releaseFunds, getPaymentHistory, PaymentFlow as PaymentFlowType } from '@/services/paymentService';

const PaymentFlow: React.FC = () => {
  const [payments, setPayments] = useState<PaymentFlowType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const history = await getPaymentHistory();
      setPayments(history);
    } catch (error) {
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico de pagamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFunds = async (paymentId: string) => {
    try {
      const success = await releaseFunds(paymentId);
      if (success) {
        toast({
          title: "Fundos liberados",
          description: "O pagamento foi liberado para o freelancer"
        });
        loadPaymentHistory();
      } else {
        throw new Error('Failed to release funds');
      }
    } catch (error) {
      toast({
        title: "Erro na liberação",
        description: "Não foi possível liberar os fundos",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando histórico de pagamentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fluxo de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum pagamento encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span className="font-medium">{payment.service_title || 'Serviço'}</span>
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusIcon(payment.status)}
                            {payment.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Valor total:</span>
                            <p className="font-medium">R$ {(payment.amount / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Taxa plataforma:</span>
                            <p className="font-medium text-orange-600">R$ {(payment.platform_fee / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Para freelancer:</span>
                            <p className="font-medium text-green-600">R$ {(payment.freelancer_amount / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Data:</span>
                            <p className="font-medium">{new Date(payment.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                      
                      {payment.status === 'processing' && (
                        <Button
                          onClick={() => handleReleaseFunds(payment.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Liberar Fundos
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFlow;
