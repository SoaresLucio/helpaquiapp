
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Key } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ isEnabled, onToggle }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();

  const handleEnable2FA = async () => {
    try {
      // Simulate QR code generation for authenticator app
      const mockQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const mockBackupCodes = [
        '123456789',
        '987654321',
        '456789123',
        '789123456',
        '321654987'
      ];
      
      setQrCode(mockQrCode);
      setBackupCodes(mockBackupCodes);
      setShowSetup(true);
      
      toast({
        title: "2FA Setup Iniciado",
        description: "Use um aplicativo autenticador para escanear o QR code"
      });
    } catch (error) {
      toast({
        title: "Erro no 2FA",
        description: "Não foi possível configurar a autenticação de dois fatores",
        variant: "destructive"
      });
    }
  };

  const handleVerify2FA = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Digite um código de 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate verification
      if (verificationCode === '123456') {
        onToggle(true);
        setShowSetup(false);
        toast({
          title: "2FA Ativado",
          description: "Autenticação de dois fatores configurada com sucesso"
        });
      } else {
        throw new Error('Invalid code');
      }
    } catch (error) {
      toast({
        title: "Código incorreto",
        description: "Verifique o código e tente novamente",
        variant: "destructive"
      });
    }
  };

  const handleDisable2FA = async () => {
    try {
      onToggle(false);
      setShowSetup(false);
      setVerificationCode('');
      toast({
        title: "2FA Desativado",
        description: "Autenticação de dois fatores foi desabilitada"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desativar o 2FA",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Autenticação de Dois Fatores (2FA)
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Ativado" : "Desativado"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Adicione uma camada extra de segurança à sua conta usando autenticação de dois fatores.
        </p>

        {!isEnabled && !showSetup && (
          <Button onClick={handleEnable2FA} className="w-full">
            <Smartphone className="mr-2 h-4 w-4" />
            Ativar 2FA
          </Button>
        )}

        {showSetup && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm mb-2">Escaneie este QR code com seu aplicativo autenticador:</p>
              {qrCode && (
                <div className="flex justify-center">
                  <img src={qrCode} alt="QR Code" className="border rounded" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code">Código de verificação</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleVerify2FA} className="flex-1">
                <Key className="mr-2 h-4 w-4" />
                Verificar
              </Button>
              <Button variant="outline" onClick={() => setShowSetup(false)}>
                Cancelar
              </Button>
            </div>

            {backupCodes.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Códigos de Backup</h4>
                <p className="text-xs text-gray-600 mb-2">
                  Guarde estes códigos em local seguro. Use-os se perder acesso ao seu autenticador:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-xs bg-white p-1 rounded">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isEnabled && (
          <Button 
            variant="destructive" 
            onClick={handleDisable2FA}
            className="w-full"
          >
            Desativar 2FA
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
