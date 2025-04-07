import React, { useState } from 'react';
import { Star, MapPin, Calendar, Phone, Mail, Edit, BadgeCheck, Clock, Shield, Facebook, Instagram, Twitter, Sun, Moon, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, serviceCategories } from '@/data/mockData';
import ResponseTimeIndicator from '@/components/ResponseTimeIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const isFreelancer = user.type === 'professional';
  const isVerified = user.isVerified || false;
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const { toast } = useToast();

  const [cpf, setCpf] = useState('');
  const [document, setDocument] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'verified'>('none');
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    window.document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocument(e.target.files[0]);
    }
  };

  const handleVerificationSubmit = () => {
    if (!cpf || cpf.length !== 11) {
      toast({
        title: "Erro de validação",
        description: "Por favor, insira um CPF válido (11 dígitos).",
        variant: "destructive"
      });
      return;
    }

    if (!document) {
      toast({
        title: "Documento necessário",
        description: "Por favor, envie uma cópia do seu documento.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStatus('pending');
      
      toast({
        title: "Documentos enviados",
        description: "Seus documentos foram enviados para verificação. Você será notificado quando o processo for concluído."
      });
    }, 2000);
  };

  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const submitRating = () => {
    if (!rating) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação de estrelas.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Avaliação enviada",
      description: "Obrigado por avaliar este serviço!"
    });

    setRating(null);
    setFeedback('');
  };

  return (
    <div className="helpaqui-card overflow-hidden dark:bg-gray-800 dark:text-white">
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
      
      <Tabs defaultValue="profile">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">Perfil</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
          <TabsTrigger value="verification" className="flex-1">Verificação</TabsTrigger>
          <TabsTrigger value="ratings" className="flex-1">Avaliações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
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
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {isFreelancer ? "Freelancer" : "Solicitante"}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Mail className="h-4 w-4 mr-2 text-helpaqui-blue" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4 mr-2 text-helpaqui-blue" />
                    <span>{user.phone}</span>
                  </div>
                </div>
                
                {isFreelancer && user.responseTime && (
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
          
          {isFreelancer && (
            <div className="px-4 py-2 border-t border-b bg-green-50 dark:bg-green-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600 dark:text-green-300" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">HELPAQUI Garantia</span>
              <span className="text-xs text-green-600 dark:text-green-300">7 dias após conclusão</span>
            </div>
          )}
          
          <div className="border-t px-4 py-4">
            <h3 className="font-semibold mb-3">Avaliações Recebidas</h3>
            
            {user.reviews.length > 0 ? (
              <div className="space-y-4">
                {user.reviews.map(review => (
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
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{review.comment}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{review.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma avaliação ainda.</p>
            )}
          </div>
          
          <div className="border-t px-4 py-3 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Redes sociais</h3>
              <div className="flex gap-2">
                <a href="https://facebook.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-600">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://instagram.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-pink-600">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://twitter.com/helpaqui" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-blue-400">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aparência</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center">
                {theme === 'light' ? (
                  <Sun className="h-5 w-5 mr-2 text-orange-400" />
                ) : (
                  <Moon className="h-5 w-5 mr-2 text-blue-400" />
                )}
                <span>{theme === 'light' ? 'Modo Claro' : 'Modo Escuro'}</span>
              </div>
              <Button onClick={toggleTheme} variant="outline" size="sm">
                Mudar para {theme === 'light' ? 'Escuro' : 'Claro'}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informações de Pagamento</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {isFreelancer ? (
                <>
                  <p className="text-sm mb-3">Valor mínimo para saque: R$10</p>
                  <Button className="w-full mb-2">Adicionar Dados Bancários</Button>
                </>
              ) : (
                <>
                  <p className="text-sm mb-3">Adicione um método de pagamento</p>
                  <Button className="w-full mb-2">Adicionar Método de Pagamento</Button>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="verification" className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Verificação de Cadastro</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm mb-3">
                {verificationStatus === 'none' && "Envie seus documentos para verificar sua conta e garantir mais segurança para todos os usuários."}
                {verificationStatus === 'pending' && "Seus documentos estão em análise. Você receberá uma notificação quando a verificação for concluída."}
                {verificationStatus === 'verified' && "Sua conta está verificada! Obrigado por ajudar a manter a plataforma segura."}
              </p>
              
              {verificationStatus === 'none' && (
                <>
                  <div className="mb-3 space-y-2">
                    <label htmlFor="cpf" className="block text-sm font-medium">CPF</label>
                    <Input
                      id="cpf"
                      placeholder="Digite seu CPF (apenas números)"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="dark:bg-gray-800"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Documento com Foto (CNH ou RG)</label>
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <div className="space-y-2 text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <label htmlFor="file-upload" className="cursor-pointer font-medium text-helpaqui-blue dark:text-helpaqui-blue hover:underline">
                            Selecione um arquivo
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleDocumentUpload} />
                          </label>
                          <p className="mt-1">ou arraste e solte</p>
                        </div>
                        {document && (
                          <p className="text-sm text-green-500">{document.name}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleVerificationSubmit} disabled={isVerifying} className="w-full">
                    {isVerifying ? "Enviando..." : "Enviar para Verificação"}
                  </Button>
                </>
              )}
              
              {verificationStatus === 'pending' && (
                <div className="flex items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-700 dark:text-yellow-300">Verificação em andamento</span>
                </div>
              )}
              
              {verificationStatus === 'verified' && (
                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
                  <BadgeCheck className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-green-700 dark:text-green-300">Conta verificada</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ratings" className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Avaliar Serviço</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm mb-3">Avalie a qualidade do serviço prestado:</p>
              
              <div className="flex items-center justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating && star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              
              <div className="mb-4">
                <label htmlFor="feedback" className="block text-sm font-medium mb-1">Comentário</label>
                <textarea
                  id="feedback"
                  className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                  placeholder="O que você achou do serviço?"
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                ></textarea>
              </div>
              
              <Button onClick={submitRating} className="w-full">
                Enviar Avaliação
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
