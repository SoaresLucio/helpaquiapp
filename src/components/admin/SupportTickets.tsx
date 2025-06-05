
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Send } from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

const SupportTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    try {
      // First get tickets based on filter
      let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: ticketsData, error } = await query;

      if (error) throw error;

      // Then get profile information for each ticket
      const ticketsWithProfiles = await Promise.all(
        (ticketsData || []).map(async (ticket) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', ticket.user_id)
            .single();

          return {
            ...ticket,
            profiles: profile
          };
        })
      );

      setTickets(ticketsWithProfiles);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          message: newMessage,
          is_admin: true
        }]);

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedTicket.id);
      toast({ title: 'Mensagem enviada com sucesso!' });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          ...(status === 'resolved' && { resolved_at: new Date().toISOString() })
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({ title: `Ticket ${status === 'resolved' ? 'resolvido' : 'atualizado'} com sucesso!` });
      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Aberto</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-500"><AlertCircle className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500">Média</Badge>;
      case 'low':
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suporte ao Usuário</h1>
          <p className="text-gray-600">Gerencie tickets de suporte</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tickets</SelectItem>
            <SelectItem value="open">Abertos</SelectItem>
            <SelectItem value="in_progress">Em andamento</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Usuário: {ticket.profiles?.first_name} {ticket.profiles?.last_name}
                  </p>
                  {ticket.category && (
                    <p className="text-sm text-gray-600">
                      Categoria: {ticket.category}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Criado em: {formatDate(ticket.created_at)}
                  </p>
                  {ticket.description && (
                    <p className="text-sm text-gray-700 mt-2 max-w-2xl">
                      {ticket.description.length > 100 
                        ? `${ticket.description.substring(0, 100)}...` 
                        : ticket.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          fetchMessages(ticket.id);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ver Conversa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {ticket.subject}
                          <div className="flex gap-2 mt-2">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Descrição Inicial:</h4>
                          <p className="text-sm">{ticket.description}</p>
                        </div>

                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`p-3 rounded-lg ${
                                message.is_admin 
                                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                                  : 'bg-gray-50 border-l-4 border-gray-300'
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium">
                                  {message.is_admin ? 'Administrador' : 'Usuário'}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(message.created_at)}
                                </span>
                              </div>
                              <p className="text-sm">{message.message}</p>
                            </div>
                          ))}
                        </div>

                        {selectedTicket?.status !== 'resolved' && (
                          <form onSubmit={handleSendMessage} className="space-y-3">
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Digite sua resposta..."
                              rows={3}
                              required
                            />
                            <div className="flex gap-2">
                              <Button type="submit" className="flex-1">
                                <Send className="h-4 w-4 mr-2" />
                                Enviar Resposta
                              </Button>
                            </div>
                          </form>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                          {selectedTicket?.status === 'open' && (
                            <Button 
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'in_progress')}
                              variant="outline"
                            >
                              Marcar como Em Andamento
                            </Button>
                          )}
                          {selectedTicket?.status !== 'resolved' && (
                            <Button 
                              onClick={() => handleUpdateTicketStatus(ticket.id, 'resolved')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Resolvido
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tickets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum ticket encontrado</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Não há tickets de suporte no momento.' 
                : `Não há tickets com status "${filter}".`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupportTickets;
