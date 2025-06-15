
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import ProfileHeaderImage from './header/ProfileHeaderImage';
import ProfileHeaderInfo from './header/ProfileHeaderInfo';
import VerificationStatusBadge from './header/VerificationStatusBadge';
import { useProfileData } from './header/useProfileData';
import { useVerificationStatus } from './header/useVerificationStatus';

interface User {
  id?: string;
  name: string;
  email?: string;
  avatar: string; 
  type?: 'professional' | 'client';
  isVerified?: boolean;
  phone?: string;
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
  const { profileData, bankData } = useProfileData();
  const verificationStatus = useVerificationStatus(profileData, bankData, user);
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

  // Get display name from Supabase data or fallback
  const getDisplayName = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`;
    }
    return user.name;
  };

  // Get avatar URL from Supabase data or fallback
  const getAvatarUrl = () => {
    return previewProfile || profileData.avatar_url || user.avatar;
  };
  
  return (
    <>
      <ProfileHeaderImage
        coverStyle={getCoverStyle()}
        avatarUrl={getAvatarUrl()}
        displayName={getDisplayName()}
        onProfilePhotoChange={handleProfilePhotoChange}
        onCoverPhotoChange={handleCoverPhotoChange}
      />
      
      <ProfileHeaderInfo
        displayName={getDisplayName()}
        user={user}
        isVerified={verificationStatus === 'verified'}
      />
      
      {/* Verification status badge */}
      <div className="flex justify-center px-4 pb-4">
        <VerificationStatusBadge status={verificationStatus} />
      </div>
    </>
  );
};

export default ProfileHeader;
