
import React, { useState } from 'react';
import { Sun, Moon, BadgeCheck, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const SettingsTab: React.FC = () => {
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

  return (
    <div className="p-4 space-y-4">
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
          ) : verificationStatus === 'pending' ? (
            <div className="space-y-2">
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <FileText className="h-5 w-5 mr-2" />
                <span>Verificação em andamento</span>
              </div>
              <p className="text-sm text-gray-500">Estamos analisando seus documentos. Isso pode levar até 48 horas.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="cpf" className="block text-sm font-medium">CPF</label>
                <Input
                  id="cpf"
                  placeholder="Apenas números"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  maxLength={11}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="document-upload" className="block text-sm font-medium">Documento de identidade (RG ou CNH)</label>
                <Input
                  id="document-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleDocumentUpload}
                />
              </div>
              
              <Button 
                onClick={handleVerificationSubmit}
                disabled={isVerifying}
                className="w-full"
              >
                {isVerifying ? 'Enviando...' : 'Enviar para verificação'}
              </Button>
            </div>
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
    </div>
  );
};

export default SettingsTab;
