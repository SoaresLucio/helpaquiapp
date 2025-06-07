
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Shield, Users } from 'lucide-react';

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  };
}

const AdminTeam = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      // First get admin user roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'helpadmin')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Then get profile information for each admin
      const adminsWithProfiles = await Promise.all(
        (adminRoles || []).map(async (role) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', role.user_id)
            .single();

          return {
            ...role,
            profiles: profile
          };
        })
      );

      setAdmins(adminsWithProfiles);
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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      // First, check if user exists by ID in profiles
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', newAdminEmail)
        .single();

      if (userError) {
        toast({
          title: 'Erro',
          description: 'Usuário não encontrado. Verifique o ID do usuário.',
          variant: 'destructive'
        });
        return;
      }

      // Check if user already has admin role
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userData.id)
        .eq('role', 'helpadmin')
        .single();

      if (existingRole) {
        toast({
          title: 'Erro',
          description: 'Este usuário já é um administrador.',
          variant: 'destructive'
        });
        return;
      }

      // Add admin role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userData.id,
          role: 'helpadmin'
        }]);

      if (roleError) throw roleError;

      toast({ title: 'Administrador adicionado com sucesso!' });
      setNewAdminEmail('');
      setIsDialogOpen(false);
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este administrador?')) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'helpadmin');

      if (error) throw error;

      toast({ title: 'Administrador removido com sucesso!' });
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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
          <h1 className="text-3xl font-bold">Equipe Administrativa</h1>
          <p className="text-gray-600">Gerencie administradores do sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Administrador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <Label htmlFor="userId">ID do Usuário</Label>
                <Input
                  id="userId"
                  type="text"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="UUID do usuário"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  O usuário deve já estar cadastrado no sistema
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={adding}>
                  {adding ? 'Adicionando...' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-helpaqui-blue" />
                    <h3 className="font-semibold">
                      {admin.profiles?.first_name} {admin.profiles?.last_name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Administrador desde: {formatDate(admin.created_at)}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-helpaqui-blue">
                    <Shield className="h-3 w-3" />
                    {admin.role}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleRemoveAdmin(admin.user_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {admins.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum administrador encontrado</h3>
            <p className="text-gray-600">Adicione administradores para gerenciar o sistema.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTeam;
