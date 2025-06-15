
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import ProfileInfoSection from './profile/ProfileInfoSection';
import ProfileActions from './profile/ProfileActions';
import ProfileEditSection from './profile/ProfileEditSection';
import ProfileStats from './profile/ProfileStats';
import ProfileTabs from './profile/ProfileTabs';

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

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const displayName = profileData.first_name && profileData.last_name 
    ? `${profileData.first_name} ${profileData.last_name}`
    : authUser?.email?.split('@')[0] || 'Usuário';

  const avatarUrl = profileData.avatar_url || '/placeholder.svg';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <ProfileInfoSection
            displayName={displayName}
            email={authUser?.email || ''}
            userType={userType || 'client'}
            profileData={profileData}
            avatarUrl={avatarUrl}
          />
        </CardHeader>

        <CardContent className="space-y-6">
          <ProfileActions />

          <ProfileEditSection
            isEditing={isEditing}
            formData={formData}
            onToggleEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onFormChange={handleFormChange}
          />

          <ProfileStats userType={userType || 'client'} />

          <ProfileTabs />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
