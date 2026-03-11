
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '@/components/index/MobileNavigation';

interface IndexLayoutWrapperProps {
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
  children: React.ReactNode;
}

const IndexLayoutWrapper: React.FC<IndexLayoutWrapperProps> = ({
  userType,
  children
}) => {
  const navigate = useNavigate();

  const handleMobileNavigation = (section: string) => {
    if (section === 'chat') {
      navigate('/chat');
    }
    // Note: Other navigation handling would be passed from parent
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {children}
      
      <MobileNavigation 
        userType={userType}
        onNavigate={handleMobileNavigation}
      />
    </div>
  );
};

export default IndexLayoutWrapper;
