
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/index/LoadingScreen';
import IndexLayoutWrapper from '@/components/index/IndexLayoutWrapper';
import IndexHeader from '@/components/index/IndexHeader';
import IndexMainContent from '@/components/index/IndexMainContent';
import IndexNotifications from '@/components/index/IndexNotifications';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/user/useUserData';

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

  const { currentUser } = useUserData(authUser, userType);

  // Debug: Log renders e mudanças de estado
  useEffect(() => {
    console.log('🏠 Index component mounted/re-rendered');
    console.log('📊 Index state:', {
      userType,
      loading,
      authUser: authUser?.id,
      selectedCategory,
      activeTab,
      currentNotification: !!currentNotification,
      currentUser: !!currentUser
    });
  });

  // Debug: Log mudanças de userType
  useEffect(() => {
    console.log('👤 UserType changed:', userType);
    if (!userType && !loading) {
      console.log('🔄 Redirecting to user-type selection...');
    }
  }, [userType, loading]);

  // Debug: Log mudanças de loading
  useEffect(() => {
    console.log('⏳ Loading state changed:', loading);
  }, [loading]);

  // Debug: Log mudanças de authUser
  useEffect(() => {
    console.log('🔐 Auth user changed:', authUser?.id);
  }, [authUser]);

  const handleChatRedirect = () => {
    console.log('💬 Chat redirect triggered');
    navigate('/chat');
  };

  if (loading) {
    console.log('⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  if (!userType) {
    console.log('🚫 No userType, redirecting to user-type selection');
    navigate('/user-type');
    return null;
  }

  console.log('✅ Rendering main Index content');

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
