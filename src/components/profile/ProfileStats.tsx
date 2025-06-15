
import React from 'react';
import { Star } from 'lucide-react';

interface ProfileStatsProps {
  userType: string;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ userType }) => {
  if (userType !== 'freelancer') {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t">
      <h4 className="font-semibold mb-2">Estatísticas</h4>
      <div className="flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        <span>4.5 (12 avaliações)</span>
      </div>
    </div>
  );
};

export default ProfileStats;
