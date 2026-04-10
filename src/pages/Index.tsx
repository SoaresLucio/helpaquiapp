
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/index/LoadingScreen';
import IndexLayoutWrapper from '@/components/index/IndexLayoutWrapper';
import IndexHeader from '@/components/index/IndexHeader';
import IndexMainContent from '@/components/index/IndexMainContent';
import IndexNotifications from '@/components/index/IndexNotifications';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { useUserLocation } from '@/hooks/useUserLocation';

const Index = () => {
  useUserLocation();
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

  // Removed verbose dev logging for performance

  const handleChatRedirect = () => {
    navigate('/chat');
  };

  // Handle user type redirect properly in useEffect
  useEffect(() => {
    if (!loading && !userType) {
      navigate('/user-type');
    }
  }, [loading, userType, navigate]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userType) {
    return <LoadingScreen />;
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
