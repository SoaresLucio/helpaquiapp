
import { supabase } from "@/integrations/supabase/client";

export interface ServiceRequest {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  category: string;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  urgency: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceProposal {
  id: string;
  service_request_id: string;
  freelancer_id: string;
  message: string | null;
  proposed_price: number | null;
  estimated_time: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const getServiceRequests = async (): Promise<ServiceRequest[]> => {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching service requests:', error);
    throw new Error('Erro ao buscar solicitações de serviço');
  }

  return data || [];
};

export const getServiceRequestsByCategory = async (category: string): Promise<ServiceRequest[]> => {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('status', 'open')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching service requests by category:', error);
    throw new Error('Erro ao buscar solicitações por categoria');
  }

  return data || [];
};

export const createServiceProposal = async (
  serviceRequestId: string,
  message: string,
  proposedPrice: number,
  estimatedTime: string
): Promise<ServiceProposal> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }

  const { data, error } = await supabase
    .from('service_proposals')
    .insert({
      service_request_id: serviceRequestId,
      freelancer_id: user.id,
      message,
      proposed_price: proposedPrice,
      estimated_time: estimatedTime,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating service proposal:', error);
    throw new Error('Erro ao criar proposta de serviço');
  }

  return data;
};
