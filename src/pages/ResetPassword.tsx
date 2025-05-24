
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { resetPassword } from '@/services/authService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Erro",
        description: "Por favor, insira um endereço de e-mail válido",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      
      setEmailSent(true);
      toast({
        title: "E-mail enviado",
        description: "Verifique seu e-mail para redefinir sua senha"
      });
    } catch (error) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao enviar e-mail de redefinição de senha",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-gray-600 mt-2">Redefinir senha</p>
      </div>

      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          className="mb-4 p-0" 
          onClick={() => navigate('/login')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Esqueceu sua senha?</CardTitle>
            <CardDescription>
              {emailSent 
                ? "E-mail de redefinição enviado"
                : "Digite seu e-mail para receber um link de redefinição de senha"
              }
            </CardDescription>
          </CardHeader>
          
          {!emailSent ? (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">E-mail</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Alert variant="default" className="bg-blue-50 text-blue-800 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Um link para redefinição de senha será enviado para seu e-mail cadastrado.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/login')}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar link"}
                  </Button>
                </div>
              </CardContent>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  E-mail de redefinição enviado para <strong>{email}</strong>
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>• Verifique sua caixa de entrada e spam</p>
                <p>• O link expira em 1 hora</p>
                <p>• Se não recebeu, tente novamente</p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  Tentar novamente
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => navigate('/login')}
                >
                  Voltar ao login
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
