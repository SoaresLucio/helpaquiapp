
import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ProfileEditForm from './ProfileEditForm';
import ProfileInfo from './ProfileInfo';
import ProfileStats from './ProfileStats';
import ProfileReviews from './ProfileReviews';
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

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2">
                <Pencil className="h-3 w-3 mr-1" /> Editar Informações
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>
                  Atualize suas informações pessoais e foto de perfil
                </DialogDescription>
              </DialogHeader>
              <ProfileEditForm 
                initialData={profileData}
                onSuccess={handleEditSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <ProfileStats user={user} isFreelancer={isFreelancer} />
      </div>
      
      {isFreelancer && (
        <>
          <Separator />
          <ProfileReviews user={user} />
        </>
      )}
      
      <Separator />
      
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Redes sociais</h3>
        <div className="flex gap-2">
          <a href="https://facebook.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="https://instagram.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-pink-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <a href="https://twitter.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;
