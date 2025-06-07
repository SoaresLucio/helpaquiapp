
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RealUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  type: 'client' | 'professional';
  rating?: number;
  isVerified?: boolean;
}

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, userType, loading } = useAuth();
  const [currentUser, setCurrentUser] = useState<RealUser | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        const realUser: RealUser = {
          id: authUser.id,
          name: profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : authUser.email?.split('@')[0] || 'Usuário',
          email: authUser.email || '',
          phone: profile?.phone || '',
          avatar: profile?.avatar_url || '/placeholder.svg',
          type: userType === 'freelancer' ? 'professional' : 'client',
          isVerified: authUser.email_confirmed_at ? true : false
        };
        
        setCurrentUser(realUser);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      }
    };

    if (!loading && authUser) {
      fetchUserData();
    }
  }, [authUser, userType, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erro ao carregar perfil do usuário</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="helpaqui-container py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="flex items-center mb-4 text-gray-700 dark:text-gray-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Meu Perfil</h1>
          <UserProfile user={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
