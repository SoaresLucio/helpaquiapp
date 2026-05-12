
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Clock, DollarSign, Users, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMyRequests } from '@/hooks/useMyRequests';
import { useRequestApplications } from '@/hooks/useRequestApplications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AsaasPaymentButton from '@/components/payment/AsaasPaymentButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } };

const MyRequests: React.FC = () => {
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  const { requests, loading, deleteRequest } = useMyRequests();

  React.useEffect(() => {
    if (userType && userType !== 'solicitante') navigate('/dashboard');
  }, [userType, navigate]);

  if (!userType || userType !== 'solicitante') {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando seus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Pedidos de Ajuda</h1>
            <p className="text-muted-foreground">Gerencie todos os seus pedidos de serviço</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="gradient-primary text-white border-0 shadow-lg shadow-primary/25 rounded-xl">Novo Pedido</Button>
        </motion.div>
        {requests.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum pedido criado</h3>
                <p className="text-muted-foreground mb-4">Você ainda não criou nenhum pedido de ajuda.</p>
                <Button onClick={() => navigate('/dashboard')} className="gradient-primary text-white border-0 rounded-xl">Criar Primeiro Pedido</Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
            {requests.map((request) => (
              <motion.div key={request.id} variants={fadeUp}>
                <RequestCard request={request} onDelete={deleteRequest} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

interface RequestCardProps { request: any; onDelete: (requestId: string) => Promise<void>; }

const RequestCard: React.FC<RequestCardProps> = ({ request, onDelete }) => {
  const { applications, loading, reloadApplications } = useRequestApplications(request.id);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [payingApp, setPayingApp] = React.useState<any | null>(null);
  const [completing, setCompleting] = React.useState(false);

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir este pedido? Cancelamentos consecutivos podem bloquear sua conta.')) {
      setIsDeleting(true);
      try { await onDelete(request.id); } catch {} finally { setIsDeleting(false); }
    }
  };

  const handleReject = async (appId: string) => {
    const { error } = await supabase.from('service_applications').update({ status: 'rejected' }).eq('id', appId);
    if (error) toast.error('Erro ao rejeitar candidatura'); else { toast.success('Candidatura rejeitada'); reloadApplications(); }
  };

  const handleAcceptStart = (app: any) => setPayingApp(app);

  const handlePaymentComplete = async () => {
    if (!payingApp) return;
    const { error } = await supabase.from('service_applications').update({ status: 'accepted' }).eq('id', payingApp.id);
    if (!error) {
      await supabase.from('service_requests').update({ status: 'in_progress' }).eq('id', request.id);
      toast.success('Orçamento aceito e pagamento processado!');
    }
    setPayingApp(null);
    reloadApplications();
  };

  const handleMarkCompleted = async () => {
    if (!window.confirm('Marcar este serviço como concluído? O pagamento será liberado ao freelancer.')) return;
    setCompleting(true);
    try {
      const { error } = await supabase.rpc('mark_service_completed', { p_request_id: request.id });
      if (error) throw error;
      toast.success('Serviço concluído. Pagamento liberado!');
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao concluir serviço');
    } finally {
      setCompleting(false);
    }
  };

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    'open': { label: 'Aberto', variant: 'default' },
    'in_progress': { label: 'Em Andamento', variant: 'secondary' },
    'completed': { label: 'Concluído', variant: 'outline' },
    'cancelled': { label: 'Cancelado', variant: 'destructive' }
  };

  const urgencyMap: Record<string, { label: string; className: string }> = {
    'low': { label: 'Baixa', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
    'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    'high': { label: 'Alta', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
    'urgent': { label: 'Urgente', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
  };

  const statusInfo = statusMap[request.status] || statusMap.open;
  const urgencyInfo = urgencyMap[request.urgency] || urgencyMap.normal;

  return (
    <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <CardTitle className="text-lg">{request.title}</CardTitle>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyInfo.className}`}>{urgencyInfo.label}</span>
            </div>
            <p className="text-muted-foreground mt-1">{request.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <Badge variant="secondary">{request.category}</Badge>
              {request.location_address && <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /><span>{request.location_address}</span></div>}
              <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{new Date(request.created_at).toLocaleDateString()}</span></div>
              {(request.budget_min || request.budget_max) && (
                <div className="flex items-center gap-1"><DollarSign className="h-4 w-4" /><span>{request.budget_min && request.budget_max ? `R$ ${request.budget_min} - R$ ${request.budget_max}` : request.budget_min ? `A partir de R$ ${request.budget_min}` : `Até R$ ${request.budget_max}`}</span></div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg"><Edit className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="rounded-lg" onClick={handleDelete} disabled={isDeleting}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">{loading ? 'Carregando...' : `${applications.length} candidatura(s)`}</span>
        </div>
        {applications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-3">Freelancers Candidatos:</h4>
            <div className="space-y-3">
              {applications.slice(0, 3).map((application: any) => (
                <div key={application.id} className="bg-accent/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Freelancer #{application.freelancer_id.slice(0, 8)}</span>
                    <div className="flex items-center gap-2">
                      {application.proposed_price && <span className="text-sm font-medium text-emerald-600">R$ {application.proposed_price}</span>}
                      <Badge variant="outline">{application.status === 'pending' ? 'Pendente' : application.status === 'accepted' ? 'Aceito' : application.status === 'rejected' ? 'Rejeitado' : application.status}</Badge>
                    </div>
                  </div>
                  {application.message && <p className="text-xs text-muted-foreground mb-2">"{application.message}"</p>}
                  {application.estimated_time && <p className="text-xs text-muted-foreground">Tempo estimado: {application.estimated_time}</p>}
                  {application.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="gradient-primary text-white border-0 rounded-lg">Aceitar</Button>
                      <Button size="sm" variant="outline" className="rounded-lg">Rejeitar</Button>
                    </div>
                  )}
                </div>
              ))}
              {applications.length > 3 && <p className="text-xs text-muted-foreground">+{applications.length - 3} candidatura(s) a mais</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyRequests;
