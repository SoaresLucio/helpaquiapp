
import React, { useState } from 'react';
import { ArrowLeft, Star, MapPin, Clock, BadgeCheck, MessageCircle, Phone, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/Header';
import { mockProfessionals } from '@/data/mockData';

const FreelancerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Em um app real, você buscaria o freelancer pelo ID
  const freelancer = mockProfessionals[0]; // Para demonstração
  
  const [showAllReviews, setShowAllReviews] = useState(false);

  const completedJobs = 47; // Mock data
  const responseRate = 98;
  const averageResponseTime = "1h";

  const reviews = [
    {
      id: '1',
      userName: 'Maria Silva',
      userAvatar: '/placeholder.svg',
      rating: 5,
      comment: 'Excelente trabalho! Muito profissional e entregou tudo no prazo acordado.',
      date: '2024-01-15',
      jobTitle: 'Desenvolvimento de Website'
    },
    {
      id: '2',
      userName: 'João Santos',
      userAvatar: '/placeholder.svg',
      rating: 5,
      comment: 'Superou minhas expectativas. Recomendo para todos!',
      date: '2024-01-10',
      jobTitle: 'Design de Logo'
    },
    {
      id: '3',
      userName: 'Ana Costa',
      userAvatar: '/placeholder.svg',
      rating: 4,
      comment: 'Bom trabalho, mas poderia ter mais comunicação durante o processo.',
      date: '2024-01-05',
      jobTitle: 'Consultoria em Marketing'
    },
    {
      id: '4',
      userName: 'Pedro Lima',
      userAvatar: '/placeholder.svg',
      rating: 5,
      comment: 'Fantástico! Trabalho de alta qualidade e atendimento excepcional.',
      date: '2023-12-28',
      jobTitle: 'Desenvolvimento de App'
    }
  ];

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  const handleStartChat = () => {
    // Redirecionar para página de chat ou abrir modal de chat
    navigate('/chat');
  };

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
          {/* Header do Perfil */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
                    <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                    freelancer.available ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  {freelancer.isVerified && (
                    <div className="absolute top-0 left-0 bg-blue-500 rounded-full p-1 border-2 border-white">
                      <BadgeCheck className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold flex items-center gap-2">
                        {freelancer.name}
                        {freelancer.isVerified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {freelancer.categories.join(' • ')}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{freelancer.distance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{freelancer.available ? 'Disponível agora' : 'Indisponível'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{freelancer.rating}</span>
                      </div>
                      <p className="text-xs text-gray-500">{freelancer.ratingCount} avaliações</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{completedJobs}</div>
                      <p className="text-xs text-gray-500">Trabalhos concluídos</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{responseRate}%</div>
                      <p className="text-xs text-gray-500">Taxa de resposta</p>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg">{averageResponseTime}</div>
                      <p className="text-xs text-gray-500">Tempo de resposta</p>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3">
                    <Button onClick={handleStartChat} className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Novo Bate-papo
                    </Button>
                    <Button variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Contato
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sobre */}
              <Card>
                <CardHeader>
                  <CardTitle>Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {freelancer.description}
                  </p>
                </CardContent>
              </Card>

              {/* Portfólio */}
              {freelancer.portfolio.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Portfólio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {freelancer.portfolio.map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                          <img 
                            src={image} 
                            alt={`Trabalho ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" 
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Avaliações */}
              <Card>
                <CardHeader>
                  <CardTitle>Avaliações ({reviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayedReviews.map((review, index) => (
                      <div key={review.id}>
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.userAvatar} alt={review.userName} />
                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium">{review.userName}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(review.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex">
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
                              <Badge variant="secondary" className="text-xs">
                                {review.jobTitle}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {review.comment}
                            </p>
                          </div>
                        </div>
                        {index < displayedReviews.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                    
                    {!showAllReviews && reviews.length > 2 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAllReviews(true)}
                        className="w-full mt-4"
                      >
                        Ver todas as avaliações ({reviews.length - 2} restantes)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Categorias de Trabalho */}
              <Card>
                <CardHeader>
                  <CardTitle>Categorias de Trabalho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.categories.map((category, index) => (
                      <Badge key={index} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Informações de Contato */}
              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{freelancer.price}</div>
                    <p className="text-sm text-gray-500">Preço base</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tempo de resposta:</span>
                      <span className="font-medium">{averageResponseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxa de resposta:</span>
                      <span className="font-medium">{responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Última atividade:</span>
                      <span className="font-medium">2 horas atrás</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
