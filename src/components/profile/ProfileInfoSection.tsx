
import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileInfoSectionProps {
  displayName: string;
  email: string;
  userType: string;
  profileData: any;
  avatarUrl: string;
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
  displayName,
  email,
  userType,
  profileData,
  avatarUrl
}) => {
  return (
    <div className="text-center mb-4">
      <div className="flex justify-center mb-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback>
            <User className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <h2 className="text-2xl font-bold">{displayName}</h2>
      <p className="text-gray-600">{email}</p>
      
      <div className="flex justify-center mt-2">
        <Badge variant={userType === 'freelancer' ? 'default' : 'secondary'}>
          {userType === 'freelancer' ? 'Freelancer' : 'Cliente'}
        </Badge>
      </div>
      
      <div className="space-y-4 mt-6 text-left">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-gray-500" />
          <span>{displayName}</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-gray-500" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-gray-500" />
          <span>{profileData.phone || 'Não informado'}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-500" />
          <span>{profileData.address || 'Não informado'}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoSection;
