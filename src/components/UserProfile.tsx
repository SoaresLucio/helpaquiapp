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

// Align with the User interface from ProfileHeader to avoid type conflicts
interface RealUserProfile {
  id: string; // Made required to match User interface
  name: string;
  email: string; // Made required to match User interface
  avatar: string; 
  type: 'professional' | 'client'; // Made required to match User interface expectations
  isVerified?: boolean;
  phone: string; // Made required to match User interface
  address?: string;
  coverPhoto?: string;
  rating?: number;
  reviews?: any[];
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
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [realUserData, setRealUserData] = useState<RealUserProfile | null>(null);

  // Fetch real user data from Supabase instead of using mock data
  useEffect(() => {
    const fetchRealUserData = async () => {
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

        // Create real user data object
        const userData: RealUserProfile = {
          id: authUser.id,
          name: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          avatar: profile?.avatar_url || '/placeholder.svg',
          type: (userType === 'freelancer' ? 'professional' : 'client') as 'professional' | 'client', // Ensure type assertion
          isVerified: authUser.email_confirmed_at ? true : false,
          phone: profile?.phone || '', // Provide empty string as default to satisfy required type
          address: profile?.address || undefined,
          coverPhoto: profile?.cover_photo || undefined,
          rating: 4.5, // Mock rating for now
          reviews: [] // Mock reviews for now
        };

        setRealUserData(userData);
      } catch (error) {
        console.error('Error in fetchRealUserData:', error);
      }
    };

    fetchRealUserData();
  }, [authUser, userType]);

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
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              avatar_url: avatarUrl,
            });

          if (error) throw error;

          // Update local state
          if (realUserData) {
            setRealUserData({ ...realUserData, avatar: avatarUrl });
          }
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
        const coverUrl = await uploadToSupabase(file, 'cover');
        
        if (coverUrl && authUser?.id) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: authUser.id,
              cover_photo: coverUrl,
            });

          if (error) throw error;

          // Update local state
          if (realUserData) {
            setRealUserData({ ...realUserData, coverPhoto: coverUrl });
          }
        }
        
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

  // Don't render until we have real user data
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
        onProfilePhotoUpload={handleProfilePhotoUpload}
        onCoverPhotoUpload={handleCoverPhotoUpload}
      />
      
      {/* Payment Settings Button */}
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
