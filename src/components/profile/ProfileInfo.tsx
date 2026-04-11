
import React from 'react';
import { Mail, Phone, User as UserIcon } from 'lucide-react';

interface ProfileData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}

interface ProfileInfoProps {
  displayName: string;
  email: string;
  displayPhone: string;
  displayAddress: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({
  displayName,
  email,
  displayPhone,
  displayAddress
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Informações Pessoais</h3>
      
      <div className="space-y-3">
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 mr-2 text-helpaqui-purple" />
          <span className="font-medium">{displayName}</span>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <Mail className="h-4 w-4 mr-2 text-helpaqui-purple" />
          <span>{email}</span>
        </div>
        
        <div className="flex items-center text-gray-600 dark:text-gray-300">
          <Phone className="h-4 w-4 mr-2 text-helpaqui-purple" />
          <span>{displayPhone || 'Não informado'}</span>
        </div>

        <div className="text-gray-600 dark:text-gray-300">
          <strong>Endereço:</strong> {displayAddress}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
