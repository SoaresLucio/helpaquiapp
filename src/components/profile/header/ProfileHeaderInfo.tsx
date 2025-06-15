
import React from 'react';
import { Mail, User as UserIcon, BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface User {
  email?: string;
  type?: 'professional' | 'client';
}

interface ProfileHeaderInfoProps {
  displayName: string;
  user: User;
  isVerified: boolean;
}

const ProfileHeaderInfo: React.FC<ProfileHeaderInfoProps> = ({
  displayName,
  user,
  isVerified
}) => {
  return (
    <div className="text-center my-4 space-y-2">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-xl font-bold">{displayName}</h2>
        {isVerified && (
          <BadgeCheck className="h-5 w-5 text-blue-500" />
        )}
      </div>
      
      {user.email && (
        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-300">
          <Mail className="h-4 w-4" />
          <span>{user.email}</span>
        </div>
      )}
      
      <div className="flex items-center justify-center gap-2">
        <UserIcon className="h-4 w-4" />
        <Badge variant={user.type === 'professional' ? 'default' : 'secondary'}>
          {user.type === 'professional' ? "Freelancer" : "Solicitante"}
        </Badge>
      </div>
    </div>
  );
};

export default ProfileHeaderInfo;
