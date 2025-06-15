
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface CPFInputProps {
  value: string;
  onChange: (value: string) => void;
}

const CPFInput: React.FC<CPFInputProps> = ({ value, onChange }) => {
  const { toast } = useToast();

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    return cleanCPF.length === 11;
  };

  const handleBlur = () => {
    if (value && !validateCPF(value)) {
      toast({
        title: "CPF inválido",
        description: "Por favor, verifique o número do CPF informado.",
        variant: "destructive",
      });
    } else if (value && validateCPF(value)) {
      toast({
        title: "CPF válido",
        description: "O formato do CPF parece correto.",
      });
    }
  };

  return (
    <div>
      <Label htmlFor="cpf">CPF</Label>
      <Input 
        id="cpf" 
        placeholder="000.000.000-00" 
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={handleBlur}
        required 
      />
      <p className="text-xs text-gray-500 mt-1">
        Seu CPF será validado através de nossas bases de dados
      </p>
    </div>
  );
};

export default CPFInput;
