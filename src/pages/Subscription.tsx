
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';

const Subscription: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Planos de Assinatura
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Escolha o plano ideal para suas necessidades e tenha acesso aos melhores profissionais da sua região.
          </p>
        </div>

        <SubscriptionPlans />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">🛡️</span>
                Garantia de Qualidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Todos os profissionais são verificados e avaliados pela nossa comunidade. 
                Sua satisfação é garantida ou seu dinheiro de volta.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Resposta Rápida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receba propostas de profissionais qualificados em minutos. 
                Compare preços e escolha a melhor opção para você.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">💬</span>
                Suporte Dedicado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Nossa equipe está sempre disponível para ajudar você. 
                Suporte prioritário para assinantes premium.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
