
import React, { useState } from 'react';
import { Camera, Mail, Phone, Pencil, Star, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import ResponseTimeIndicator from '@/components/ResponseTimeIndicator';
import { User } from '@/data/mockData';

interface ProfileTabProps {
  user: User;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user }) => {
  const { toast } = useToast();
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const isFreelancer = user.type === 'professional';
  const isVerified = user.isVerified || false;

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
      
      toast({
        title: "Foto de perfil carregada",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    }
  };
  
  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPhoto(e.target.files[0]);
      
      toast({
        title: "Foto de capa carregada",
        description: "Sua foto de capa foi atualizada com sucesso."
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Informações de Contato</h3>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Mail className="h-4 w-4 mr-2 text-helpaqui-blue" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-300">
            <Phone className="h-4 w-4 mr-2 text-helpaqui-blue" />
            <span>{user.phone}</span>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            <Pencil className="h-3 w-3 mr-1" /> Editar Informações
          </Button>
        </div>
        
        {isFreelancer && (
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
        )}
      </div>
      
      {isFreelancer && (
        <>
          <Separator />
          <ReviewsSection user={user} />
        </>
      )}
      
      <Separator />
      
      <SocialLinks />
    </div>
  );
};

interface ReviewsSectionProps {
  user: User;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ user }) => {
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

const SocialLinks: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Redes sociais</h3>
      <div className="flex gap-2">
        <a href="https://facebook.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="https://instagram.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-pink-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
        </a>
        <a href="https://twitter.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
        </a>
      </div>
    </div>
  );
};

export default ProfileTab;
