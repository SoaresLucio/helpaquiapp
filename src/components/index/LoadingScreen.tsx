
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-primary-foreground font-bold text-lg">H</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  );
};

export default LoadingScreen;
