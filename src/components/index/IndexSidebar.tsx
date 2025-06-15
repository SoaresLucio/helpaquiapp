
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import SidebarTabs from './sidebar/SidebarTabs';
import SidebarContent from './sidebar/SidebarContent';
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
        <SidebarTabs 
          userType={userType}
          onChatRedirect={onChatRedirect}
        />
        
        <SidebarContent 
          userType={userType}
          currentUser={currentUser}
        />
      </Tabs>
    </div>
  );
};

export default IndexSidebar;
