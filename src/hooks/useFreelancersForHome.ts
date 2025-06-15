
import { useQuery } from '@tanstack/react-query';
import { fetchFreelancersForHome } from '@/services/freelancersService';

export const useFreelancersForHome = (limit: number = 3) => {
  return useQuery({
    queryKey: ['freelancers-for-home', limit],
    queryFn: () => fetchFreelancersForHome(limit),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 30 * 1000, // Refetch a cada 30 segundos para mostrar novas ofertas
  });
};
