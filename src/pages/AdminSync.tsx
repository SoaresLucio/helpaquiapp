
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSyncPanel from '@/components/admin/AdminSyncPanel';
import { useAccessControl } from '@/hooks/useAccessControl';

const AdminSync: React.FC = () => {
  const navigate = useNavigate();
  const { hasAccess, loading } = useAccessControl({
    enableAdminSync: true
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Acesso Negado</CardTitle>
            <CardDescription className="text-center">
              Você não tem permissão para acessar o painel de sincronização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-helpaqui-blue/10 rounded-lg">
              <Database className="h-6 w-6 text-helpaqui-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sincronização Administrativa
              </h1>
              <p className="text-gray-600">
                Gerencie a sincronização de dados entre o app e o painel administrativo
              </p>
            </div>
          </div>
        </div>

        {/* Painel de Sincronização */}
        <AdminSyncPanel />

        {/* Informações Adicionais */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sobre a Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Sincronização Manual:</strong> Permite atualizar os dados manualmente quando necessário.
              </p>
              <p className="mb-2">
                <strong>Sincronização em Tempo Real:</strong> Mantém os dados atualizados automaticamente conforme as mudanças acontecem.
              </p>
              <p>
                <strong>Sincronização por Tabela:</strong> Permite atualizar dados específicos de cada tabela individualmente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSync;
