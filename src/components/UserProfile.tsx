
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileHeader from './profile/ProfileHeader';
import ProfileTab from './profile/ProfileTab';
import BankTab from './profile/BankTab';
import IncomeTab from './profile/IncomeTab';
import SettingsTab from './profile/SettingsTab';
import ProfileActions from './profile/ProfileActions';
import ProfilePhotoUpload from './profile/ProfilePhotoUpload';

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
  const { user: authUser, userType } = useAuth();
  const [realUserData, setRealUserData] = useState<UserProfile | null>(null);
  const photoUpload = ProfilePhotoUpload({
    onPhotoUpdate: (type, url) => {
      if (realUserData) {
        setRealUserData({
          ...realUserData,
          [type === 'profile' ? 'avatar' : 'coverPhoto']: url
        });
      }
    }
  });

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
        onProfilePhotoUpload={(e) => photoUpload.handlePhotoUpload(e, 'profile')}
        onCoverPhotoUpload={(e) => photoUpload.handlePhotoUpload(e, 'cover')}
      />
      
      <ProfileActions />
      
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
