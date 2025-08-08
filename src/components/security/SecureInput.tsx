import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { sanitizeInput } from '@/utils/securityValidation';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecureInputProps {
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoSanitize?: boolean;
  showSecurityIndicator?: boolean;
  maxLength?: number;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  className,
  autoSanitize = true,
  showSecurityIndicator = false,
  maxLength = 1000,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSanitized, setIsSanitized] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Enforce max length
    if (newValue.length > maxLength) {
      newValue = newValue.slice(0, maxLength);
    }

    if (autoSanitize && type !== 'password') {
      const sanitized = sanitizeInput(newValue);
      setIsSanitized(sanitized === newValue);
      onChange(sanitized);
    } else {
      setIsSanitized(true);
      onChange(newValue);
    }
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="relative">
      <Input
        type={inputType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${className} ${
          !isSanitized ? 'border-yellow-400 focus:border-yellow-500' : ''
        } ${type === 'password' ? 'pr-20' : showSecurityIndicator ? 'pr-10' : ''}`}
        {...props}
      />
      
      {type === 'password' && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {showSecurityIndicator && (
          <div title={isSanitized ? 'Entrada segura' : 'Entrada foi sanitizada'}>
            <Shield 
              className={`w-4 h-4 ${isSanitized ? 'text-green-500' : 'text-yellow-500'}`}
            />
          </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
      
      {showSecurityIndicator && type !== 'password' && (
        <div 
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
          title={isSanitized ? 'Entrada segura' : 'Entrada foi sanitizada'}
        >
          <Shield 
            className={`w-4 h-4 ${isSanitized ? 'text-green-500' : 'text-yellow-500'}`}
          />
        </div>
      )}
      
      {!isSanitized && (
        <p className="text-xs text-yellow-600 mt-1">
          Alguns caracteres foram removidos por segurança
        </p>
      )}
    </div>
  );
};