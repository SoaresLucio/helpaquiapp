
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  budget_min: number;
  budget_max: number;
  status: string;
  urgency: string;
  created_at: string;
  client_id: string;
  client_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface UseServiceRequestsParams {
  category?: string;
  urgency?: string;
  enabled?: boolean;
}

export const useServiceRequests = ({ category, urgency, enabled = true }: UseServiceRequestsParams = {}) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchServiceRequests = async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('service_requests')
        .select(`
          id,
          title,
          description,
          category,
          location_address,
          budget_min,
          budget_max,
          status,
          urgency,
          created_at,
          client_id
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (urgency && urgency !== 'all') {
        query = query.eq('urgency', urgency);
      }

      const { data: serviceRequests, error: requestsError } = await query;

      if (requestsError) throw requestsError;

      // Fetch client profiles separately
      const clientIds = serviceRequests?.map(req => req.client_id) || [];
      let profiles: any[] = [];
      
      if (clientIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', clientIds);

        if (profilesError) {
          console.log('Error fetching profiles:', profilesError);
        } else {
          profiles = profilesData || [];
        }
      }

      // Transform the data to match our interface
      const transformedData: ServiceRequest[] = (serviceRequests || []).map(item => {
        const clientProfile = profiles.find(profile => profile.id === item.client_id);
        
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          location_address: item.location_address,
          budget_min: item.budget_min,
          budget_max: item.budget_max,
          status: item.status,
          urgency: item.urgency,
          created_at: item.created_at,
          client_id: item.client_id,
          client_profile: clientProfile ? {
            first_name: clientProfile.first_name || '',
            last_name: clientProfile.last_name || ''
          } : {
            first_name: '',
            last_name: ''
          }
        };
      });

      setRequests(transformedData);
    } catch (error: any) {
      console.log('Error fetching service requests:', error);
      setError(error.message);
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceRequests();
  }, [category, urgency, enabled]);

  return {
    requests,
    loading,
    error,
    refetch: fetchServiceRequests
  };
};
