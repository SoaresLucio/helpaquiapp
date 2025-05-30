
import React, { useState, useEffect } from 'react';
import { User } from '@/data/mockData';
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

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const { toast } = useToast();
  const { user: authUser, userType } = useAuth();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  // Dados do usuário atual baseados na autenticação
  const currentUserData: User = {
    ...user,
    name: authUser?.user_metadata?.first_name && authUser?.user_metadata?.last_name 
      ? `${authUser.user_metadata.first_name} ${authUser.user_metadata.last_name}`
      : authUser?.email?.split('@')[0] || user.name,
    email: authUser?.email || user.email,
    type: (userType === 'freelancer' ? 'professional' : 'client') as 'professional' | 'client',
    isVerified: authUser?.email_confirmed_at ? true : false
  };

  const uploadToSupabase = async (file: File, type: 'profile' | 'cover'): Promise<string | null> => {
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

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      
      try {
        const avatarUrl = await uploadToSupabase(file, 'profile');
        
        if (avatarUrl && authUser?.id) {
          // Update profile in database
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              avatar_url: avatarUrl,
            });

          if (error) throw error;
        }
        
        toast({
          title: "Foto de perfil atualizada",
          description: "Sua foto de perfil foi atualizada com sucesso."
        });
      } catch (error: any) {
        toast({
          title: "Erro ao atualizar foto",
          description: error.message || "Ocorreu um erro ao fazer upload da foto.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPhoto(file);
      
      try {
        await uploadToSupabase(file, 'cover');
        
        toast({
          title: "Foto de capa atualizada",
          description: "Sua foto de capa foi atualizada com sucesso."
        });
      } catch (error: any) {
        toast({
          title: "Erro ao atualizar foto",
          description: error.message || "Ocorreu um erro ao fazer upload da foto.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="helpaqui-card overflow-hidden dark:bg-gray-800 dark:text-white">
      <ProfileHeader 
        user={currentUserData}
        onProfilePhotoUpload={handleProfilePhotoUpload}
        onCoverPhotoUpload={handleCoverPhotoUpload}
      />
      
      {/* Botão de acesso aos Pagamentos */}
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
          <ProfileTab user={currentUserData} />
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
