
import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePhotoUploadProps {
  onPhotoUpdate: (type: 'profile' | 'cover', url: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({ onPhotoUpdate }) => {
  const { toast } = useToast();
  const { user: authUser } = useAuth();

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
        onPhotoUpdate(type, url);
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

  return { handlePhotoUpload };
};

export default ProfilePhotoUpload;
