import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Calendar, Clock, DollarSign, Briefcase, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { createAsaasPayment, calculatePlatformFee } from '@/services/asaasService';

interface HireState {
  conversationId: string;
  freelancerId: string;
  freelancerName: string;
  defaultTitle?: string;
}

const HireConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = location.state as HireState | null;

  const [profile, setProfile] = useState<{ first_name: string | null; avatar_url: string | null; verified: boolean } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [title, setTitle] = useState(state?.defaultTitle || '');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!state?.freelancerId) return;
    (async () => {
      try {
        const { data } = await supabase.rpc('get_public_profile', { p_user_id: state.freelancerId });
        if (data && data.length > 0) {
          setProfile({
            first_name: data[0].first_name,
            avatar_url: data[0].avatar_url,
            verified: data[0].verified,
          });
        }
      } catch (e) {
        console.error('profile load', e);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, [state?.freelancerId]);

  const numericValue = useMemo(() => Number((value || '0').replace(',', '.')), [value]);
  const valueCents = Math.round(numericValue * 100);
  const { fee, freelancerAmount } = calculatePlatformFee(valueCents || 0);

  if (!state?.conversationId || !state?.freelancerId) {
    return <Navigate to="/chat" replace />;
  }

  const validate = () => {
    if (title.trim().length < 3) { toast.error('Informe um título para o serviço'); return false; }
    if (!date) { toast.error('Selecione a data'); return false; }
    if (!time) { toast.error('Selecione o horário'); return false; }
    if (address.trim().length < 5) { toast.error('Informe o endereço completo'); return false; }
    if (!Number.isFinite(numericValue) || numericValue <= 0) { toast.error('Informe um valor válido'); return false; }
    return true;
  };

  const handleConfirm = async () => {
    if (!user) { toast.error('Faça login novamente'); return; }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

      // 1) Create service_request (open, awaiting freelancer acceptance + payment)
      const { data: request, error: reqError } = await supabase
        .from('service_requests')
        .insert({
          client_id: user.id,
          title: title.trim(),
          description: `${description.trim() ? description.trim() + '\n\n' : ''}Contratação direta via chat. Agendado para ${date} às ${time}. Local: ${address.trim()}.`,
          category: 'Outros',
          status: 'open',
          location_address: address.trim(),
          budget_min: valueCents,
          budget_max: valueCents,
          urgency: 'normal',
        })
        .select()
        .single();
      if (reqError) throw reqError;

      // 2) Create accepted proposal linking the freelancer (pending freelancer acceptance)
      const { error: propError } = await supabase
        .from('service_proposals')
        .insert({
          service_request_id: request.id,
          freelancer_id: state.freelancerId,
          status: 'pending',
          proposed_price: valueCents,
          message: `Contratação direta via chat. Data: ${date} ${time}. Local: ${address.trim()}.`,
        });
      if (propError) throw propError;

      // 3) Link conversation to the request
      await supabase.from('conversations').update({ service_request_id: request.id }).eq('id', state.conversationId);

      // 4) Send notice in chat
      await supabase.functions.invoke('send-chat-message', {
        body: {
          conversationId: state.conversationId,
          content: `Solicitação de contratação enviada: ${title.trim()} — ${date} ${time} — Valor: R$ ${numericValue.toFixed(2).replace('.', ',')}. Aguardando aceite do freelancer.`,
          messageType: 'text',
          metadata: {
            kind: 'hire_request',
            service_request_id: request.id,
            scheduled_at: scheduledAt,
            address: address.trim(),
            value_cents: valueCents,
          },
        },
      });

      // 5) Initiate ASAAS payment
      const payment = await createAsaasPayment({
        amount: valueCents,
        serviceId: request.id,
        freelancerId: state.freelancerId,
        description: `Help: ${title.trim()}`,
      });

      if (payment.success && payment.url) {
        toast.success('Solicitação criada! Redirecionando para pagamento.');
        window.open(payment.url, '_blank', 'noopener,noreferrer');
        navigate('/my-requests');
      } else {
        toast.error(payment.error || 'Não foi possível iniciar o pagamento. Você pode pagar depois em Minhas Solicitações.');
        navigate('/my-requests');
      }
    } catch (err: any) {
      console.error('hire confirm', err);
      toast.error(err?.message ?? 'Não foi possível concluir a contratação.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" /> Confirmar Contratação</h1>
          <p className="text-muted-foreground text-sm">Revise os dados e confirme. O pagamento fica retido até o freelancer aceitar.</p>
        </div>

        {/* Freelancer card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Freelancer selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {(profile?.first_name || state.freelancerName).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{profile?.first_name || state.freelancerName}</p>
                  {profile?.verified && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verificado
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">ID: {state.freelancerId.slice(0, 8)}…</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalhes do Help</CardTitle>
            <CardDescription>Defina título, agendamento, local e valor combinado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="title">Título do serviço *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Ex: Instalação de chuveiro" />
            </div>
            <div>
              <Label htmlFor="desc">Descrição (opcional)</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1000} rows={3} placeholder="Detalhes do que será feito..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date" className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Data *</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="time" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Horário *</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Endereço completo *</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" />
              <p className="text-xs text-muted-foreground mt-1">O endereço só será revelado ao freelancer após ele aceitar o Help.</p>
            </div>
            <div>
              <Label htmlFor="value" className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Valor combinado (R$) *</Label>
              <Input id="value" inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ''))} placeholder="0,00" />
            </div>
          </CardContent>
        </Card>

        {/* Payment summary */}
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Resumo do pagamento</CardTitle>
            <CardDescription>O valor fica retido com a plataforma até a confirmação do freelancer.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Valor do serviço:</span><span className="font-medium">R$ {(valueCents / 100).toFixed(2)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Taxa da plataforma (10%):</span><span>R$ {(fee / 100).toFixed(2)}</span></div>
            <div className="flex justify-between border-t pt-2"><span>Repasse ao freelancer:</span><span className="font-medium text-primary">R$ {(freelancerAmount / 100).toFixed(2)}</span></div>
          </CardContent>
        </Card>

        <div className="flex gap-2 pb-6">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={submitting} className="flex-1">Cancelar</Button>
          <Button onClick={handleConfirm} disabled={submitting || loadingProfile} className="flex-1 bg-primary hover:bg-primary/90">
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processando…</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Confirmar e pagar</>}
          </Button>
        </div>
      </motion.main>
    </div>
  );
};

export default HireConfirmation;
