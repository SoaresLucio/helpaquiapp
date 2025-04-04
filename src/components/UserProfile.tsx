
import React from 'react';
import { Star, MapPin, Calendar, Phone, Mail, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, serviceCategories } from '@/data/mockData';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const isClient = user.type === 'client';

  return (
    <div className="helpaqui-card overflow-hidden">
      {/* Cabeçalho do perfil */}
      <div className="relative h-32 bg-gradient-to-r from-helpaqui-blue to-helpaqui-green">
        <Button 
          variant="ghost" 
          size="sm"
          className="absolute top-2 right-2 text-white bg-black/20 hover:bg-black/30"
        >
          <Edit className="h-4 w-4 mr-1" />
          Editar Perfil
        </Button>
      </div>
      
      {/* Foto e informações principais */}
      <div className="px-4 pb-4 relative">
        <div className="flex flex-col sm:flex-row">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md -mt-12 mb-3 sm:mr-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="font-medium">{user.rating}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {isClient ? "Cliente" : "Profissional"}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2 text-helpaqui-blue" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-2 text-helpaqui-blue" />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Avaliações */}
      <div className="border-t px-4 py-4">
        <h3 className="font-semibold mb-3">Avaliações</h3>
        
        {user.reviews.length > 0 ? (
          <div className="space-y-4">
            {user.reviews.map(review => (
              <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
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
                <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                <p className="text-xs text-gray-500">{review.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Nenhuma avaliação ainda.</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
