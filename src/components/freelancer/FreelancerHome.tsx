
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import FreelancerPromotionalBanner from './FreelancerPromotionalBanner';
import FreelancerWelcomeSection from './FreelancerWelcomeSection';
import FreelancerQuickActions from './FreelancerQuickActions';
import FreelancerStatsCards from './FreelancerStatsCards';
import FreelancerCategoriesCard from './FreelancerCategoriesCard';
import FreelancerRecentJobsCard from './FreelancerRecentJobsCard';

const FreelancerHome: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data - in a real app, this would come from the API
  const stats = {
    completedJobs: 47,
    averageRating: 4.8,
    totalEarnings: 'R$ 12.450',
    pendingRequests: 3,
    responseTime: '2h',
    responseRate: 98
  };

  const recentJobs = [
    {
      id: '1',
      title: 'Instalação elétrica residencial',
      client: 'Maria Silva',
      date: '2024-01-15',
      status: 'completed',
      rating: 5,
      amount: 'R$ 350'
    },
    {
      id: '2',
      title: 'Reparo de torneira',
      client: 'João Santos',
      date: '2024-01-12',
      status: 'completed',
      rating: 4.5,
      amount: 'R$ 120'
    },
    {
      id: '3',
      title: 'Limpeza residencial',
      client: 'Ana Costa',
      date: '2024-01-10',
      status: 'pending',
      rating: null,
      amount: 'R$ 200'
    }
  ];

  // Get user categories from user metadata or default categories
  const userCategories = user?.user_metadata?.categories || ['eletrica', 'hidraulica'];
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Usuário';

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

export default FreelancerHome;
