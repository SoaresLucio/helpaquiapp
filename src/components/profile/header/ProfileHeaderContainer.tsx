
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import ProfileHeaderImage from './ProfileHeaderImage';
import ProfileHeaderInfo from './ProfileHeaderInfo';
import VerificationStatusBadge from './VerificationStatusBadge';
import { useProfileData } from './useProfileData';
import { useVerificationStatus } from './useVerificationStatus';
import { useProfilePhotoPreview } from './useProfilePhotoPreview';

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

interface ProfileHeaderContainerProps {
  user: User;
  onProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCoverPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeaderContainer: React.FC<ProfileHeaderContainerProps> = ({ 
  user, 
  onProfilePhotoUpload,
  onCoverPhotoUpload
}) => {
  const { toast } = useToast();
  const { profileData, bankData } = useProfileData();
  const verificationStatus = useVerificationStatus(profileData, bankData, user);
  const {
    previewProfile,
    previewCover,
    handleProfilePhotoChange,
    handleCoverPhotoChange
  } = useProfilePhotoPreview(onProfilePhotoUpload, onCoverPhotoUpload);
  
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

export default ProfileHeaderContainer;
