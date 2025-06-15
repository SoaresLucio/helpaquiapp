
import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type DocumentStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface DocumentState {
  file: File | null;
  status: DocumentStatus;
  message: string;
}

interface DocumentUploadProps {
  id: string;
  label: string;
  required?: boolean;
  document: DocumentState;
  accept?: string;
  helpText?: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidate: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  id,
  label,
  required = false,
  document,
  accept = "image/jpeg,image/png,application/pdf",
  helpText,
  onFileChange,
  onValidate
}) => {
  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'validating': return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'valid': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'invalid': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {getStatusIcon(document.status)}
      </div>
      <div className="flex gap-2">
        <Input 
          id={id} 
          type="file" 
          onChange={onFileChange}
          className="flex-1"
          accept={accept}
          required={required}
        />
        {document.file && (
          <Button 
            type="button" 
            size="sm"
            onClick={onValidate}
            disabled={document.status === 'validating'}
          >
            Validar
          </Button>
        )}
      </div>
      {document.message && (
        <p className={`text-xs ${
          document.status === 'valid' 
            ? 'text-green-600' 
            : document.status === 'invalid' 
            ? 'text-red-600' 
            : 'text-blue-600'
        }`}>
          {document.message}
        </p>
      )}
      {helpText && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
};

export default DocumentUpload;
