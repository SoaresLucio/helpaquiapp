
import React from 'react';
import ProfileHeaderContainer from './header/ProfileHeaderContainer';

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
  return (
    <ProfileHeaderContainer
      user={user}
      onProfilePhotoUpload={onProfilePhotoUpload}
      onCoverPhotoUpload={onCoverPhotoUpload}
    />
  );
};

export default ProfileHeader;
