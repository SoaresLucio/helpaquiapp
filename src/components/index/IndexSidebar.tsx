
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceRequest from '@/components/ServiceRequest';
import OfferHelp from '@/components/OfferHelp';
import ChatInterface from '@/components/ChatInterface';
import { RealUser } from '@/types/user';

interface IndexSidebarProps {
  userType: 'solicitante' | 'freelancer' | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onChatRedirect: () => void;
  currentUser: RealUser | null;
}

const IndexSidebar: React.FC<IndexSidebarProps> = ({
  userType,
  activeTab,
  onTabChange,
  onChatRedirect,
  currentUser
}) => {
  return (
    <div className="w-full lg:w-[400px] space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="actions">
            {userType === "freelancer" ? "Oferecer" : "Solicitar"}
          </TabsTrigger>
          <TabsTrigger value="chat" onClick={onChatRedirect}>Chat</TabsTrigger>
        </TabsList>
        
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
      </Tabs>
    </div>
  );
};

export default IndexSidebar;
