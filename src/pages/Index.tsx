import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategorySelector from '@/components/CategorySelector';
import ServiceRequest from '@/components/ServiceRequest';
import OfferHelp from '@/components/OfferHelp';
import ChatInterface from '@/components/ChatInterface';
import UserProfile from '@/components/UserProfile';
import SolicitanteHome from '@/components/solicitante/SolicitanteHome';
import FreelancerHome from '@/components/freelancer/FreelancerHome';
import PushNotification from '@/components/notifications/PushNotification';
import { useJobNotifications } from '@/hooks/useJobNotifications';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, MessageCircle, PhoneCall, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';

// Remove mock data imports and create real user interface
interface RealUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  type: 'client' | 'professional';
  rating?: number;
  isVerified?: boolean;
}
const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<RealUser | null>(null);
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

  // Fetch real user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) return;
      try {
        const {
          data: profile,
          error
        } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle();
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        // Create user object with real data
        const realUser: RealUser = {
          id: authUser.id,
          name: profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          phone: profile?.phone || '',
          avatar: profile?.avatar_url || '/placeholder.svg',
          type: userType === 'freelancer' ? 'professional' : 'client',
          isVerified: authUser.email_confirmed_at ? true : false
        };
        setCurrentUser(realUser);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };
    fetchUserData();
  }, [authUser, userType]);
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
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>;
  }

  // Redirect if no user type is defined
  if (!userType) {
    window.location.href = '/user-type-selection';
    return null;
  }
  return <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      {/* Push Notification Overlay */}
      {currentNotification && <PushNotification job={currentNotification} onAccept={acceptJob} onReject={rejectJob} onClose={dismissNotification} />}
      
      <main className="flex-1 helpaqui-container py-4">
        {/* Category Selector - Only for Solicitantes */}
        {userType === 'solicitante' && <CategorySelector onSelectCategory={setSelectedCategory} selectedCategory={selectedCategory} />}
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {userType === 'solicitante' ? <SolicitanteHome selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} /> : <FreelancerHome />}
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-[400px] space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="actions">
                  {userType === "freelancer" ? "Oferecer" : "Solicitar"}
                </TabsTrigger>
                <TabsTrigger value="chat" onClick={handleChatRedirect}>Chat</TabsTrigger>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
              </TabsList>
              
              <TabsContent value="actions">
                {userType === "freelancer" ? <OfferHelp /> : <ServiceRequest />}
              </TabsContent>
              
              <TabsContent value="chat">
                {/* Only show chat if we have real user data */}
                {currentUser && <ChatInterface recipientId="placeholder" // This should be replaced with real chat logic
              recipientName="Sistema" recipientAvatar="/placeholder.svg" />}
              </TabsContent>
              
              <TabsContent value="profile">
                {/* Only show profile if we have real user data */}
                {currentUser && <UserProfile user={currentUser} />}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around p-2 z-10">
        <button 
          className="flex flex-col items-center p-2"
          onClick={() => handleMobileNavigation('actions')}
        >
          <MapPin className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">
            {userType === "freelancer" ? "Oferecer" : "Solicitar"}
          </span>
        </button>
        
        <button 
          className="flex flex-col items-center p-2"
          onClick={() => handleMobileNavigation('chat')}
        >
          <MessageCircle className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Bate Papo</span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <PhoneCall className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Contatos</span>
        </button>
        
        <button 
          className="flex flex-col items-center p-2"
          onClick={() => handleMobileNavigation('profile')}
        >
          <User className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>;
};
export default Index;
