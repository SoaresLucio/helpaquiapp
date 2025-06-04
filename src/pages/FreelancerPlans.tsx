
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FreelancerSubscriptionPlans from '@/components/subscription/FreelancerSubscriptionPlans';

const FreelancerPlans: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-2">
            Planos para Freelancers
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            Encontre o plano ideal para expandir seus negócios e se conectar com mais clientes na sua região.
          </p>
        </div>

        <FreelancerSubscriptionPlans />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">💼</span>
                Mais Oportunidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Acesse uma base crescente de clientes que procuram profissionais qualificados. 
                Aumente sua visibilidade e conquiste mais projetos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">⭐</span>
                Destaque no Mercado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Apareça entre os profissionais recomendados da sua região. 
                Construa sua reputação e ganhe a confiança dos clientes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="text-2xl mr-2">📈</span>
                Crescimento Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Utilize nossas ferramentas de análise e dicas para melhorar seu desempenho. 
                Acompanhe seu progresso e otimize seus resultados.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FreelancerPlans;
