
import React, { useState } from 'react';
import Header from '@/components/Header';
import CategorySelector from '@/components/CategorySelector';
import ServiceMap from '@/components/ServiceMap';
import ProfessionalCard from '@/components/ProfessionalCard';
import ServiceRequest from '@/components/ServiceRequest';
import ChatInterface from '@/components/ChatInterface';
import UserProfile from '@/components/UserProfile';
import { 
  mockProfessionals, 
  mockUsers,
  serviceCategories
} from '@/data/mockData';
import { 
  ArrowUp, 
  Star,
  Filter,
  MapPin,
  Clock,
  MessageCircle,
  PhoneCall
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Filtrar profissionais por categoria
  const filteredProfessionals = selectedCategory
    ? mockProfessionals.filter(pro => pro.categories.includes(selectedCategory))
    : mockProfessionals;

  // Obter nome da categoria selecionada
  const selectedCategoryName = selectedCategory 
    ? serviceCategories.find(cat => cat.id === selectedCategory)?.name 
    : null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        {/* Seletor de Categorias */}
        <CategorySelector 
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Coluna Principal */}
          <div className="flex-1">
            {/* Mapa */}
            <section className="mb-6">
              <ServiceMap selectedCategory={selectedCategory} />
            </section>
            
            {/* Lista de Profissionais */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {selectedCategoryName 
                    ? `Profissionais de ${selectedCategoryName}` 
                    : 'Profissionais Recomendados'}
                </h2>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Ordenar
                  </Button>
                </div>
              </div>
              
              {filteredProfessionals.length > 0 ? (
                <div>
                  {filteredProfessionals.map(professional => (
                    <ProfessionalCard 
                      key={professional.id} 
                      professional={professional}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg">
                  <p className="text-gray-500">
                    Nenhum profissional encontrado nesta categoria.
                  </p>
                  <Button 
                    variant="link" 
                    onClick={() => setSelectedCategory(null)}
                  >
                    Ver todas as categorias
                  </Button>
                </div>
              )}
            </section>
          </div>
          
          {/* Coluna Lateral */}
          <div className="w-full md:w-[350px] lg:w-[400px] space-y-4">
            <Tabs defaultValue="request">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="request">Solicitar</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="profile">Perfil</TabsTrigger>
              </TabsList>
              
              <TabsContent value="request">
                <ServiceRequest />
              </TabsContent>
              
              <TabsContent value="chat">
                <ChatInterface 
                  recipientId={mockUsers[1].id}
                  recipientName={mockUsers[1].name}
                  recipientAvatar={mockUsers[1].avatar}
                />
              </TabsContent>
              
              <TabsContent value="profile">
                <UserProfile user={mockUsers[0]} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      {/* Barra de navegação móvel */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around p-2 z-10">
        <button 
          className="flex flex-col items-center p-2"
          onClick={() => {
            setShowServiceRequest(true);
            setShowChat(false);
            setShowProfile(false);
          }}
        >
          <MapPin className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Solicitar</span>
        </button>
        
        <button 
          className="flex flex-col items-center p-2"
          onClick={() => {
            setShowChat(true);
            setShowServiceRequest(false);
            setShowProfile(false);
          }}
        >
          <MessageCircle className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Chat</span>
        </button>
        
        <button className="flex flex-col items-center p-2">
          <PhoneCall className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Contatos</span>
        </button>
        
        <button 
          className="flex flex-col items-center p-2"
          onClick={() => {
            setShowProfile(true);
            setShowServiceRequest(false);
            setShowChat(false);
          }}
        >
          <User className="h-6 w-6 text-helpaqui-blue" />
          <span className="text-xs mt-1">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default Index;
