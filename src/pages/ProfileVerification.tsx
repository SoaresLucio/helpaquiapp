
import React, { useState } from 'react';
import { AlertCircle, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import BackButton from '@/components/ui/back-button';
import CPFInput from '@/components/profile-verification/CPFInput';
import DocumentTypeSelector from '@/components/profile-verification/DocumentTypeSelector';
import DocumentUpload from '@/components/profile-verification/DocumentUpload';
import SelfieInstructions from '@/components/profile-verification/SelfieInstructions';
import VerificationBenefits from '@/components/profile-verification/VerificationBenefits';
import VerificationProgress from '@/components/profile-verification/VerificationProgress';
import { useDocumentValidation } from '@/hooks/useDocumentValidation';

const ProfileVerification = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [cpfNumber, setCpfNumber] = useState('');
  const [documentType, setDocumentType] = useState('rg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const { documents, handleFileChange, validateDocument } = useDocumentValidation();

  // Simple CPF validation
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    return cleanCPF.length === 11;
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
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="mb-6">
          <BackButton to="/dashboard" label="Voltar ao Início" />
        </div>

        <h1 className="text-2xl font-bold mb-6">Verificação de Perfil</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-helpaqui-purple" />
                Perfil Verificado
              </CardTitle>
              <CardDescription>
                Envie seus documentos para obter o selo de verificação e aumentar sua credibilidade.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <CPFInput value={cpfNumber} onChange={setCpfNumber} />
                  
                  <DocumentTypeSelector value={documentType} onChange={setDocumentType} />
                  
                  <DocumentUpload
                    id="identity-document"
                    label="Documento de Identidade"
                    required
                    document={documents.identity}
                    onFileChange={(e) => handleFileChange('identity', e)}
                    onValidate={() => validateDocument('identity', documentType)}
                  />
                  
                  <DocumentUpload
                    id="address-proof"
                    label="Comprovante de Residência"
                    required
                    document={documents.addressProof}
                    onFileChange={(e) => handleFileChange('addressProof', e)}
                    onValidate={() => validateDocument('addressProof', documentType)}
                    helpText="Conta de água, luz, telefone ou internet em seu nome (últimos 3 meses)"
                  />
                  
                  <div className="space-y-2">
                    <DocumentUpload
                      id="selfie"
                      label="Selfie com Documento"
                      required
                      document={documents.selfie}
                      accept="image/jpeg,image/png"
                      onFileChange={(e) => handleFileChange('selfie', e)}
                      onValidate={() => validateDocument('selfie', documentType)}
                    />
                    <SelfieInstructions />
                  </div>
                  
                  <DocumentUpload
                    id="professional-cert"
                    label="Certificado Profissional"
                    document={documents.professional}
                    onFileChange={(e) => handleFileChange('professional', e)}
                    onValidate={() => validateDocument('professional', documentType)}
                    helpText="Diplomas, certificações ou licenças relevantes para sua área de atuação"
                  />
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Importante</AlertTitle>
                    <AlertDescription>
                      Seus documentos serão analisados em até 3 dias úteis. Usamos sistemas seguros de validação documental para garantir a autenticidade.
                    </AlertDescription>
                  </Alert>
                </div>
                
                <VerificationProgress isSubmitting={isSubmitting} progress={verificationProgress} />
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
          
          <VerificationBenefits />
        </div>
      </div>
    </div>
  );
};

export default ProfileVerification;
