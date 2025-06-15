
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/index/LoadingScreen';
import IndexLayoutWrapper from '@/components/index/IndexLayoutWrapper';
import IndexHeader from '@/components/index/IndexHeader';
import IndexMainContent from '@/components/index/IndexMainContent';
import IndexNotifications from '@/components/index/IndexNotifications';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';

const Index = () => {
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

  const currentUser = useUserData(authUser, userType);

  const handleChatRedirect = () => {
    navigate('/chat');
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect if no user type is defined
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
    </IndexLayoutWrapper>
  );
};

export default Index;
