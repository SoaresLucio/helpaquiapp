import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, MapPin, Calendar, Clock, DollarSign, CheckCircle2, XCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProposalRow {
  id: string;
  service_request_id: string;
  freelancer_id: string;
  status: string;
  proposed_price: number | null;
  message: string | null;
  created_at: string;
}

interface RequestRow {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  location_address: string | null;
  budget_min: number | null;
  budget_max: number | null;
}

const HireResponse: React.FC = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [proposal, setProposal] = useState<ProposalRow | null>(null);
  const [request, setRequest] = useState<RequestRow | null>(null);
  const [client, setClient] = useState<{ first_name: string | null; avatar_url: string | null } | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState<'accept' | 'reject' | null>(null);
  const [refusalCount, setRefusalCount] = useState<number>(0);
  const [accountBlocked, setAccountBlocked] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!proposalId || !user) return;
      try {
        const { data: prop, error: pe } = await supabase
          .from('service_proposals')
          .select('*')
          .eq('id', proposalId)
          .maybeSingle();
        if (pe) throw pe;
        if (!prop) { toast.error('Proposta não encontrada'); navigate('/dashboard'); return; }
        if (prop.freelancer_id !== user.id) { toast.error('Acesso negado'); navigate('/dashboard'); return; }
        setProposal(prop as ProposalRow);

        const { data: req } = await supabase
          .from('service_requests')
          .select('id, client_id, title, description, category, status, location_address, budget_min, budget_max')
          .eq('id', prop.service_request_id)
          .maybeSingle();
        setRequest(req as RequestRow);

        if (req?.client_id) {
          const { data: profileRows } = await supabase.rpc('get_public_profile', { p_user_id: req.client_id });
          if (profileRows && profileRows.length > 0) {
            setClient({ first_name: profileRows[0].first_name, avatar_url: profileRows[0].avatar_url });
          }
        }

        const { data: me } = await supabase
          .from('profiles')
          .select('cancellation_count, account_blocked')
          .eq('id', user.id)
          .maybeSingle();
        if (me) {
          setRefusalCount(me.cancellation_count ?? 0);
          setAccountBlocked(!!me.account_blocked);
        }
      } catch (e: any) {
        console.error(e);
        toast.error(e?.message || 'Erro ao carregar proposta');
      } finally {
        setLoading(false);
      }
    })();
  }, [proposalId, user, navigate]);

  const respond = async (accept: boolean) => {
    if (!proposal) return;
    if (!accept && reason.trim().length < 5) {
      toast.error('Informe um motivo (mínimo 5 caracteres) para recusar.');
      return;
    }
    setSubmitting(accept ? 'accept' : 'reject');
    try {
      const { data, error } = await supabase.rpc('respond_to_hire_proposal', {
        p_proposal_id: proposal.id,
        p_accept: accept,
        p_reason: accept ? null : reason.trim(),
      });
      if (error) throw error;
      const result = data as any;
      if (accept) {
        toast.success('Help aceito! O solicitante foi notificado.');
      } else {
        const count = result?.cancellation_count ?? 0;
        if (result?.account_blocked) {
          toast.error(`Recusa registrada. Você atingiu ${count} recusas e sua conta foi BLOQUEADA.`);
        } else {
          toast.warning(`Recusa registrada. Recusas acumuladas: ${count}/3.`);
        }
      }
      navigate('/dashboard');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Não foi possível registrar a resposta.');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposal || !request) return null;

  const value = (proposal.proposed_price ?? request.budget_max ?? 0) / 100;
  const alreadyAnswered = proposal.status !== 'pending';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex-1 container mx-auto px-4 py-6 max-w-2xl space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Resposta ao Help</h1>
          <p className="text-muted-foreground text-sm">Revise os detalhes e aceite ou recuse a contratação.</p>
        </div>

        {accountBlocked && (
          <Card className="border-destructive">
            <CardContent className="p-4 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Conta bloqueada</p>
                <p className="text-sm text-muted-foreground">Sua conta foi bloqueada por excesso de recusas (3+). Entre em contato com o suporte.</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Solicitante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={client?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(client?.first_name || 'C').charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{client?.first_name || 'Solicitante'}</p>
                <Badge variant="secondary" className="text-xs">{request.category}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{request.title}</CardTitle>
            <CardDescription>Detalhes do serviço solicitado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {request.description && (
              <p className="whitespace-pre-line text-muted-foreground">{request.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> R$ {value.toFixed(2)}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {proposal.status === 'accepted' ? request.location_address : 'Endereço liberado após aceitar'}</div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {new Date(proposal.created_at).toLocaleDateString('pt-BR')}</div>
              <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> {new Date(proposal.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            {proposal.message && (
              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                {proposal.message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-500/40 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-700 dark:text-amber-300">Atenção: política de recusas</p>
              <p className="text-muted-foreground">Recusas acumuladas: <strong>{refusalCount}/3</strong>. Ao atingir 3 recusas sua conta será bloqueada automaticamente. O solicitante recebe estorno integral em caso de recusa.</p>
            </div>
          </CardContent>
        </Card>

        {!alreadyAnswered && !accountBlocked && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recusar (opcional)</CardTitle>
              <CardDescription>Se for recusar, informe o motivo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="reason">Motivo da recusa</Label>
              <Textarea id="reason" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: indisponível na data, fora da minha região..." />
            </CardContent>
          </Card>
        )}

        {alreadyAnswered ? (
          <Card>
            <CardContent className="p-4 text-sm">
              Esta proposta já foi <Badge>{proposal.status}</Badge>.
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-2 pb-6">
            <Button
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => respond(false)}
              disabled={!!submitting || accountBlocked}
            >
              {submitting === 'reject' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Recusar Help
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => respond(true)}
              disabled={!!submitting || accountBlocked}
            >
              {submitting === 'accept' ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Aceitar Help
            </Button>
          </div>
        )}
      </motion.main>
    </div>
  );
};

export default HireResponse;
