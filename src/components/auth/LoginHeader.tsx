
import React from 'react';

const LoginHeader = () => {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center gap-2.5 mb-3">
        <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
          <span className="text-white font-bold text-lg">H</span>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold text-gradient-primary">
        Acesse sua conta HelpAqui
      </h1>
      <p className="text-muted-foreground mt-2">Freelancers profissionais perto de você, solução rápida onde estiver!</p>
    </div>
  );
};

export default LoginHeader;
