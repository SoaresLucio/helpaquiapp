
import React, { useState } from 'react';
import { User } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
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

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      
      // In a real app, you would upload this to your server or storage
      // Here we just show a success message
      toast({
        title: "Foto de perfil carregada",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    }
  };
  
  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverPhoto(file);
      
      // In a real app, you would upload this to your server or storage
      // Here we just show a success message
      toast({
        title: "Foto de capa carregada",
        description: "Sua foto de capa foi atualizada com sucesso."
      });
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
