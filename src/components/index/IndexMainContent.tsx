
import React from 'react';
import MainContent from '@/components/index/MainContent';
import IndexSidebar from '@/components/index/IndexSidebar';
import HomePageSections from '@/components/home/HomePageSections';
import { RealUser } from '@/types/user';

interface IndexMainContentProps {
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
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
    <div className="flex-1 flex flex-col">
      {/* ── Marketing sections (Workana-style) ── */}
      <HomePageSections />

      {/* ── Authenticated user action area ── */}
      <main className="helpaqui-container py-6">
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
    </div>
  );
};

export default IndexMainContent;
