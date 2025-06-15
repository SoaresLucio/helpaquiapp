
import React from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ProfileEditForm from '../ProfileEditForm';

interface ProfileFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileData: any;
  onSuccess: () => void;
}

const ProfileFormDialog: React.FC<ProfileFormDialogProps> = ({
  isOpen,
  onOpenChange,
  profileData,
  onSuccess
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProfileFormDialog;
