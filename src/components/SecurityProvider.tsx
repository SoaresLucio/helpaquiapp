
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecurity } from '@/hooks/useSecurity';
import { useToast } from '@/components/ui/use-toast';

interface SecurityContextType {
  checkRateLimit: (operation: string) => boolean;
  validateInput: (data: any, schema: string) => any;
  logUserAction: (action: string, metadata?: any) => void;
  securityState: any;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const security = useSecurity();
  const { toast } = useToast();

  // Configurar headers de segurança
  useEffect(() => {
    const headers = security.securityService.getSecurityHeaders();
    
    // Aplicar CSP via meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = headers['Content-Security-Policy'];
    document.head.appendChild(cspMeta);

    // Adicionar outros headers de segurança onde possível
    const securityMeta = document.createElement('meta');
    securityMeta.name = 'security-headers';
    securityMeta.content = JSON.stringify(headers);
    document.head.appendChild(securityMeta);

    return () => {
      if (cspMeta.parentNode) {
        cspMeta.parentNode.removeChild(cspMeta);
      }
      if (securityMeta.parentNode) {
        securityMeta.parentNode.removeChild(securityMeta);
      }
    };
  }, [security.securityService]);

  // Detectar tentativas de manipulação do DOM
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Detectar scripts maliciosos
              if (element.tagName === 'SCRIPT' && 
                  !element.getAttribute('src')?.includes('cdn.jsdelivr.net')) {
                console.warn('🚨 Script suspeito detectado:', element);
                security.logUserAction('suspicious_script_injection', {
                  innerHTML: element.innerHTML,
                  attributes: Array.from(element.attributes).map(attr => ({
                    name: attr.name,
                    value: attr.value
                  }))
                });
                element.remove();
                
                toast({
                  title: "🚨 Tentativa de injeção bloqueada",
                  description: "Uma tentativa de execução de código malicioso foi bloqueada.",
                  variant: "destructive"
                });
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [security.logUserAction, toast]);

  // Monitorar tentativas de acesso ao console
  useEffect(() => {
    const originalConsole = { ...console };
    
    console.log = (...args) => {
      // Log apenas se não for nosso próprio sistema de segurança
      if (!args[0]?.toString().includes('🚨') && !args[0]?.toString().includes('Security:')) {
        security.logUserAction('console_usage', { 
          type: 'log', 
          args: args.map(arg => String(arg).substring(0, 100))
        });
      }
      originalConsole.log(...args);
    };

    return () => {
      console.log = originalConsole.log;
    };
  }, [security.logUserAction]);

  // Detectar tentativas de acesso às ferramentas de desenvolvedor
  useEffect(() => {
    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        security.logUserAction('devtools_opened', {
          timestamp: new Date().toISOString(),
          windowSize: {
            outer: { width: window.outerWidth, height: window.outerHeight },
            inner: { width: window.innerWidth, height: window.innerHeight }
          }
        });
      } else if (!widthThreshold && !heightThreshold && devtoolsOpen) {
        devtoolsOpen = false;
        security.logUserAction('devtools_closed', {
          timestamp: new Date().toISOString()
        });
      }
    };

    const interval = setInterval(checkDevTools, 1000);
    return () => clearInterval(interval);
  }, [security.logUserAction]);

  // Interceptar eventos de teclado suspeitos
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Detectar combinações suspeitas
      const suspiciousCombinations = [
        { key: 'F12' }, // DevTools
        { key: 'I', ctrlKey: true, shiftKey: true }, // DevTools
        { key: 'J', ctrlKey: true, shiftKey: true }, // Console
        { key: 'U', ctrlKey: true }, // View Source
        { key: 'S', ctrlKey: true, shiftKey: true }, // Save As
      ];

      const isSuspicious = suspiciousCombinations.some(combo => {
        return Object.keys(combo).every(key => {
          if (key === 'key') return event.key === combo.key;
          return event[key as keyof KeyboardEvent] === combo[key as keyof typeof combo];
        });
      });

      if (isSuspicious) {
        security.logUserAction('suspicious_keyboard_combination', {
          key: event.key,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [security.logUserAction]);

  // Interceptar cliques com botão direito
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      security.logUserAction('context_menu_attempt', {
        x: event.clientX,
        y: event.clientY,
        target: (event.target as Element)?.tagName
      });
      
      // Opcional: bloquear menu de contexto em produção
      // event.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [security.logUserAction]);

  return (
    <SecurityContext.Provider value={{
      checkRateLimit: security.checkRateLimit,
      validateInput: security.validateInput,
      logUserAction: security.logUserAction,
      securityState: security.securityState
    }}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};
