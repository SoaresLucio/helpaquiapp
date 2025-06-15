
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  User, 
  FileText, 
  CreditCard,
  Crown,
  Briefcase,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickActions from '@/components/solicitante/QuickActions';
import OffersSection from '@/components/solicitante/OffersSection';
import FreelancerHome from '@/components/freelancer/FreelancerHome';

interface IndexMainContentProps {
  userType: 'solicitante' | 'freelancer';
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onChatRedirect: () => void;
  currentUser: any;
}

const IndexMainContent: React.FC<IndexMainContentProps> = ({
  userType,
  selectedCategory,
  onSelectCategory,
  activeTab,
  onTabChange,
  onChatRedirect,
  currentUser
}) => {
  const navigate = useNavigate();

  if (userType === 'freelancer') {
    return (
      <FreelancerHome 
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onChatRedirect={onChatRedirect}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Premium Subscription Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-purple-600" />
            Desbloqueie o Potencial Completo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Acesse recursos premium e encontre os melhores profissionais com facilidade
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/subscription-flow')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Crown className="h-4 w-4 mr-2" />
              Ver Planos Premium
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/subscription-history')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Minhas Assinaturas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Section */}
      <QuickActions onChatRedirect={onChatRedirect} />

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/offers')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Explorar Ofertas</h3>
                <p className="text-sm text-gray-600">Veja ofertas de profissionais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/my-requests')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Minhas Solicitações</h3>
                <p className="text-sm text-gray-600">Acompanhe suas solicitações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Meu Perfil</h3>
                <p className="text-sm text-gray-600">Gerenciar informações pessoais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/payment-settings')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Pagamentos</h3>
                <p className="text-sm text-gray-600">Métodos de pagamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/notes')}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold">Minhas Notas</h3>
                <p className="text-sm text-gray-600">Organize suas anotações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onChatRedirect}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold">Chat</h3>
                <p className="text-sm text-gray-600">Comunicação direta</p>
                <Badge variant="secondary" className="mt-1">
                  Em breve
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers Section */}
      <OffersSection />
    </div>
  );
};

export default IndexMainContent;
