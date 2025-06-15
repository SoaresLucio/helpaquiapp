
import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente de estado de carregamento para páginas de assinatura
 * Exibe um spinner animado com mensagem de carregamento
 * 
 * @param message - Mensagem personalizada de carregamento (opcional)
 */
interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Carregando planos de assinatura..." 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner animado */}
        <Loader2 className="h-12 w-12 animate-spin text-helpaqui-blue mx-auto mb-4" />
        
        {/* Mensagem de carregamento */}
        <p className="text-gray-600 text-lg">{message}</p>
        
        {/* Indicador visual adicional */}
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-helpaqui-blue rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-helpaqui-blue rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-helpaqui-blue rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
