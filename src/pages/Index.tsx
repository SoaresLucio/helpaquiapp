
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/index/LoadingScreen';
import IndexLayoutWrapper from '@/components/index/IndexLayoutWrapper';
import IndexHeader from '@/components/index/IndexHeader';
import IndexMainContent from '@/components/index/IndexMainContent';
import IndexNotifications from '@/components/index/IndexNotifications';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { useRouteProtection } from '@/hooks/useRouteProtection';
import { useUserData } from '@/hooks/useUserData';

const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('actions');
  
  // Use route protection hook that handles all authentication logic
  const { 
    isAuthenticated, 
    userType, 
    loading, 
    hasAccess 
  } = useRouteProtection();

  // Get current user data
  const { currentUser } = useUserData(null, userType);

  const {
    currentNotification,
    acceptJob,
    rejectJob,
    dismissNotification
  } = useJobNotifications();

  console.log('🏠 Index render:', {
    userType,
    loading,
    isAuthenticated,
    hasAccess,
    selectedCategory,
    activeTab
  });

  const handleChatRedirect = () => {
    console.log('💬 Chat redirect triggered');
    navigate('/chat');
  };

  // Show loading while checking authentication
  if (loading) {
    console.log('⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  // Route protection hook handles all redirects automatically
  if (!hasAccess) {
    console.log('🚫 No access, route protection will handle redirect');
    return <LoadingScreen />;
  }

  console.log('✅ Rendering main Index content for userType:', userType);

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
