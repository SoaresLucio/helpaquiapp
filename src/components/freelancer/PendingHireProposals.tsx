import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Inbox, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface PendingProposal {
  id: string;
  service_request_id: string;
  proposed_price: number | null;
  created_at: string;
  request_title: string;
}

const PendingHireProposals: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<PendingProposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    if (!user) return;
    setLoading(true);
    const { data: props } = await supabase
      .from('service_proposals')
      .select('id, service_request_id, proposed_price, created_at')
      .eq('freelancer_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!props || props.length === 0) {
      setItems([]); setLoading(false); return;
    }
    const reqIds = props.map(p => p.service_request_id);
    const { data: reqs } = await supabase
      .from('service_requests')
      .select('id, title')
      .in('id', reqIds);
    const titles = new Map((reqs || []).map(r => [r.id, r.title]));
    setItems(props.map(p => ({ ...p, request_title: titles.get(p.service_request_id) || 'Help' })));
    setLoading(false);
  };

  useEffect(() => {
    fetchProposals();
    if (!user) return;
    const channel = supabase
      .channel('pending-proposals-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_proposals', filter: `freelancer_id=eq.${user.id}` },
        () => fetchProposals())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) return null;

  return (
    <Card className="rounded-2xl border-primary/30 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5 text-primary" />
          Propostas de contratação pendentes
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
        <CardDescription>Solicitantes querem te contratar. Aceite ou recuse cada Help.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map(p => (
          <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/50 p-3">
            <div className="min-w-0">
              <p className="font-medium truncate">{p.request_title}</p>
              <p className="text-xs text-muted-foreground">
                R$ {((p.proposed_price ?? 0) / 100).toFixed(2)} · {new Date(p.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate(`/hire/respond/${p.id}`)} className="bg-primary hover:bg-primary/90">
              Responder <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingHireProposals;
