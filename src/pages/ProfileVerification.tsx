
import React, { useState } from 'react';
import { AlertCircle, BadgeCheck, Upload, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';

type DocumentStatus = 'idle' | 'validating' | 'valid' | 'invalid';

interface DocumentState {
  file: File | null;
  status: DocumentStatus;
  message: string;
}

const ProfileVerification = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [cpfNumber, setCpfNumber] = useState('');
  const [documentType, setDocumentType] = useState('rg');
  const [documents, setDocuments] = useState<Record<string, DocumentState>>({
    identity: { file: null, status: 'idle', message: '' },
    addressProof: { file: null, status: 'idle', message: '' },
    selfie: { file: null, status: 'idle', message: '' },
    professional: { file: null, status: 'idle', message: '' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments(prev => ({
        ...prev,
        [type]: { file, status: 'idle', message: '' }
      }));
    }
  };

  // Simulate CPF validation
  const validateCPF = (cpf: string): boolean => {
    // Simple validation for demo purposes
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    return cleanCPF.length === 11;
  };

  const handleCPFBlur = () => {
    if (cpfNumber && !validateCPF(cpfNumber)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, verifique o número do CPF informado.",
        variant: "destructive",
      });
    } else if (cpfNumber && validateCPF(cpfNumber)) {
      toast({
        title: "CPF válido",
        description: "O formato do CPF parece correto.",
      });
    }
  };

  const validateDocument = (type: string) => {
    if (!documents[type].file) return;

    setDocuments(prev => ({
      ...prev,
      [type]: { ...prev[type], status: 'validating', message: 'Validando documento...' }
    }));

    // Simulate document validation API call
    setTimeout(() => {
      // Random result for demo purposes (90% success rate)
      const isValid = Math.random() < 0.9;
      
      setDocuments(prev => ({
        ...prev,
        [type]: { 
          ...prev[type], 
          status: isValid ? 'valid' : 'invalid', 
          message: isValid 
            ? 'Documento válido' 
            : 'Documento inválido ou de baixa qualidade. Por favor, tente novamente.'
        }
      }));
      
      if (isValid) {
        toast({
          title: "Documento validado",
          description: `O ${getDocumentTypeLabel(type)} foi validado com sucesso.`
        });
      } else {
        toast({
          title: "Problema com documento",
          description: `O ${getDocumentTypeLabel(type)} não pôde ser validado. Tente novamente.`,
          variant: "destructive"
        });
      }
    }, 2000);
  };

  const getDocumentTypeLabel = (type: string): string => {
    switch (type) {
      case 'identity': return documentType === 'rg' ? 'RG' : 'CNH';
      case 'addressProof': return 'comprovante de residência';
      case 'selfie': return 'selfie';
      case 'professional': return 'certificado profissional';
      default: return 'documento';
    }
  };

  const getDocumentStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'validating': return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'valid': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'invalid': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for required documents
    if (!documents.identity.file || !documents.addressProof.file || !documents.selfie.file) {
      toast({
        title: "Documentos obrigatórios",
        description: "Por favor, envie todos os documentos obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateCPF(cpfNumber)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, verifique o número do CPF informado.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate verification process
    const timer = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    setTimeout(() => {
      clearInterval(timer);
      setVerificationProgress(100);
      
      toast({
        title: "Documentos enviados com sucesso",
        description: "Iniciaremos o processo de verificação em breve.",
      });
      
      setTimeout(() => {
        setIsSubmitting(false);
        setVerificationProgress(0);
      }, 1500);
    }, 6000);
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Verificação de Perfil</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-helpaqui-blue" />
              Perfil Verificado
            </CardTitle>
            <CardDescription>
              Envie seus documentos para obter o selo de verificação e aumentar sua credibilidade.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input 
                    id="cpf" 
                    placeholder="000.000.000-00" 
                    value={cpfNumber}
                    onChange={e => setCpfNumber(e.target.value)}
                    onBlur={handleCPFBlur}
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Seu CPF será validado através de nossas bases de dados
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de documento de identidade</Label>
                  <RadioGroup 
                    value={documentType} 
                    onValueChange={setDocumentType}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rg" id="radio-rg" />
                      <Label htmlFor="radio-rg">RG</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cnh" id="radio-cnh" />
                      <Label htmlFor="radio-cnh">CNH</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="identity-document">
                      Documento de Identidade 
                      <span className="text-red-500">*</span>
                    </Label>
                    {getDocumentStatusIcon(documents.identity.status)}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      id="identity-document" 
                      type="file" 
                      onChange={(e) => handleFileChange('identity', e)}
                      className="flex-1"
                      accept="image/jpeg,image/png,application/pdf"
                      required
                    />
                    {documents.identity.file && (
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => validateDocument('identity')}
                        disabled={documents.identity.status === 'validating'}
                      >
                        Validar
                      </Button>
                    )}
                  </div>
                  {documents.identity.message && (
                    <p className={`text-xs ${documents.identity.status === 'valid' ? 'text-green-600' : documents.identity.status === 'invalid' ? 'text-red-600' : 'text-blue-600'}`}>
                      {documents.identity.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="address-proof">
                      Comprovante de Residência 
                      <span className="text-red-500">*</span>
                    </Label>
                    {getDocumentStatusIcon(documents.addressProof.status)}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      id="address-proof" 
                      type="file" 
                      onChange={(e) => handleFileChange('addressProof', e)}
                      className="flex-1"
                      accept="image/jpeg,image/png,application/pdf"
                      required
                    />
                    {documents.addressProof.file && (
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => validateDocument('addressProof')}
                        disabled={documents.addressProof.status === 'validating'}
                      >
                        Validar
                      </Button>
                    )}
                  </div>
                  {documents.addressProof.message && (
                    <p className={`text-xs ${documents.addressProof.status === 'valid' ? 'text-green-600' : documents.addressProof.status === 'invalid' ? 'text-red-600' : 'text-blue-600'}`}>
                      {documents.addressProof.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Conta de água, luz, telefone ou internet em seu nome (últimos 3 meses)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="selfie">
                      Selfie com Documento 
                      <span className="text-red-500">*</span>
                    </Label>
                    {getDocumentStatusIcon(documents.selfie.status)}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      id="selfie" 
                      type="file" 
                      onChange={(e) => handleFileChange('selfie', e)}
                      className="flex-1"
                      accept="image/jpeg,image/png"
                      required
                    />
                    {documents.selfie.file && (
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => validateDocument('selfie')}
                        disabled={documents.selfie.status === 'validating'}
                      >
                        Validar
                      </Button>
                    )}
                  </div>
                  {documents.selfie.message && (
                    <p className={`text-xs ${documents.selfie.status === 'valid' ? 'text-green-600' : documents.selfie.status === 'invalid' ? 'text-red-600' : 'text-blue-600'}`}>
                      {documents.selfie.message}
                    </p>
                  )}
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="link" size="sm" className="p-0 text-xs h-auto">Como tirar uma selfie com documento?</Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium">Instruções para selfie com documento</h4>
                        <p className="text-sm">
                          Tire uma foto segurando seu documento de identidade ao lado do rosto.
                          Certifique-se que seu rosto e as informações do documento estejam claramente visíveis.
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="professional-cert">
                      Certificado Profissional
                      <span className="text-gray-500"> (opcional)</span>
                    </Label>
                    {documents.professional.file && getDocumentStatusIcon(documents.professional.status)}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      id="professional-cert" 
                      type="file" 
                      onChange={(e) => handleFileChange('professional', e)}
                      className="flex-1"
                      accept="image/jpeg,image/png,application/pdf"
                    />
                    {documents.professional.file && (
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => validateDocument('professional')}
                        disabled={documents.professional.status === 'validating'}
                      >
                        Validar
                      </Button>
                    )}
                  </div>
                  {documents.professional.message && (
                    <p className={`text-xs ${documents.professional.status === 'valid' ? 'text-green-600' : documents.professional.status === 'invalid' ? 'text-red-600' : 'text-blue-600'}`}>
                      {documents.professional.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Diplomas, certificações ou licenças relevantes para sua área de atuação
                  </p>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Seus documentos serão analisados em até 3 dias úteis. Usamos sistemas seguros de validação documental para garantir a autenticidade.
                  </AlertDescription>
                </Alert>
              </div>
              
              {isSubmitting && (
                <div className="space-y-2">
                  <Label className="text-sm">Progresso da verificação</Label>
                  <Progress value={verificationProgress} className="h-2" />
                  <p className="text-xs text-center text-gray-500">
                    {verificationProgress < 100 
                      ? "Validando e enviando documentos..." 
                      : "Documentos enviados com sucesso!"}
                  </p>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleSubmit} 
              disabled={isSubmitting || !documents.identity.file || !documents.addressProof.file || !documents.selfie.file || !validateCPF(cpfNumber)}
            >
              {isSubmitting ? "Enviando..." : "Enviar documentos para verificação"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Benefícios da Verificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <BadgeCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Selo de Verificação</h3>
                  <p className="text-sm text-gray-500">Destaque-se com um selo de verificação no seu perfil</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Mais Confiança</h3>
                  <p className="text-sm text-gray-500">Clientes tendem a escolher profissionais verificados</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">Prioridade nas Buscas</h3>
                  <p className="text-sm text-gray-500">Apareça antes dos não verificados nos resultados</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Processo de Verificação</h3>
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">1. Envio de Documentos</h4>
                    <p className="text-xs text-gray-600">
                      Envie todos os documentos solicitados. Certifique-se de que as imagens estejam nítidas e legíveis.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">2. Validação Automática</h4>
                    <p className="text-xs text-gray-600">
                      Nosso sistema faz uma validação inicial de autenticidade dos seus documentos e verifica se o CPF está regularizado.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">3. Análise de Documentos</h4>
                    <p className="text-xs text-gray-600">
                      Nossa equipe analisa os documentos enviados para confirmar sua veracidade. Este processo pode levar até 3 dias úteis.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">4. Verificação Completa</h4>
                    <p className="text-xs text-gray-600">
                      Após a aprovação, seu perfil receberá o selo de verificação e você terá acesso a todos os benefícios.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">5. Reavaliação Anual</h4>
                    <p className="text-xs text-gray-600">
                      Para manter seu status de verificado, realizamos uma reavaliação anual simplificada.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Documentos Aceitos</h3>
              <ul className="text-sm text-gray-500 space-y-1 list-disc pl-5">
                <li>RG ou CNH (frente e verso)</li>
                <li>Comprovante de residência recente (últimos 3 meses)</li>
                <li>Selfie com documento de identidade</li>
                <li>Certificações profissionais (opcional, aumenta credibilidade)</li>
                <li>Registro profissional (se aplicável para sua área)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileVerification;
