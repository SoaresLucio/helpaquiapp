
import React from 'react';
import { Star } from 'lucide-react';
import ResponseTimeIndicator from '@/components/ResponseTimeIndicator';
import { User } from '@/data/mockData';

interface ProfileStatsProps {
  user: User;
  isFreelancer: boolean;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ user, isFreelancer }) => {
  if (!isFreelancer) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Estatísticas</h3>
      <div className="flex items-center">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
        <span className="font-medium">{user.rating} ({user.reviews.length} avaliações)</span>
      </div>
      {user.responseTime && (
        <ResponseTimeIndicator 
          averageTime={user.responseTime} 
          responseRate={user.responseRate} 
        />
      )}
    </div>
  );
};

export default ProfileStats;
