import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, Calendar, Clock, MessageCircle, Eye, Check, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { serviceCategories } from '@/data/mockData';

interface ServiceRequestWithClient {
  id: string;
  title: string;
  description: string | null;
  category: string;
  approx_address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string | null;
  created_at: string;
  client_id: string;
  client: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface HelpRequestsListProps {
  onStartConversation?: (clientId: string) => void;
  onViewProfile?: (clientId: string) => void;
  onAcceptRequest?: (requestId: string) => void;
}

const HelpRequestsList: React.FC<HelpRequestsListProps> = ({
  onStartConversation,
  onViewProfile,
  onAcceptRequest
}) => {
  const [requests, setRequests] = useState<ServiceRequestWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHelpRequests();
  }, [selectedCategory]);

  useEffect(() => {
    // Real-time subscription for new requests
    const channel = supabase
      .channel('service_requests_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests'
        },
        () => {
          fetchHelpRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedCategory]);

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('service_requests_public' as any)
        .select('id, title, description, category, approx_address, budget_min, budget_max, urgency, created_at, client_id')
        .order('created_at', { ascending: false });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data: requestsRawData, error } = await query;
      const requestsData = (requestsRawData ?? []) as unknown as Array<Omit<ServiceRequestWithClient, 'client'>>;

      if (error) {
        console.error('Error fetching service requests:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar solicitações de help",
          variant: "destructive",
        });
        return;
      }

      // Fetch client profiles separately
      const clientIds = requestsData.map(req => req.client_id);
      const { data: profilesData } = await supabase
        .from('public_profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', clientIds);

      // Transform data to match interface
      const transformedData: ServiceRequestWithClient[] = requestsData.map(request => {
        const clientProfile = profilesData?.find(profile => profile.id === request.client_id);
        return {
          ...request,
          client: clientProfile || null
        };
      });

      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching help requests:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar solicitações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (clientId: string, requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Create or get conversation - freelancer is the current user, client is the request owner
      const { data: conversationData, error: conversationError } = await supabase.functions.invoke('create-conversation', {
        body: {
          freelancerId: user.id, // Current user (freelancer)
          serviceRequestId: requestId
        }
      });

      if (conversationError) {
        console.error('Error creating conversation:', conversationError);
        toast({
          title: "Erro",
          description: "Erro ao iniciar conversa",
          variant: "destructive",
        });
        return;
      }

      if (onStartConversation) {
        onStartConversation(clientId);
      } else {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao iniciar conversa",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      // Create service proposal
      const { error } = await supabase
        .from('service_proposals')
        .insert({
          service_request_id: requestId,
          freelancer_id: user.id,
          message: 'Aceito esta solicitação de serviço',
          status: 'pending'
        });

      if (error) {
        console.error('Error accepting request:', error);
        toast({
          title: "Erro",
          description: "Erro ao aceitar solicitação",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Solicitação aceita",
        description: "Sua proposta foi enviada ao cliente",
      });

      if (onAcceptRequest) {
        onAcceptRequest(requestId);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao aceitar solicitação",
        variant: "destructive",
      });
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'A combinar';
    if (min && max && min !== max) return `R$ ${min} - R$ ${max}`;
    if (min) return `R$ ${min}`;
    if (max) return `R$ ${max}`;
    return 'A combinar';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getClientName = (client: ServiceRequestWithClient['client']) => {
    if (!client) return 'Cliente';
    if (client.first_name && client.last_name) {
      return `${client.first_name} ${client.last_name}`;
    }
    return client.first_name || 'Cliente';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-48" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="flex items-center gap-4 mb-6">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {serviceCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Solicitações de Help Disponíveis ({requests.length})
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {selectedCategory === 'all' 
                ? 'Nenhuma solicitação de help disponível no momento'
                : 'Nenhuma solicitação encontrada para esta categoria'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Client Avatar */}
                  <div className="flex-shrink-0">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={request.client?.avatar_url || undefined} 
                        alt={getClientName(request.client)} 
                      />
                      <AvatarFallback>
                        {getClientName(request.client).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Request Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Por: {getClientName(request.client)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{request.category}</Badge>
                        {request.urgency === 'urgent' && (
                          <Badge variant="destructive">Urgente</Badge>
                        )}
                      </div>
                    </div>

                    {request.description && (
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {request.description}
                      </p>
                    )}

                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {request.location_address && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {request.location_address}
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {formatBudget(request.budget_min, request.budget_max)}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatDate(request.created_at)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartConversation(request.client?.id || '', request.id)}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Conversar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (onViewProfile && request.client) {
                            onViewProfile(request.client.id);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Perfil
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Aceitar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HelpRequestsList;