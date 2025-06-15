
import React from 'react';
import Header from '@/components/Header';

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas ofertas...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
