
import React from 'react';
import { BadgeCheck } from 'lucide-react';

interface ProfessionalAvatarProps {
  avatar: string;
  name: string;
  available: boolean;
  isVerified: boolean;
}

const ProfessionalAvatar: React.FC<ProfessionalAvatarProps> = ({
  avatar,
  name,
  available,
  isVerified
}) => {
  return (
    <div className="relative mr-3 flex-shrink-0">
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
        <img 
          src={avatar} 
          alt={name}
          className="w-full h-full object-cover" 
        />
      </div>
      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
        available ? 'bg-green-500' : 'bg-gray-400'
      }`}></div>
      
      {isVerified && (
        <div className="absolute top-0 left-0 bg-blue-500 rounded-full p-1 border-2 border-white">
          <BadgeCheck className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default ProfessionalAvatar;
