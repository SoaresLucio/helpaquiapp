
import React, { useState } from 'react';
import { Camera, BadgeCheck, Mail, User as UserIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

// Define the User interface that matches what we're using
interface User {
  id?: string;
  name: string;
  email?: string;
  avatar: string; 
  type?: 'professional' | 'client';
  isVerified?: boolean;
  // Add coverPhoto property to the User type
  coverPhoto?: string;
}

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
  const { toast } = useToast();
  const isVerified = user.isVerified || false;
  const [previewProfile, setPreviewProfile] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  
  // Enhanced profile photo handler with preview
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewProfile(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Call the parent handler
      onProfilePhotoUpload(e);
    }
  };
  
  // Enhanced cover photo handler with preview
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewCover(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Call the parent handler
      onCoverPhotoUpload(e);
    }
  };
  
  // Function to handle background style for cover
  const getCoverStyle = () => {
    if (previewCover) {
      return { backgroundImage: `url(${previewCover})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (user.coverPhoto) {
      return { backgroundImage: `url(${user.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else {
      return { background: 'linear-gradient(to right, var(--helpaqui-blue), var(--helpaqui-green))' };
    }
  };
  
  return (
    <>
      <div className="relative h-48" style={getCoverStyle()}>
        <label htmlFor="cover-upload" className="absolute bottom-2 right-2 bg-black/20 p-2 rounded-full cursor-pointer hover:bg-black/30 transition-colors">
          <Camera className="h-5 w-5 text-white" />
          <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={handleCoverPhotoChange} />
        </label>
      </div>
      
      <div className="px-4 relative">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md -mt-12 mx-auto">
          <img 
            src={previewProfile || user.avatar} 
            alt={user.name}
            className="w-full h-full object-cover" 
          />
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-helpaqui-blue p-1 rounded-full cursor-pointer">
            <Camera className="h-3 w-3 text-white" />
            <input id="profile-upload" type="file" accept="image/*" className="sr-only" onChange={handleProfilePhotoChange} />
          </label>
        </div>
        
        <div className="text-center my-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-bold">{user.name}</h2>
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
          
          {isVerified && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              ✓ Perfil Verificado
            </Badge>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
