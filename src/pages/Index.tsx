
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
import { mockUsers } from '@/data/mockData';
import { 
  MapPin,
  MessageCircle,
  PhoneCall,
  User
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { userType, loading } = useAuth();
  const { currentNotification, acceptJob, rejectJob, dismissNotification } = useJobNotifications();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redirecionar usuário se não tiver tipo definido
  if (!userType) {
    window.location.href = '/user-type-selection';
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
          {/* Main Content */}
          <div className="flex-1">
            {userType === 'solicitante' ? (
              <SolicitanteHome 
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            ) : (
              <FreelancerHome />
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-[400px] space-y-4">
            <Tabs defaultValue="actions" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="actions">
                  {userType === "freelancer" ? "Oferecer" : "Solicitar"}
                </TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
              </TabsList>
              
              <TabsContent value="actions">
                {userType === "freelancer" ? (
                  <OfferHelp />
                ) : (
                  <ServiceRequest />
                )}
              </TabsContent>
              
              <TabsContent value="chat">
                <ChatInterface 
                  recipientId={mockUsers[1].id}
                  recipientName={mockUsers[1].name}
                  recipientAvatar={mockUsers[1].avatar}
                />
              </TabsContent>
              
              <TabsContent value="profile">
                <UserProfile user={mockUsers[0]} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around p-2 z-10">
        <button className="flex flex-col items-center p-2">
          <MapPin className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">
            {userType === "freelancer" ? "Oferecer" : "Solicitar"}
          </span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <MessageCircle className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <PhoneCall className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Contatos</span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <User className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Index;
