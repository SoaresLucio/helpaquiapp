import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Heart, Shield, Users, Zap } from 'lucide-react';
import PrivacyPolicyDialog from '@/components/PrivacyPolicyDialog';
import TermsOfUseDialog from '@/components/TermsOfUseDialog';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 bg-background/50 border-t">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-xl font-bold text-primary">HelpAqui</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Conectando pessoas que precisam de serviços com profissionais qualificados
              de forma rápida, segura e confiável.
            </p>
          </div>

          {/* Recursos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Recursos</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Rede de Profissionais</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Pagamentos Seguros</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Respostas Rápidas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                <span>Suporte 24/7</span>
              </div>
            </div>
          </div>

          {/* Para Profissionais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Para Profissionais</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Cadastre seus serviços</p>
              <p>• Receba solicitações</p>
              <p>• Aumente sua renda</p>
              <p>• Construa sua reputação</p>
            </div>
          </div>

          {/* Para Clientes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Para Clientes</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Encontre profissionais</p>
              <p>• Compare orçamentos</p>
              <p>• Avalie os serviços</p>
              <p>• Pague com segurança</p>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} HelpAqui. Todos os direitos reservados.</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Versão 1.0.0</span>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Feito com</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-muted-foreground">no Brasil</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;