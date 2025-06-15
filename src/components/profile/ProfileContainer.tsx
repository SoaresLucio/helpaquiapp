
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileHeader from './ProfileHeader';
import ProfileEditForm from './ProfileEditForm';
import { currentUser } from '@/data/mockData';

const ProfileContainer: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ProfileHeader user={currentUser} />
      <ProfileEditForm user={currentUser} />
    </div>
  );
};

export default ProfileContainer;
