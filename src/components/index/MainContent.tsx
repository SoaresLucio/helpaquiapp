
import React from 'react';
import SolicitanteHome from '@/components/solicitante/SolicitanteHome';
import FreelancerHome from '@/components/freelancer/FreelancerHome';

interface MainContentProps {
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const MainContent: React.FC<MainContentProps> = ({ 
  userType, 
  selectedCategory, 
  onSelectCategory 
}) => {
  return (
    <div className="flex-1">
      {userType === 'solicitante' ? (
        <SolicitanteHome 
          selectedCategory={selectedCategory} 
          onSelectCategory={onSelectCategory} 
        />
      ) : (
        <FreelancerHome />
      )}
    </div>
  );
};

export default MainContent;
