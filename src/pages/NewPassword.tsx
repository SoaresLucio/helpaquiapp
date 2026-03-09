
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updatePassword } from '@/services/authService';
import { supabase } from '@/integrations/supabase/client';

const NewPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [validations, setValidations] = useState({
    length: false,
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    match: false
  });

  // Supabase sends recovery tokens in the URL hash: #access_token=...&type=recovery
  useEffect(() => {
    const hash = window.location.hash;
    const hashParams = new URLSearchParams(hash.replace('#', ''));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const hashType = hashParams.get('type');

    if (accessToken && refreshToken && hashType === 'recovery') {
      // Establish recovery session so updateUser() works
      supabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error }) => {
          if (error) {
            toast({
              title: "Link inválido",
              description: "Sessão de recuperação inválida. Solicite um novo link.",
              variant: "destructive"
            });
            navigate('/login');
          } else {
            setSessionReady(true);
          }
        });
    } else {
      // Fallback: some email clients strip the hash; check query params
      const qAccessToken = searchParams.get('access_token');
      const qRefreshToken = searchParams.get('refresh_token');
      const qType = searchParams.get('type');

      if (qAccessToken && qRefreshToken && qType === 'recovery') {
        supabase.auth
          .setSession({ access_token: qAccessToken, refresh_token: qRefreshToken })
          .then(({ error }) => {
            if (error) {
              toast({ title: "Link inválido", description: "Sessão expirada. Solicite um novo link.", variant: "destructive" });
              navigate('/login');
            } else {
              setSessionReady(true);
            }
          });
      } else {
        toast({
          title: "Link inválido",
          description: "Este link de recuperação de senha é inválido ou expirou.",
          variant: "destructive"
        });
        navigate('/login');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time password validation
  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      match: password === confirmPassword && password.length > 0
    });
  }, [password, confirmPassword]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validations.length || !validations.hasNumber || !validations.hasLowercase || !validations.hasUppercase) {
      toast({ title: "Senha inválida", description: "A senha deve atender a todos os requisitos", variant: "destructive" });
      return;
    }

    if (!validations.match) {
      toast({ title: "Senhas não coincidem", description: "As senhas digitadas não são iguais", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso. Faça login com sua nova senha."
      });

      // Sign out to force fresh login with new password
      await supabase.auth.signOut({ scope: 'local' });
      navigate('/login');
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao atualizar senha",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.values(validations).every(Boolean);

  const requirements = [
    { ok: validations.length, label: "Pelo menos 8 caracteres" },
    { ok: validations.hasUppercase, label: "Pelo menos uma letra maiúscula" },
    { ok: validations.hasLowercase, label: "Pelo menos uma letra minúscula" },
    { ok: validations.hasNumber, label: "Pelo menos um número" },
    { ok: validations.match, label: "Senhas coincidem" }
  ];

  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-helpaqui-blue">
          Help<span className="text-helpaqui-green">Aqui</span>
        </h1>
        <p className="text-muted-foreground mt-2">Definir nova senha</p>
      </div>

      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4 p-0" onClick={() => navigate('/login')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Digite sua nova senha</CardTitle>
            <CardDescription>Crie uma senha segura para sua conta</CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              {!sessionReady && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2" />
                  <span className="text-sm text-muted-foreground">Verificando link...</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!sessionReady}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!sessionReady}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Visual password requirements */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Requisitos da senha:</p>
                {requirements.map(({ ok, label }) => (
                  <div key={label} className="flex items-center text-sm">
                    <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-muted-foreground/30'}`}>
                      {ok && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={ok ? 'text-green-600' : 'text-muted-foreground'}>{label}</span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !isFormValid || !sessionReady}
              >
                {isLoading ? "Atualizando..." : "Atualizar senha"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewPassword;
