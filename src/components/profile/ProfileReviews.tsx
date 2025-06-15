
import React from 'react';
import { Star } from 'lucide-react';
import { User } from '@/data/mockData';

interface ProfileReviewsProps {
  user: User;
}

const ProfileReviews: React.FC<ProfileReviewsProps> = ({ user }) => {
  return (
    <div>
      <h3 className="font-semibold mb-2">Avaliações Recentes</h3>
      {user.reviews.length > 0 ? (
        <div className="space-y-3">
          {user.reviews.slice(0, 3).map(review => (
            <div key={review.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{review.userName}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < review.rating 
                          ? 'text-yellow-500 fill-yellow-500' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma avaliação ainda.</p>
      )}
    </div>
  );
};

export default ProfileReviews;
