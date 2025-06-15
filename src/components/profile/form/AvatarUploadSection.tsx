
import React from 'react';
import { Camera } from 'lucide-react';

interface AvatarUploadSectionProps {
  avatarPreview: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AvatarUploadSection: React.FC<AvatarUploadSectionProps> = ({
  avatarPreview,
  onAvatarChange
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200">
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="Avatar preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-500" />
            </div>
          )}
        </div>
        <label 
          htmlFor="avatar-upload" 
          className="absolute bottom-0 right-0 bg-helpaqui-blue p-2 rounded-full cursor-pointer hover:bg-helpaqui-blue/90"
        >
          <Camera className="h-4 w-4 text-white" />
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            className="sr-only" 
            onChange={onAvatarChange}
          />
        </label>
      </div>
      <p className="text-sm text-gray-600">Clique no ícone da câmera para alterar sua foto</p>
    </div>
  );
};

export default AvatarUploadSection;
