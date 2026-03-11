
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ServiceRequest from '@/components/ServiceRequest';
import OfferHelp from '@/components/OfferHelp';
import ChatInterface from '@/components/ChatInterface';
import { RealUser } from '@/types/user';

interface SidebarContentProps {
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
  currentUser: RealUser | null;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ userType, currentUser }) => {
  return (
    <>
      <TabsContent value="actions">
        {userType === "freelancer" ? <OfferHelp /> : <ServiceRequest />}
      </TabsContent>
      
      <TabsContent value="chat">
        {/* Only show chat if we have real user data */}
        {currentUser && (
          <ChatInterface 
            recipientId="placeholder" // This should be replaced with real chat logic
            recipientName="Sistema" 
            recipientAvatar="/placeholder.svg" 
          />
        )}
      </TabsContent>
    </>
  );
};

export default SidebarContent;
