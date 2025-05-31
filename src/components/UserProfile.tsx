
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProfileHeader from './profile/ProfileHeader';
import ProfileTab from './profile/ProfileTab';
import BankTab from './profile/BankTab';
import IncomeTab from './profile/IncomeTab';
import SettingsTab from './profile/SettingsTab';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: 'professional' | 'client';
  isVerified: boolean;
  phone: string;
  address?: string;
  coverPhoto?: string;
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
  const [realUserData, setRealUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
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

        const userData: UserProfile = {
          id: authUser.id,
          name: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          avatar: profile?.avatar_url || '/placeholder.svg',
          type: (userType === 'freelancer' ? 'professional' : 'client') as 'professional' | 'client',
          isVerified: !!authUser.email_confirmed_at,
          phone: profile?.phone || '',
          address: profile?.address,
          coverPhoto: profile?.cover_photo,
          rating: 4.5,
          reviews: []
        };

        setRealUserData(userData);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };

    fetchUserData();
  }, [authUser, userType]);

  const uploadFile = async (file: File, type: 'profile' | 'cover'): Promise<string | null> => {
    if (!authUser?.id) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}/${type === 'profile' ? 'avatar' : 'cover'}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${type} photo:`, error);
      throw error;
    }
  };

  const updateProfile = async (field: 'avatar_url' | 'cover_photo', value: string) => {
    if (!authUser?.id) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: authUser.id, [field]: value });

    if (error) throw error;
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    
    try {
      const url = await uploadFile(file, type);
      
      if (url) {
        const field = type === 'profile' ? 'avatar_url' : 'cover_photo';
        await updateProfile(field, url);

        if (realUserData) {
          setRealUserData({
            ...realUserData,
            [type === 'profile' ? 'avatar' : 'coverPhoto']: url
          });
        }
      }
      
      toast({
        title: `Foto de ${type === 'profile' ? 'perfil' : 'capa'} atualizada`,
        description: "Sua foto foi atualizada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar foto",
        description: error.message || "Ocorreu um erro ao fazer upload da foto.",
        variant: "destructive"
      });
    }
  };

  if (!realUserData) {
    return (
      <div className="helpaqui-card p-4 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="helpaqui-card overflow-hidden dark:bg-gray-800 dark:text-white">
      <ProfileHeader 
        user={realUserData}
        onProfilePhotoUpload={(e) => handlePhotoUpload(e, 'profile')}
        onCoverPhotoUpload={(e) => handlePhotoUpload(e, 'cover')}
      />
      
      <div className="px-4 pb-4">
        <Button 
          onClick={() => navigate('/payments')}
          className="w-full bg-helpaqui-green hover:bg-helpaqui-green/90 flex items-center justify-center gap-2"
        >
          <CreditCard className="h-4 w-4" />
          Configurações de Pagamento
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">Perfil</TabsTrigger>
          <TabsTrigger value="bank" className="flex-1">Dados Bancários</TabsTrigger>
          <TabsTrigger value="income" className="flex-1">Rendimentos</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab user={realUserData} />
        </TabsContent>
        
        <TabsContent value="bank">
          <BankTab />
        </TabsContent>
        
        <TabsContent value="income">
          <IncomeTab />
        </TabsContent>
        
        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
