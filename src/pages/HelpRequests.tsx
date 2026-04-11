import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Map } from 'lucide-react';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import HelpRequestsList from '@/components/freelancer/HelpRequestsList';
import HelpRequestsMap from '@/components/freelancer/HelpRequestsMap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const HelpRequests: React.FC = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  // Redirect if not freelancer
  React.useEffect(() => {
    if (userType && userType !== 'freelancer') {
      navigate('/dashboard');
    }
  }, [userType, navigate]);

  const handleStartConversation = (clientId: string) => {
    navigate('/chat');
  };

  const handleViewProfile = (clientId: string) => {
    navigate(`/freelancer/${clientId}`);
  };

  const handleAcceptRequest = (requestId: string) => {
    // Could show a success message or navigate to proposals page
    console.log('Request accepted:', requestId);
  };

  const handleRequestSelect = (requestId: string) => {
    setSelectedRequestId(requestId);
    // Could scroll to the request in the list or show more details
  };

  if (userType && userType !== 'freelancer') {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Solicitações de Help
          </h1>
          <p className="text-gray-600">
            Encontre oportunidades de trabalho próximas a você
          </p>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <HelpRequestsList
              onStartConversation={handleStartConversation}
              onViewProfile={handleViewProfile}
              onAcceptRequest={handleAcceptRequest}
            />
          </TabsContent>

          <TabsContent value="map">
            <HelpRequestsMap
              onRequestSelect={handleRequestSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpRequests;