
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

interface SubscriptionSuccessMessageProps {
  planName: string;
  onClose: () => void;
}

const SubscriptionSuccessMessage: React.FC<SubscriptionSuccessMessageProps> = ({ 
  planName, 
  onClose 
}) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const getPlanBenefits = (plan: string) => {
    switch (plan) {
      case 'Help Bronze':
        return [
          'Acesso básico aos profissionais',
          'Centro de dicas e boas práticas',
          'Suporte via chat'
        ];
      case 'Help Prata':
        return [
          'Destaque nos resultados de busca',
          'Mais solicitações por mês',
          'Suporte prioritário',
          'Divulgação semanal no app'
        ];
      case 'Help Ouro':
        return [
          'Solicitações ilimitadas',
          'Posição premium nos resultados',
          'Suporte dedicado 24/7',
          'Selo "Perfil Recomendado"',
          'Notificações antecipadas'
        ];
      default:
        return [];
    }
  };

  const benefits = getPlanBenefits(planName);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full bg-white shadow-2xl">
          <CardContent className="p-6 text-center space-y-6">
            {/* Ícone de Sucesso */}
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                🎉 Parabéns!
              </h2>
              <p className="text-lg text-gray-700">
                Você assinou o plano <span className="font-semibold text-helpaqui-blue">{planName}</span>
              </p>
            </div>

            {/* Mensagem Principal */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-semibold text-blue-800">
                  Seu perfil agora está em destaque!
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Você aparecerá com prioridade nos resultados de busca
              </p>
            </div>

            {/* Benefícios */}
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-3 text-center">
                Seus novos benefícios:
              </h3>
              <ul className="space-y-2">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contador de Visualizações */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800">
                  Impacto Imediato
                </span>
              </div>
              <p className="text-sm text-green-700">
                Seu perfil já começou a aparecer mais nos resultados!
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  navigate('/dashboard');
                  onClose();
                }}
                className="flex-1 bg-helpaqui-blue hover:bg-blue-700"
              >
                Ver Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SubscriptionSuccessMessage;
