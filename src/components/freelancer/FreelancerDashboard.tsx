
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import FreelancerPromotionalBanner from './FreelancerPromotionalBanner';
import FreelancerWelcomeSection from './FreelancerWelcomeSection';
import FreelancerQuickActions from './FreelancerQuickActions';
import FreelancerStatsCards from './FreelancerStatsCards';
import FreelancerCategoriesCard from './FreelancerCategoriesCard';
import FreelancerRecentJobsCard from './FreelancerRecentJobsCard';
import { useFreelancerStats } from '@/hooks/useFreelancerStats';
import { useFreelancerJobs } from '@/hooks/useFreelancerJobs';

const FreelancerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { stats, loading: statsLoading } = useFreelancerStats();
  const { recentJobs, loading: jobsLoading } = useFreelancerJobs();

  const userCategories = user?.user_metadata?.categories || ['eletrica', 'hidraulica'];
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';

  if (statsLoading || jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FreelancerPromotionalBanner />
      
      <FreelancerWelcomeSection 
        userName={userName}
        pendingRequests={stats.pendingRequests}
      />

      <FreelancerQuickActions />

      <FreelancerStatsCards stats={stats} />

      <FreelancerCategoriesCard userCategories={userCategories} />

      <FreelancerRecentJobsCard recentJobs={recentJobs} />
    </div>
  );
};

export default FreelancerDashboard;
