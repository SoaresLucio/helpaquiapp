
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';
import { currentUser } from '@/data/mockData';
import Header from '@/components/Header';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="helpaqui-container py-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="flex items-center mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
          <UserProfile user={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
