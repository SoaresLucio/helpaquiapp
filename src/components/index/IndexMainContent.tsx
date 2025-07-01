
import React from 'react';
import MainContent from '@/components/index/MainContent';
import IndexSidebar from '@/components/index/IndexSidebar';
import { RealUser } from '@/types/user';

interface IndexMainContentProps {
  userType: 'solicitante' | 'freelancer' | null;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onChatRedirect: () => void;
  currentUser: RealUser | null;
}

const IndexMainContent: React.FC<IndexMainContentProps> = ({
  userType,
  selectedCategory,
  onSelectCategory,
  activeTab,
  onTabChange,
  onChatRedirect,
  currentUser
}) => {
  return (
    <main className="flex-1 helpaqui-container py-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <MainContent 
          userType={userType}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
        
        <IndexSidebar 
          userType={userType}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onChatRedirect={onChatRedirect}
          currentUser={currentUser}
        />
      </div>
    </main>
  );
};

export default IndexMainContent;
