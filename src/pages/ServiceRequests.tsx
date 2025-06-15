
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ServiceRequestsHeader from '@/components/service-requests/ServiceRequestsHeader';
import ServiceRequestsLoading from '@/components/service-requests/ServiceRequestsLoading';
import ServiceRequestsEmpty from '@/components/service-requests/ServiceRequestsEmpty';
import ServiceRequestsList from '@/components/service-requests/ServiceRequestsList';
import ServiceRequestFilters from '@/components/service-requests/ServiceRequestFilters';

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

const ServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const { toast } = useToast();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userType === 'freelancer') {
      fetchServiceRequests();
    }
  }, [isAuthenticated, userType, selectedCategory, selectedUrgency]);

  const fetchServiceRequests = async () => {
    try {
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

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedUrgency && selectedUrgency !== 'all') {
        query = query.eq('urgency', selectedUrgency);
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
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not freelancer
  if (!isAuthenticated || userType !== 'freelancer') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600">Esta página é exclusiva para freelancers.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ServiceRequestsLoading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ServiceRequestsHeader />
      
      <ServiceRequestFilters
        selectedCategory={selectedCategory}
        selectedUrgency={selectedUrgency}
        onCategoryChange={setSelectedCategory}
        onUrgencyChange={setSelectedUrgency}
      />

      {requests.length === 0 ? (
        <ServiceRequestsEmpty />
      ) : (
        <ServiceRequestsList requests={requests} />
      )}
    </div>
  );
};

export default ServiceRequests;
