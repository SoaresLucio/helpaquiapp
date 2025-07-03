import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FreelancerProfile {
  id: string;
  user_id: string;
  category: string;
  description: string | null;
  hourly_rate: number | null;
  available: boolean | null;
  portfolio_photos: any;
  observations: string | null;
  created_at: string;
  updated_at: string;
  // Joined profile data
  profiles?: {
    first_name: string;
    last_name: string;
    avatar_url: string;
    verified: boolean;
  };
  // Reviews data
  avg_rating?: number;
  review_count?: number;
}

export const useRealFreelancers = (category?: string) => {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load freelancers with profiles and ratings
  const loadFreelancers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('freelancer_profiles')
        .select(`
          *,
          profiles:profiles!inner(
            first_name,
            last_name,
            avatar_url,
            verified
          )
        `)
        .eq('available', true);

      // Filter by category if provided
      if (category) {
        query = query.eq('category', category);
      }

      const { data: freelancerData, error: freelancerError } = await query.order('created_at', { ascending: false });

      if (freelancerError) throw freelancerError;

      // Get ratings for each freelancer
      const freelancersWithRatings = await Promise.all(
        (freelancerData || []).map(async (freelancer) => {
          const { data: ratingsData } = await supabase
            .from('reviews')
            .select('rating')
            .eq('freelancer_id', freelancer.id);

          const ratings = ratingsData || [];
          const avgRating = ratings.length > 0 
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
            : 0;

          return {
            ...freelancer,
            avg_rating: avgRating,
            review_count: ratings.length
          };
        })
      );

      setFreelancers(freelancersWithRatings as unknown as FreelancerProfile[]);
    } catch (err) {
      console.error('Error loading freelancers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Get freelancer by ID
  const getFreelancerById = useCallback(async (freelancerId: string) => {
    try {
      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select(`
          *,
          profiles:profiles!inner(
            first_name,
            last_name,
            avatar_url,
            verified,
            phone,
            email
          )
        `)
        .eq('id', freelancerId)
        .single();

      if (error) throw error;

      // Get reviews for this freelancer
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('freelancer_id', freelancerId)
        .order('created_at', { ascending: false });

      const ratings = reviews?.map(r => r.rating) || [];
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0;

      return {
        ...data,
        avg_rating: avgRating,
        review_count: ratings.length,
        reviews: reviews || []
      };
    } catch (err) {
      console.error('Error loading freelancer:', err);
      throw err;
    }
  }, []);

  // Search freelancers by query
  const searchFreelancers = useCallback(async (searchQuery: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('freelancer_profiles')
        .select(`
          *,
          profiles:profiles!inner(
            first_name,
            last_name,
            avatar_url,
            verified
          )
        `)
        .eq('available', true)
        .or(`description.ilike.%${searchQuery}%,profiles.first_name.ilike.%${searchQuery}%,profiles.last_name.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFreelancers((data || []) as unknown as FreelancerProfile[]);
    } catch (err) {
      console.error('Error searching freelancers:', err);
      setError(err instanceof Error ? err.message : 'Failed to search freelancers');
    } finally {
      setLoading(false);
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('freelancer-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'freelancer_profiles',
          filter: 'available=eq.true'
        },
        () => {
          loadFreelancers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadFreelancers]);

  // Load initial data
  useEffect(() => {
    loadFreelancers();
  }, [loadFreelancers]);

  return {
    freelancers,
    loading,
    error,
    loadFreelancers,
    getFreelancerById,
    searchFreelancers
  };
};