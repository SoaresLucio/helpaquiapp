
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import CategorySelector from '@/components/CategorySelector';
import PushNotification from '@/components/notifications/PushNotification';
import LoadingScreen from '@/components/index/LoadingScreen';
import MainContent from '@/components/index/MainContent';
import IndexSidebar from '@/components/index/IndexSidebar';
import MobileNavigation from '@/components/index/MobileNavigation';
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

  const handleMobileNavigation = (section: string) => {
    if (section === 'chat') {
      navigate('/chat');
    } else {
      setActiveTab(section);
    }
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      {/* Push Notification Overlay */}
      {currentNotification && (
        <PushNotification 
          job={currentNotification} 
          onAccept={acceptJob} 
          onReject={rejectJob} 
          onClose={dismissNotification} 
        />
      )}
      
      <main className="flex-1 helpaqui-container py-4">
        {/* Category Selector - Only for Solicitantes */}
        {userType === 'solicitante' && (
          <CategorySelector 
            onSelectCategory={setSelectedCategory} 
            selectedCategory={selectedCategory} 
          />
        )}
        
        <div className="flex flex-col lg:flex-row gap-6">
          <MainContent 
            userType={userType}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          
          <IndexSidebar 
            userType={userType}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onChatRedirect={handleChatRedirect}
            currentUser={currentUser}
          />
        </div>
      </main>
      
      <MobileNavigation 
        userType={userType}
        onNavigate={handleMobileNavigation}
      />
    </div>
  );
};

export default Index;
