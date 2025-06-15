
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from './ProfileHeader';
import ProfileEditForm from './ProfileEditForm';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { currentUser } from '@/data/mockData';

const ProfileContainer: React.FC = () => {
  const { user: authUser } = useAuth();
  const { toast } = useToast();

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

  const updateProfilePhoto = async (field: 'avatar_url' | 'cover_photo', value: string) => {
    if (!authUser?.id) return;

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: authUser.id, [field]: value });

    if (error) throw error;
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    
    try {
      const url = await uploadFile(file, 'profile');
      
      if (url) {
        await updateProfilePhoto('avatar_url', url);
      }
      
      toast({
        title: "Foto de perfil atualizada",
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

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    
    try {
      const url = await uploadFile(file, 'cover');
      
      if (url) {
        await updateProfilePhoto('cover_photo', url);
      }
      
      toast({
        title: "Foto de capa atualizada",
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

  const handleProfileUpdateSuccess = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso."
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader 
        user={currentUser} 
        onProfilePhotoUpload={handleProfilePhotoUpload}
        onCoverPhotoUpload={handleCoverPhotoUpload}
      />
      <ProfileEditForm 
        onSuccess={handleProfileUpdateSuccess}
      />
    </div>
  );
};

export default ProfileContainer;
