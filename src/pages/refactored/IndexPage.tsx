
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import IndexLayoutWrapper from '@/components/index/IndexLayoutWrapper';
import IndexHeader from '@/components/index/IndexHeader';
import IndexMainContent from '@/components/index/IndexMainContent';
import IndexNotifications from '@/components/index/IndexNotifications';
import Footer from '@/components/Footer';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/user/useUserData';

const IndexPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('actions');
  
  const {
    userType,
    loading,
    user: authUser
  } = useAuth();
  
  const {
    currentNotification,
    acceptJob,
    rejectJob,
    dismissNotification
  } = useJobNotifications();

  const { currentUser } = useUserData(authUser, userType);

  useEffect(() => {
    console.log('🏠 Index page mounted');
  }, []);

  const handleChatRedirect = () => {
    navigate('/chat');
  };

  if (loading) {
    return <LoadingSpinner text="Carregando..." />;
  }

  if (!userType) {
    navigate('/user-type');
    return null;
  }

  return (
    <IndexLayoutWrapper userType={userType}>
      <IndexHeader 
        userType={userType}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      
      <IndexNotifications 
        currentNotification={currentNotification}
        acceptJob={acceptJob}
        rejectJob={rejectJob}
        dismissNotification={dismissNotification}
      />
      
      <IndexMainContent 
        userType={userType}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onChatRedirect={handleChatRedirect}
        currentUser={currentUser}
      />
      
      <Footer />
    </IndexLayoutWrapper>
  );
};

export default IndexPage;
