
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import AIChatbot from '@/components/AIChatbot';

const AIChat = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto mb-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
      
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Chat de <span className="text-helpaqui-purple">Assistência</span>
        </h1>
        <AIChatbot />
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Nosso assistente virtual está em fase de treinamento.</p>
          <p>Para questões complexas, contate nosso suporte.</p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
