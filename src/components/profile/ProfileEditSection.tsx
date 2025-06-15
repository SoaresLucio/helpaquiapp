
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProfileEditSectionProps {
  isEditing: boolean;
  formData: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
  };
  onToggleEdit: () => void;
  onSave: () => void;
  onFormChange: (field: string, value: string) => void;
}

const ProfileEditSection: React.FC<ProfileEditSectionProps> = ({
  isEditing,
  formData,
  onToggleEdit,
  onSave,
  onFormChange
}) => {
  const handleEdit = () => {
    if (isEditing) {
      onSave();
    } else {
      onToggleEdit();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Informações Pessoais</h3>
        <Button variant="outline" onClick={handleEdit}>
          Editar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Informações Pessoais</h3>
        <Button variant="outline" onClick={handleEdit}>
          Salvar
        </Button>
      </div>
      
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Nome</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => onFormChange('first_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="last_name">Sobrenome</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => onFormChange('last_name', e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onFormChange('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onFormChange('address', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileEditSection;
