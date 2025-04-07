
import React, { useState } from 'react';
import { Star, MapPin, Calendar, Phone, Mail, Edit, BadgeCheck, Clock, Shield, Facebook, Instagram, Twitter, Sun, Moon, Upload, FileText, CreditCard, DollarSign, Camera, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, serviceCategories } from '@/data/mockData';
import ResponseTimeIndicator from '@/components/ResponseTimeIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  
  // Bank information
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  
  // Photo upload states
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  
  // Mock income data
  const incomeData = [
    { id: 1, date: '10/04/2023', description: 'Serviço de Limpeza', amount: 150.00 },
    { id: 2, date: '15/04/2023', description: 'Serviço de Jardinagem', amount: 200.00 },
    { id: 3, date: '22/04/2023', description: 'Conserto Elétrico', amount: 180.00 }
  ];
  
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
  
  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
      
      // Preview would be implemented here in a real app
      toast({
        title: "Foto de perfil carregada",
        description: "Sua foto de perfil foi atualizada com sucesso."
      });
    }
  };
  
  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverPhoto(e.target.files[0]);
      
      // Preview would be implemented here in a real app
      toast({
        title: "Foto de capa carregada",
        description: "Sua foto de capa foi atualizada com sucesso."
      });
    }
  };

  const handleBankDetailsSubmit = () => {
    if (!bankName || !accountType || !accountNumber || !branch) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos bancários.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Detalhes bancários salvos",
      description: "Seus dados bancários foram atualizados com sucesso."
    });
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
      <div className="relative h-48 bg-gradient-to-r from-helpaqui-blue to-helpaqui-green">
        <label htmlFor="cover-upload" className="absolute bottom-2 right-2 bg-black/20 p-2 rounded-full cursor-pointer hover:bg-black/30 transition-colors">
          <Camera className="h-5 w-5 text-white" />
          <input id="cover-upload" type="file" accept="image/*" className="sr-only" onChange={handleCoverPhotoUpload} />
        </label>
      </div>
      
      <div className="px-4 relative">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white bg-white shadow-md -mt-12 mx-auto">
          <img 
            src={user.avatar} 
            alt={user.name}
            className="w-full h-full object-cover" 
          />
          <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-helpaqui-blue p-1 rounded-full cursor-pointer">
            <Pencil className="h-3 w-3 text-white" />
            <input id="profile-upload" type="file" accept="image/*" className="sr-only" onChange={handleProfilePhotoUpload} />
          </label>
        </div>
        
        <div className="text-center my-4">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {user.type === 'professional' ? "Profissional" : "Solicitante"}
            {isVerified && (
              <BadgeCheck className="inline-block ml-1 h-4 w-4 text-blue-500" />
            )}
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="profile" className="flex-1">Perfil</TabsTrigger>
          <TabsTrigger value="bank" className="flex-1">Dados Bancários</TabsTrigger>
          <TabsTrigger value="income" className="flex-1">Rendimentos</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="p-4 space-y-4">
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
            </>
          )}
          
          <Separator />
          
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
        </TabsContent>
        
        <TabsContent value="bank" className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados Bancários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="bank-name" className="block text-sm font-medium">Nome do Banco</label>
                <Input
                  id="bank-name"
                  placeholder="Ex: Banco do Brasil"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="dark:bg-gray-800"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="account-type" className="block text-sm font-medium">Tipo de Conta</label>
                <Input
                  id="account-type"
                  placeholder="Ex: Corrente, Poupança"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="dark:bg-gray-800"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="account-number" className="block text-sm font-medium">Número da Conta</label>
                  <Input
                    id="account-number"
                    placeholder="Ex: 12345-6"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="dark:bg-gray-800"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="branch" className="block text-sm font-medium">Agência</label>
                  <Input
                    id="branch"
                    placeholder="Ex: 0001"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="dark:bg-gray-800"
                  />
                </div>
              </div>
              
              <Button onClick={handleBankDetailsSubmit} className="w-full">
                Salvar Dados Bancários
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Formas de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">Adicione novos métodos de pagamento para suas transações:</p>
              <Button className="flex items-center w-full justify-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Adicionar Novo Cartão
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="p-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Rendimentos</span>
                <span className="text-helpaqui-green text-xl">R$ 530,00</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incomeData.length > 0 ? (
                <div className="divide-y">
                  {incomeData.map(income => (
                    <div key={income.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{income.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{income.date}</p>
                      </div>
                      <p className="font-medium text-helpaqui-green">R$ {income.amount.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">Nenhum rendimento registrado</p>
              )}
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center mt-2">
                <span className="font-medium">Disponível para saque:</span>
                <span className="text-helpaqui-green font-bold">R$ 530,00</span>
              </div>
              
              <Button className="w-full mt-4 flex items-center justify-center">
                <DollarSign className="mr-2 h-4 w-4" /> 
                Solicitar Saque
              </Button>
            </CardContent>
          </Card>
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
            <h3 className="text-lg font-semibold">Verificação de Conta</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {verificationStatus === 'verified' ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <BadgeCheck className="h-5 w-5 mr-2" />
                  <span>Sua conta está verificada</span>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setVerificationStatus('none')}
                >
                  Verificar Minha Conta
                </Button>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Segurança</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <Button variant="outline" className="w-full">Alterar Senha</Button>
              <Button variant="outline" className="w-full">Autenticação em Dois Fatores</Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Notificações</h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span>Notificações por Email</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span>Notificações por Push</span>
                <input type="checkbox" className="toggle toggle-primary" defaultChecked />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
