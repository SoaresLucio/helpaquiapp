
import React, { useState } from 'react';
import { User } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
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
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
      
      toast({
        title: "Foto de perfil carregada",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    }
  };
  
  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPhoto(e.target.files[0]);
      
      toast({
        title: "Foto de capa carregada",
        description: "Sua foto de capa foi atualizada com sucesso."
      });
    }
  };

  return (
    <div className="helpaqui-card overflow-hidden dark:bg-gray-800 dark:text-white">
      <ProfileHeader 
        user={user}
        onProfilePhotoUpload={handleProfilePhotoUpload}
        onCoverPhotoUpload={handleCoverPhotoUpload}
      />
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">Perfil</TabsTrigger>
          <TabsTrigger value="bank" className="flex-1">Dados Bancários</TabsTrigger>
          <TabsTrigger value="income" className="flex-1">Rendimentos</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileTab user={user} />
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
