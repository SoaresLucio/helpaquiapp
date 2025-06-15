
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface UseErrorHandlerReturn {
  error: string | null;
  setError: (error: string | null) => void;
  handleError: (error: any, customMessage?: string) => void;
  clearError: () => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorMessage = customMessage || error?.message || 'Ocorreu um erro inesperado';
    setError(errorMessage);
    toast.error(errorMessage);
    console.error('Error:', error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    handleError,
    clearError
  };
};
