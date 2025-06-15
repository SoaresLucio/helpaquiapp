
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@/components/index/LoadingScreen';
import IndexLayoutWrapper from '@/components/index/IndexLayoutWrapper';
import IndexHeader from '@/components/index/IndexHeader';
import IndexMainContent from '@/components/index/IndexMainContent';
import IndexNotifications from '@/components/index/IndexNotifications';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useUserData } from '@/hooks/useUserData';

const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('actions');
  
  const {
    userType,
    loading,
    user: authUser,
    isAuthenticated,
    isUserValid,
    securityErrors
  } = useSecureAuth();
  
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
      isAuthenticated,
      isUserValid,
      authUser: authUser?.id,
      selectedCategory,
      activeTab,
      currentNotification: !!currentNotification,
      currentUser: !!currentUser,
      securityErrors
    });
  });

  // Segurança: Verificar se há problemas de validação do usuário
  useEffect(() => {
    if (!loading && isAuthenticated && !isUserValid) {
      console.error('🔒 Security issue detected, redirecting to login:', securityErrors);
      navigate('/login');
      return;
    }
  }, [loading, isAuthenticated, isUserValid, securityErrors, navigate]);

  // Debug: Log mudanças de userType
  useEffect(() => {
    console.log('👤 UserType changed:', userType);
    if (!userType && !loading && isAuthenticated) {
      console.log('🔄 Redirecting to user-type selection...');
      navigate('/user-type');
    }
  }, [userType, loading, isAuthenticated, navigate]);

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

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    console.log('⏳ Showing loading screen');
    return <LoadingScreen />;
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    navigate('/login');
    return null;
  }

  // Verificar problemas de segurança
  if (!isUserValid) {
    console.log('🔒 User validation failed, redirecting to login');
    navigate('/login');
    return null;
  }

  // Redirecionar para seleção de tipo se não tem userType
  if (!userType) {
    console.log('🚫 No userType, redirecting to user-type selection');
    navigate('/user-type');
    return null;
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
