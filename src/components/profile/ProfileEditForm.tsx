
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Save, Loader2 } from 'lucide-react';
import AvatarUploadSection from './form/AvatarUploadSection';
import ProfileFormFields from './form/ProfileFormFields';
import { useProfileForm } from './form/useProfileForm';

interface ProfileEditFormProps {
  initialData?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
  };
  onSuccess?: () => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({ initialData, onSuccess }) => {
  const {
    form,
    isLoading,
    avatarPreview,
    handleAvatarChange,
    onSubmit
  } = useProfileForm({ initialData, onSuccess });

  return (
    <div className="space-y-6">
      <AvatarUploadSection
        avatarPreview={avatarPreview}
        onAvatarChange={handleAvatarChange}
      />

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <ProfileFormFields form={form} />

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} className="bg-helpaqui-blue hover:bg-helpaqui-blue/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProfileEditForm;
