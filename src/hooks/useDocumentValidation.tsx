
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { DocumentState } from '@/components/profile-verification/DocumentUpload';

export const useDocumentValidation = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Record<string, DocumentState>>({
    identity: { file: null, status: 'idle', message: '' },
    addressProof: { file: null, status: 'idle', message: '' },
    selfie: { file: null, status: 'idle', message: '' },
    professional: { file: null, status: 'idle', message: '' },
  });

  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments(prev => ({
        ...prev,
        [type]: { file, status: 'idle', message: '' }
      }));
    }
  };

  const getDocumentTypeLabel = (type: string, documentType = 'rg'): string => {
    switch (type) {
      case 'identity': return documentType === 'rg' ? 'RG' : 'CNH';
      case 'addressProof': return 'comprovante de residência';
      case 'selfie': return 'selfie';
      case 'professional': return 'certificado profissional';
      default: return 'documento';
    }
  };

  const validateDocument = (type: string, documentType = 'rg') => {
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
          description: `O ${getDocumentTypeLabel(type, documentType)} foi validado com sucesso.`
        });
      } else {
        toast({
          title: "Problema com documento",
          description: `O ${getDocumentTypeLabel(type, documentType)} não pôde ser validado. Tente novamente.`,
          variant: "destructive"
        });
      }
    }, 2000);
  };

  return {
    documents,
    handleFileChange,
    validateDocument,
    getDocumentTypeLabel
  };
};
