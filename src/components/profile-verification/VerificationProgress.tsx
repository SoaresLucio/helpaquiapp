
import React from 'react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

interface VerificationProgressProps {
  isSubmitting: boolean;
  progress: number;
}

const VerificationProgress: React.FC<VerificationProgressProps> = ({ isSubmitting, progress }) => {
  if (!isSubmitting) return null;

  return (
    <div className="space-y-2">
      <Label className="text-sm">Progresso da verificação</Label>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-center text-gray-500">
        {progress < 100 
          ? "Validando e enviando documentos..." 
          : "Documentos enviados com sucesso!"}
      </p>
    </div>
  );
};

export default VerificationProgress;
