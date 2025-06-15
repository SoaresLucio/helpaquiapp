
import { supabase } from '@/integrations/supabase/client';
import { FreelancerProfile } from '@/types/freelancer';

interface FetchFreelancersOptions {
  category?: string;
  sortBy?: string;
}

// Type for creating a new freelancer profile that matches Supabase requirements
interface CreateFreelancerData {
  user_id: string;
  category: string;
  description?: string;
  portfolio_photos?: any[];
  observations?: string;
  hourly_rate?: number;
  available?: boolean;
}

export const fetchRecommendedFreelancers = async (options: FetchFreelancersOptions = {}): Promise<FreelancerProfile[]> => {
  const { category, sortBy } = options;
  
  let query = supabase
    .from('freelancer_profiles')
    .select(`
      *,
      user_profile:profiles(
        first_name,
        last_name,
        avatar_url,
        verified
      )
    `)
    .eq('available', true);

  // Filtrar por categoria se especificado
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Ordenação
  switch (sortBy) {
    case 'price_low':
      query = query.order('hourly_rate', { ascending: true, nullsFirst: true });
      break;
    case 'price_high':
      query = query.order('hourly_rate', { ascending: false, nullsFirst: true });
      break;
    case 'recent':
      query = query.order('created_at', { ascending: false });
      break;
    case 'rating':
    default:
      // Por enquanto ordenar por data, posteriormente implementar por avaliação
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching freelancers:', error);
    throw error;
  }

  // Transform the data to match our interface
  const transformedData = (data || []).map(item => ({
    ...item,
    portfolio_photos: Array.isArray(item.portfolio_photos) ? item.portfolio_photos : []
  })) as FreelancerProfile[];

  return transformedData;
};

export const fetchFreelancerById = async (id: string): Promise<FreelancerProfile | null> => {
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .select(`
      *,
      user_profile:profiles(
        first_name,
        last_name,
        avatar_url,
        verified,
        phone,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching freelancer:', error);
    throw error;
  }

  if (!data) return null;

  // Transform the data to match our interface
  const transformedData = {
    ...data,
    portfolio_photos: Array.isArray(data.portfolio_photos) ? data.portfolio_photos : []
  } as FreelancerProfile;

  return transformedData;
};

export const createFreelancerProfile = async (profileData: CreateFreelancerData): Promise<FreelancerProfile> => {
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .insert(profileData)
    .select()
    .single();

  if (error) {
    console.error('Error creating freelancer profile:', error);
    throw error;
  }

  // Transform the data to match our interface
  const transformedData = {
    ...data,
    portfolio_photos: Array.isArray(data.portfolio_photos) ? data.portfolio_photos : []
  } as FreelancerProfile;

  return transformedData;
};

export const updateFreelancerProfile = async (id: string, profileData: Partial<FreelancerProfile>): Promise<FreelancerProfile> => {
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .update(profileData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating freelancer profile:', error);
    throw error;
  }

  // Transform the data to match our interface
  const transformedData = {
    ...data,
    portfolio_photos: Array.isArray(data.portfolio_photos) ? data.portfolio_photos : []
  } as FreelancerProfile;

  return transformedData;
};

// Função para buscar freelancers para a página inicial do solicitante
export const fetchFreelancersForHome = async (limit: number = 3): Promise<FreelancerProfile[]> => {
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .select(`
      *,
      user_profile:profiles(
        first_name,
        last_name,
        avatar_url,
        verified
      )
    `)
    .eq('available', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching freelancers for home:', error);
    throw error;
  }

  // Transform the data to match our interface
  const transformedData = (data || []).map(item => ({
    ...item,
    portfolio_photos: Array.isArray(item.portfolio_photos) ? item.portfolio_photos : []
  })) as FreelancerProfile[];

  return transformedData;
};
