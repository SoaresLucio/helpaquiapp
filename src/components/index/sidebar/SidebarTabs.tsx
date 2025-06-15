
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SidebarTabsProps {
  userType: 'solicitante' | 'freelancer' | null;
  onChatRedirect: () => void;
}

const SidebarTabs: React.FC<SidebarTabsProps> = ({ userType, onChatRedirect }) => {
  return (
    <TabsList className="grid grid-cols-2 mb-4">
      <TabsTrigger value="actions">
        {userType === "freelancer" ? "Oferecer" : "Solicitar"}
      </TabsTrigger>
      <TabsTrigger value="chat" onClick={onChatRedirect}>Chat</TabsTrigger>
    </TabsList>
  );
};

export default SidebarTabs;
