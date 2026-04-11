
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';
import { currentUser } from '@/data/mockData';
import Header from '@/components/Header';

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center mb-4 text-foreground rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />Voltar
        </Button>
        <div className="max-w-4xl mx-auto">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-2xl font-bold mb-6 text-foreground">Meu Perfil</motion.h1>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <UserProfile user={currentUser} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfilePage;
