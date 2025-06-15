
import { useState, useEffect } from 'react';

interface FreelancerStats {
  completedJobs: number;
  averageRating: number;
  totalEarnings: string;
  pendingRequests: number;
  responseTime: string;
  responseRate: number;
}

export const useFreelancerStats = () => {
  const [stats, setStats] = useState<FreelancerStats>({
    completedJobs: 47,
    averageRating: 4.8,
    totalEarnings: 'R$ 12.450',
    pendingRequests: 3,
    responseTime: '2h',
    responseRate: 98
  });
  const [loading, setLoading] = useState(false);

  // In a real app, this would fetch data from API
  useEffect(() => {
    // Mock loading state
    setLoading(false);
  }, []);

  return { stats, loading };
};
