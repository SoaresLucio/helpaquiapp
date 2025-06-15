
import { useState, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  client: string;
  date: string;
  status: string;
  rating: number | null;
  amount: string;
}

export const useFreelancerJobs = () => {
  const [recentJobs, setRecentJobs] = useState<Job[]>([
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
  ]);
  const [loading, setLoading] = useState(false);

  // In a real app, this would fetch data from API
  useEffect(() => {
    setLoading(false);
  }, []);

  return { recentJobs, loading };
};
