
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';

interface Verification {
  id: string;
  user_id: string;
  verification_type: string;
  document_url?: string;
  additional_data?: any;
  status: string;
  submitted_at: string;
  notes?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

const ProfileVerifications = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      // First get all verifications
      const { data: verificationsData, error } = await supabase
        .from('profile_verifications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Then get profile information for each verification
      const verificationsWithProfiles = await Promise.all(
        (verificationsData || []).map(async (verification) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', verification.user_id)
            .single();

          return {
            ...verification,
            profiles: profile
          };
        })
      );

      setVerifications(verificationsWithProfiles);
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

  const handleVerificationAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profile_verifications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          notes
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `Verificação ${status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`
      });

      setSelectedVerification(null);
      setNotes('');
      fetchVerifications();
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
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      <div>
        <h1 className="text-3xl font-bold">Verificação de Perfis</h1>
        <p className="text-gray-600">Gerencie solicitações de verificação de usuários</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {verifications.map((verification) => (
          <Card key={verification.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">
                      {verification.profiles?.first_name} {verification.profiles?.last_name}
                    </h3>
                    {getStatusBadge(verification.status)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Tipo: {verification.verification_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Enviado em: {formatDate(verification.submitted_at)}
                  </p>
                  {verification.additional_data && (
                    <div className="text-sm text-gray-600">
                      <p>Dados adicionais: {JSON.stringify(verification.additional_data)}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedVerification(verification)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Analisar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Analisar Verificação</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Usuário:</h4>
                          <p>{verification.profiles?.first_name} {verification.profiles?.last_name}</p>
                        </div>
                        <div>
                          <h4 className="font-medium">Tipo de Verificação:</h4>
                          <p>{verification.verification_type}</p>
                        </div>
                        {verification.document_url && (
                          <div>
                            <h4 className="font-medium">Documento:</h4>
                            <a 
                              href={verification.document_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              Ver documento
                            </a>
                          </div>
                        )}
                        {verification.additional_data && (
                          <div>
                            <h4 className="font-medium">Dados Adicionais:</h4>
                            <pre className="text-sm bg-gray-100 p-2 rounded">
                              {JSON.stringify(verification.additional_data, null, 2)}
                            </pre>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Observações (opcional):
                          </label>
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Adicione observações sobre esta verificação..."
                            rows={3}
                          />
                        </div>
                        {verification.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 bg-green-500 hover:bg-green-600"
                              onClick={() => handleVerificationAction(verification.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex-1"
                              onClick={() => handleVerificationAction(verification.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {verifications.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma verificação encontrada</h3>
            <p className="text-gray-600">Não há solicitações de verificação pendentes.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileVerifications;
