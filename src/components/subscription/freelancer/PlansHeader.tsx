
import React from 'react';

/**
 * Cabeçalho da página de planos para freelancers
 * Exibe título principal e descrição dos benefícios
 */
const PlansHeader: React.FC = () => {
  return (
    <div className="text-center">
      {/* Título principal */}
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Planos para Freelancers
      </h2>
      
      {/* Descrição dos benefícios */}
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Expanda seus negócios e conecte-se com mais clientes. 
        Escolha o plano ideal para impulsionar sua carreira profissional.
      </p>
    </div>
  );
};

export default PlansHeader;
