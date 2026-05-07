
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Map } from 'lucide-react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import HelpRequestsList from '@/components/freelancer/HelpRequestsList';
import HelpsMap from '@/components/maps/HelpsMap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const HelpRequests: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  React.useEffect(() => {
    if (userType && userType !== 'freelancer') navigate('/dashboard');
  }, [userType, navigate]);

  if (userType && userType !== 'freelancer') return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto px-4 py-8">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Solicitações de Help</h1>
          <p className="text-muted-foreground">Encontre oportunidades de trabalho próximas a você</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <Tabs defaultValue="list" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-11 bg-muted/80 rounded-xl">
              <TabsTrigger value="list" className="flex items-center gap-2 rounded-lg"><MessageCircle className="h-4 w-4" />Lista</TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2 rounded-lg"><Map className="h-4 w-4" />Mapa</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <HelpRequestsList onStartConversation={(id) => navigate('/chat')} onViewProfile={(id) => navigate(`/freelancer/${id}`)} onAcceptRequest={() => {}} />
            </TabsContent>
            <TabsContent value="map">
              <HelpsMap onRequestSelect={(id) => { setSelectedRequestId(id); navigate(`/chat`); }} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HelpRequests;
