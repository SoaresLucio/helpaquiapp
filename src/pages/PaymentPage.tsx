
import React from 'react';
import { ArrowLeft, CreditCard, DollarSign, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="helpaqui-container py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="flex items-center mb-4 text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-helpaqui-blue" />
            Pagamentos
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Métodos de Pagamento
                </CardTitle>
                <CardDescription>
                  Gerencie seus cartões e contas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione ou remova métodos de pagamento para suas transações.
                </p>
                <Button className="w-full">
                  Gerenciar Métodos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Histórico de Transações
                </CardTitle>
                <CardDescription>
                  Visualize suas transações passadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Acompanhe todos os pagamentos {userType === 'freelancer' ? 'recebidos' : 'realizados'}.
                </p>
                <Button variant="outline" className="w-full">
                  Ver Histórico
                </Button>
              </CardContent>
            </Card>

            {userType === 'freelancer' && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados Bancários</CardTitle>
                  <CardDescription>
                    Configure sua conta para recebimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Adicione seus dados bancários para receber pagamentos.
                  </p>
                  <Button variant="outline" className="w-full">
                    Configurar Conta
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>
                {userType === 'freelancer' 
                  ? 'Acompanhe seus ganhos e pagamentos pendentes'
                  : 'Controle seus gastos com serviços'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {userType === 'freelancer' ? 'Total Recebido' : 'Total Gasto'}
                  </p>
                  <p className="text-2xl font-bold text-green-600">R$ 0,00</p>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {userType === 'freelancer' ? 'Pendente' : 'Em Análise'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">R$ 0,00</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 0,00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
