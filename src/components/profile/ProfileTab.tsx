
import React, { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileFormDialog from './tab/ProfileFormDialog';
import ProfileInfo from './ProfileInfo';
import ProfileStats from './ProfileStats';
import ProfileReviews from './ProfileReviews';
import ProfileSocialLinks from './tab/ProfileSocialLinks';
import { User } from '@/data/mockData';

interface ProfileTabProps {
  user: User;
}

interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user }) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const isFreelancer = user.type === 'professional';

  // Fetch current profile data from Supabase
  const fetchProfileData = async () => {
    if (!authUser?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, phone, address, avatar_url')
        .eq('id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [authUser?.id]);

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    fetchProfileData(); // Refresh data
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso."
    });
  };

  const displayName = profileData.first_name && profileData.last_name 
    ? `${profileData.first_name} ${profileData.last_name}`
    : user.name;

  const displayPhone = profileData.phone || user.phone;
  const displayAddress = profileData.address || 'Não informado';

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ProfileInfo 
            displayName={displayName}
            email={user.email}
            displayPhone={displayPhone}
            displayAddress={displayAddress}
          />

          <ProfileFormDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            profileData={profileData}
            onSuccess={handleEditSuccess}
          />
        </div>
        
        <ProfileStats user={user} isFreelancer={isFreelancer} />
      </div>
      
      {isFreelancer && (
        <>
          <Separator />
          <ProfileReviews user={user} />
        </>
      )}
      
      <ProfileSocialLinks />
    </div>
  );
};

export default ProfileTab;
