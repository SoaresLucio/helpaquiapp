
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface JobNotification {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  date: string;
  clientName: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  serviceRequestId?: string;
  clientId?: string;
}

export const useJobNotifications = () => {
  const [notifications, setNotifications] = useState<JobNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<JobNotification | null>(null);
  const { userType, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (userType !== 'freelancer' || !user) return;

    // Poll open service_requests from Supabase in real-time
    const fetchOpenRequests = async () => {
      const { data: requests, error } = await supabase
        .from('service_requests')
        .select('id, title, description, category, location_address, budget_min, budget_max, urgency, created_at, client_id')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !requests?.length) return;

      // Fetch client names
      const clientIds = requests.map(r => r.client_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', clientIds);

      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      const mapped: JobNotification[] = requests.map(r => {
        const profile = profileMap[r.client_id];
        const clientName = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Cliente'
          : 'Cliente';

        const budget = r.budget_min && r.budget_max
          ? `R$ ${r.budget_min} - R$ ${r.budget_max}`
          : r.budget_min ? `R$ ${r.budget_min}` : 'A combinar';

        const urgency: JobNotification['urgency'] =
          r.urgency === 'urgent' ? 'urgent'
          : r.urgency === 'high' ? 'high'
          : r.urgency === 'medium' ? 'medium'
          : 'low';

        return {
          id: r.id,
          title: r.title,
          description: r.description || '',
          category: r.category,
          location: r.location_address || 'Não informado',
          budget,
          date: new Date(r.created_at).toLocaleDateString('pt-BR'),
          clientName,
          urgency,
          timestamp: Date.now(),
          serviceRequestId: r.id,
          clientId: r.client_id,
        };
      });

      setNotifications(mapped);

      // Show the most recent notification if none is showing
      setCurrentNotification(prev => {
        if (prev) return prev; // don't override one already visible
        return mapped[0] ?? null;
      });
    };

    fetchOpenRequests();

    // Real-time subscription
    const channel = supabase
      .channel('job-notifications-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'service_requests' },
        () => { fetchOpenRequests(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userType, user]);

  const acceptJob = async (jobId: string) => {
    if (!user) throw new Error('Não autenticado');

    // Insert a service proposal (accept = send proposal with status pending)
    const { error } = await supabase
      .from('service_proposals')
      .insert({
        service_request_id: jobId,
        freelancer_id: user.id,
        message: 'Aceito esta solicitação de serviço e estou disponível.',
        status: 'pending',
      });

    if (error) {
      // If duplicate, just dismiss gracefully
      if (!error.message.includes('duplicate') && !error.message.includes('unique')) {
        throw new Error(error.message);
      }
    }

    setNotifications(prev => prev.filter(n => n.id !== jobId));
    setCurrentNotification(null);
  };

  const rejectJob = async (jobId: string) => {
    // No DB action needed for reject — just dismiss the notification locally
    setNotifications(prev => prev.filter(n => n.id !== jobId));
    setCurrentNotification(null);
  };

  const dismissNotification = () => {
    setCurrentNotification(null);
  };

  return {
    notifications,
    currentNotification,
    acceptJob,
    rejectJob,
    dismissNotification,
  };
};
