
import React from 'react';
import { Star, MapPin, Calendar, Phone, Mail, Edit, BadgeCheck, Clock, Shield, Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, serviceCategories } from '@/data/mockData';
import ResponseTimeIndicator from '@/components/ResponseTimeIndicator';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const isClient = user.type === 'client';
  const isVerified = user.isVerified || false;

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
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md -mt-12 mb-3 sm:mr-4">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-full h-full object-cover" 
            />
            {isVerified && (
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                <BadgeCheck className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <h2 className="text-xl font-bold">{user.name}</h2>
                {isVerified && (
                  <div className="group relative">
                    <BadgeCheck className="h-5 w-5 text-blue-500" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      Perfil Verificado
                    </div>
                  </div>
                )}
              </div>
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
            
            {!isClient && user.responseTime && (
              <div className="mt-3">
                <ResponseTimeIndicator 
                  averageTime={user.responseTime} 
                  responseRate={user.responseRate} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Garantia (para profissionais) */}
      {!isClient && (
        <div className="px-4 py-2 border-t border-b bg-green-50 flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">HELPAQUI Garantia</span>
          <span className="text-xs text-green-600">7 dias após conclusão</span>
        </div>
      )}
      
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
      
      {/* Redes sociais */}
      <div className="border-t px-4 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Redes sociais</h3>
          <div className="flex gap-2">
            <a href="https://facebook.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="https://instagram.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://twitter.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-400">
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
