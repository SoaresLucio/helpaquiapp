
import React from 'react';
import { Camera } from 'lucide-react';

interface ProfileHeaderImageProps {
  coverStyle: React.CSSProperties;
  avatarUrl: string;
  displayName: string;
  onProfilePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeaderImage: React.FC<ProfileHeaderImageProps> = ({
  coverStyle,
  avatarUrl,
  displayName,
  onProfilePhotoChange,
  onCoverPhotoChange
}) => {
  return (
    <>
      <div className="relative h-48" style={coverStyle}>
        <label htmlFor="cover-upload" className="absolute bottom-2 right-2 bg-black/20 p-2 rounded-full cursor-pointer hover:bg-black/30 transition-colors">
          <Camera className="h-5 w-5 text-white" />
          <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={onCoverPhotoChange} />
        </label>
      </div>
      
      <div className="px-4 relative">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md -mt-12 mx-auto">
          <img 
            src={avatarUrl} 
            alt={displayName}
            className="w-full h-full object-cover" 
          />
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-helpaqui-blue p-1 rounded-full cursor-pointer">
            <Camera className="h-3 w-3 text-white" />
            <input id="profile-upload" type="file" accept="image/*" className="sr-only" onChange={onProfilePhotoChange} />
          </label>
        </div>
      </div>
    </>
  );
};

export default ProfileHeaderImage;
