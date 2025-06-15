
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserProfile from '../UserProfile';
import { currentUser } from '@/data/mockData';

const ProfileContainer: React.FC = () => {
  const { user: authUser } = useAuth();

  if (!authUser) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando perfil...</p>
      </div>
    );
  }

  const userProfile = {
    id: authUser.id,
    name: authUser.email?.split('@')[0] || 'Usuário',
    email: authUser.email || '',
    avatar: '/placeholder.svg',
    type: 'client' as const,
    isVerified: !!authUser.email_confirmed_at
  };

  return <UserProfile user={userProfile} />;
};

export default ProfileContainer;
