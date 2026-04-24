
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateEmail, validatePassword, sanitizeInput } from '@/utils/authValidation';

const PURPOSES = [
  { id: 'divulgacao', label: 'Divulgação' },
  { id: 'vagas', label: 'Divulgar vagas de emprego' },
  { id: 'servicos', label: 'Oferecer Serviços' },
];

const EmpresaRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [purposes, setPurposes] = useState<string[]>([]);

  const [validations, setValidations] = useState({
    length: false,
    hasNumber: false,
    hasUppercase: false,
    hasLowercase: false
  });

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password)
    });
  }, [password]);

  const isPasswordValid = validations.length && validations.hasNumber && validations.hasUppercase && validations.hasLowercase;

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const togglePurpose = (purposeId: string) => {
    setPurposes(prev =>
      prev.includes(purposeId)
        ? prev.filter(p => p !== purposeId)
        : [...prev, purposeId]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = sanitizeInput(email).toLowerCase();
    const emailVal = validateEmail(cleanEmail);
    if (!emailVal.isValid) { setError(emailVal.error!); return; }

    const passVal = validatePassword(password);
    if (!passVal.isValid) { setError(passVal.error!); return; }

    if (!companyName.trim()) { setError('Nome da empresa é obrigatório'); return; }
    if (cnpj.replace(/\D/g, '').length !== 14) { setError('CNPJ deve ter 14 dígitos'); return; }
    if (!responsibleName.trim()) { setError('Nome do responsável é obrigatório'); return; }
    if (purposes.length === 0) { setError('Selecione pelo menos uma finalidade'); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: responsibleName.split(' ')[0],
            last_name: responsibleName.split(' ').slice(1).join(' ') || '',
            user_type: 'empresa',
            company_name: companyName,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('empresa_profiles')
          .insert({
            user_id: data.user.id,
            cnpj: cnpj.replace(/\D/g, ''),
            company_name: sanitizeInput(companyName),
            responsible_name: sanitizeInput(responsibleName),
            employee_count: employeeCount || null,
            purpose: purposes,
          });

        if (profileError) {
          console.error('Error creating empresa profile:', profileError);
        }
      }

      localStorage.setItem('userType', 'empresa');

      toast({
        title: 'Cadastro realizado!',
        description: data.session
          ? 'Conta empresarial criada com sucesso!'
          : 'Verifique seu e-mail para confirmar o cadastro.',
      });

      if (data.session) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.message?.includes('User already registered')) {
        setError('Este email já está cadastrado. Faça login ou use outro email.');
      } else {
        setError(err.message || 'Erro ao criar conta empresarial');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Cadastro Empresarial</CardTitle>
        </div>
        <CardDescription>
          Cadastre sua empresa para divulgar vagas, serviços e mais.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa</Label>
            <Input
              id="company-name"
              placeholder="Razão Social ou Nome Fantasia"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={e => setCnpj(formatCnpj(e.target.value))}
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Nome do Responsável</Label>
            <Input
              id="responsible"
              placeholder="Nome completo do responsável"
              value={responsibleName}
              onChange={e => setResponsibleName(e.target.value)}
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-count">Quantidade de Funcionários</Label>
            <Select value={employeeCount} onValueChange={setEmployeeCount}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1 a 10</SelectItem>
                <SelectItem value="11-50">11 a 50</SelectItem>
                <SelectItem value="51-200">51 a 200</SelectItem>
                <SelectItem value="201-500">201 a 500</SelectItem>
                <SelectItem value="500+">Mais de 500</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Finalidade no App</Label>
            <div className="space-y-2">
              {PURPOSES.map(purpose => (
                <div key={purpose.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={purpose.id}
                    checked={purposes.includes(purpose.id)}
                    onCheckedChange={() => togglePurpose(purpose.id)}
                  />
                  <label htmlFor={purpose.id} className="text-sm cursor-pointer">
                    {purpose.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa-email">Email Corporativo</Label>
            <Input
              id="empresa-email"
              type="email"
              placeholder="contato@empresa.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa-password">Senha</Label>
            <Input
              id="empresa-password"
              type="password"
              placeholder="Crie uma senha segura"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={`rounded-xl h-11 ${password && !isPasswordValid ? 'border-destructive/50' : ''}`}
            />
            <div className="mt-2 space-y-1.5">
              {[
                { ok: validations.length, label: 'Pelo menos 8 caracteres' },
                { ok: validations.hasUppercase, label: 'Pelo menos uma maiúscula' },
                { ok: validations.hasLowercase, label: 'Pelo menos uma minúscula' },
                { ok: validations.hasNumber, label: 'Pelo menos um número' }
              ].map(({ ok, label }) => (
                <div key={label} className="flex items-center">
                  <div className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center transition-colors ${ok ? 'bg-primary' : 'bg-muted'}`}>
                    {ok && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className={`text-xs ${ok ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <div className="px-6 pb-6">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl gradient-primary text-white border-0 shadow-lg shadow-primary/25"
            disabled={loading || !isPasswordValid || !companyName.trim() || !responsibleName.trim() || purposes.length === 0 || !email.trim() || cnpj.replace(/\D/g, '').length !== 14}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
          </Button>
          <div className="text-sm text-center mt-4">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Button variant="link" className="p-0 text-primary" onClick={() => navigate('/login')}>
              Fazer login
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default EmpresaRegisterForm;
