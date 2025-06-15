
import React from 'react';
import Header from '@/components/Header';
import RecommendedFreelancersContainer from '@/components/freelancers/RecommendedFreelancersContainer';
import { useAccessControl } from '@/hooks/useAccessControl';

const RecommendedFreelancers = () => {
  const { loading } = useAccessControl({ 
    requiredUserType: 'solicitante' 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="helpaqui-container py-6">
        <RecommendedFreelancersContainer />
      </main>
    </div>
  );
};

export default RecommendedFreelancers;
