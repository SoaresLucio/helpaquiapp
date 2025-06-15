
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CreditCard, User, Mail, Phone, MapPin, Camera, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: 'professional' | 'client';
  isVerified: boolean;
  phone: string;
  address?: string;
  rating: number;
  reviews: any[];
}

interface UserProfileProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar: string;
    type: 'client' | 'professional';
    rating?: number;
    isVerified?: boolean;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { toast } = useToast();
  const { user: authUser, userType } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, [authUser]);

  const fetchProfileData = async () => {
    if (!authUser?.id) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        setProfileData(profile);
        setFormData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          phone: profile.phone || '',
          address: profile.address || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSave = async () => {
    if (!authUser?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: authUser.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
        });

      if (error) throw error;

      setIsEditing(false);
      fetchProfileData();
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const displayName = profileData.first_name && profileData.last_name 
    ? `${profileData.first_name} ${profileData.last_name}`
    : authUser?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData.avatar_url || '/placeholder.svg'} alt={displayName} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{displayName}</CardTitle>
          <p className="text-gray-600">{authUser?.email}</p>
          <Badge variant={userType === 'freelancer' ? 'default' : 'secondary'}>
            {userType === 'freelancer' ? 'Freelancer' : 'Cliente'}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate('/payment-freelancer-settings')}
              className="bg-helpaqui-green hover:bg-helpaqui-green/90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Configurações de Pagamento
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="bank">Dados Bancários</TabsTrigger>
              <TabsTrigger value="income">Rendimentos</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                <Button 
                  variant="outline" 
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? 'Salvar' : 'Editar'}
                </Button>
              </div>

              {isEditing ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">Nome</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Sobrenome</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <span>{displayName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>{authUser?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <span>{profileData.phone || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>{profileData.address || 'Não informado'}</span>
                  </div>
                </div>
              )}

              {userType === 'freelancer' && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-2">Estatísticas</h4>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span>4.5 (12 avaliações)</span>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="bank">
              <div className="text-center py-8">
                <p className="text-gray-500">Configurações bancárias serão implementadas aqui.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="income">
              <div className="text-center py-8">
                <p className="text-gray-500">Relatório de rendimentos será implementado aqui.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="text-center py-8">
                <p className="text-gray-500">Configurações adicionais serão implementadas aqui.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
