
import { useQuery } from '@tanstack/react-query';
import { fetchFreelancersForHome } from '@/services/freelancersService';

export const useFreelancersForHome = (limit: number = 3) => {
  return useQuery({
    queryKey: ['freelancers-for-home', limit],
    queryFn: () => fetchFreelancersForHome(limit),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 15 * 1000, // Refetch a cada 15 segundos para mostrar novas ofertas rapidamente
    refetchOnWindowFocus: true, // Refetch quando a janela ganhar foco
  });
};
