
import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

  const validateCPF = (cpf: string): boolean => cpf.replace(/[^\d]/g, '').length === 11;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documents.identity.file || !documents.addressProof.file || !documents.selfie.file) {
      toast({ title: "Documentos obrigatórios", description: "Envie todos os documentos.", variant: "destructive" }); return;
    }
    if (!validateCPF(cpfNumber)) {
      toast({ title: "CPF inválido", description: "Verifique o CPF.", variant: "destructive" }); return;
    }
    setIsSubmitting(true);
    const timer = setInterval(() => { setVerificationProgress(prev => { if (prev >= 100) { clearInterval(timer); return 100; } return prev + 10; }); }, 500);
    setTimeout(() => { clearInterval(timer); setVerificationProgress(100); toast({ title: "Documentos enviados", description: "Verificação iniciada." }); setTimeout(() => { setIsSubmitting(false); setVerificationProgress(0); }, 1500); }, 6000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="container mx-auto py-6 max-w-4xl px-4">
        <div className="mb-6"><BackButton to="/dashboard" label="Voltar ao Início" /></div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-2xl font-bold mb-6 text-foreground">Verificação de Perfil</motion.h1>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-primary" />Perfil Verificado</CardTitle>
                <CardDescription>Envie seus documentos para obter o selo de verificação.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <CPFInput value={cpfNumber} onChange={setCpfNumber} />
                    <DocumentTypeSelector value={documentType} onChange={setDocumentType} />
                    <DocumentUpload id="identity-document" label="Documento de Identidade" required document={documents.identity} onFileChange={(e) => handleFileChange('identity', e)} onValidate={() => validateDocument('identity', documentType)} />
                    <DocumentUpload id="address-proof" label="Comprovante de Residência" required document={documents.addressProof} onFileChange={(e) => handleFileChange('addressProof', e)} onValidate={() => validateDocument('addressProof', documentType)} helpText="Conta de água, luz, telefone ou internet (últimos 3 meses)" />
                    <div className="space-y-2">
                      <DocumentUpload id="selfie" label="Selfie com Documento" required document={documents.selfie} accept="image/jpeg,image/png" onFileChange={(e) => handleFileChange('selfie', e)} onValidate={() => validateDocument('selfie', documentType)} />
                      <SelfieInstructions />
                    </div>
                    <DocumentUpload id="professional-cert" label="Certificado Profissional" document={documents.professional} onFileChange={(e) => handleFileChange('professional', e)} onValidate={() => validateDocument('professional', documentType)} helpText="Diplomas, certificações ou licenças" />
                    <Alert className="rounded-xl"><AlertCircle className="h-4 w-4" /><AlertTitle>Importante</AlertTitle><AlertDescription>Documentos analisados em até 3 dias úteis com validação segura.</AlertDescription></Alert>
                  </div>
                  <VerificationProgress isSubmitting={isSubmitting} progress={verificationProgress} />
                </form>
              </CardContent>
              <CardFooter>
                <Button className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25" onClick={handleSubmit} disabled={isSubmitting || !documents.identity.file || !documents.addressProof.file || !documents.selfie.file || !validateCPF(cpfNumber)}>
                  {isSubmitting ? "Enviando..." : "Enviar documentos para verificação"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <VerificationBenefits />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileVerification;
