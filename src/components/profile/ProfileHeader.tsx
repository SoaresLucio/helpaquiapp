
import React from 'react';
import { Camera, BadgeCheck } from 'lucide-react';
import { User } from '@/data/mockData';

interface ProfileHeaderProps {
  user: User;
  onProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  onProfilePhotoUpload,
  onCoverPhotoUpload
}) => {
  const isVerified = user.isVerified || false;
  
  return (
    <>
      <div className="relative h-48 bg-gradient-to-r from-helpaqui-blue to-helpaqui-green">
        <label htmlFor="cover-upload" className="absolute bottom-2 right-2 bg-black/20 p-2 rounded-full cursor-pointer hover:bg-black/30 transition-colors">
          <Camera className="h-5 w-5 text-white" />
          <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={onCoverPhotoUpload} />
        </label>
      </div>
      
      <div className="px-4 relative">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md -mt-12 mx-auto">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-full h-full object-cover" 
          />
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-helpaqui-blue p-1 rounded-full cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m16 5-4-4-4 4"/><path d="M12 1v12"/><path d="M22 16v6"/><path d="M2 16v6"/><path d="M22 16H2"/><path d="M20 16v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6"/></svg>
            <input id="profile-upload" type="file" accept="image/*" className="sr-only" onChange={onProfilePhotoUpload} />
          </label>
        </div>
        
        <div className="text-center my-4">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {user.type === 'professional' ? "Profissional" : "Solicitante"}
            {isVerified && (
              <BadgeCheck className="inline-block ml-1 h-4 w-4 text-blue-500" />
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
