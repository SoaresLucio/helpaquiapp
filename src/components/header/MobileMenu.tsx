
import React from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  currentPath: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ currentPath }) => {
  const { isAdmin } = useAdminAccess();
  const { userType } = useAuth();

  const showSolicitante = userType === 'solicitante' || isAdmin;
  const showFreelancer = userType === 'freelancer' || isAdmin;
  const showEmpresa = userType === 'empresa' || isAdmin;

  const navLink = (to: string, label: string) => (
    <SheetClose asChild key={to}>
      <Link to={to}>
        <Button variant="ghost" className={`w-full justify-start ${currentPath === to ? 'bg-secondary' : ''}`}>
          {label}
        </Button>
      </Link>
    </SheetClose>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="font-bold text-xl text-primary">HelpAqui</span>
            <SheetClose asChild>
              <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <div className="py-4">
          <nav className="flex flex-col gap-2">
            {navLink('/dashboard', 'Início')}
            {navLink('/jobs', 'Vagas de Emprego')}

            {showSolicitante && (
              <>
                <Separator className="my-1" />
                <p className="text-xs text-muted-foreground px-4">Solicitante</p>
                {navLink('/offers', 'Ofertas')}
                {navLink('/my-requests', 'Meus Pedidos')}
                {navLink('/solicitante-plans', 'Planos')}
              </>
            )}

            {showFreelancer && (
              <>
                <Separator className="my-1" />
                <p className="text-xs text-muted-foreground px-4">Freelancer</p>
                {navLink('/my-offers', 'Minhas Ofertas')}
                {navLink('/help-requests', 'Pedidos de Ajuda')}
                {navLink('/freelancer-plans', 'Planos')}
                {navLink('/payment-freelancer-settings', 'Pagamentos')}
              </>
            )}

            {showEmpresa && (
              <>
                <Separator className="my-1" />
                <p className="text-xs text-muted-foreground px-4">Empresa</p>
                {navLink('/empresa/jobs', 'Gerenciar Vagas')}
                {navLink('/empresa-plans', 'Planos Empresa')}
              </>
            )}

            <Separator className="my-1" />
            {navLink('/chat', 'Bate Papo')}
            {navLink('/ai-chat', 'AI Chat')}
            {navLink('/notes', 'Notas')}

            {isAdmin && (
              <>
                <Separator className="my-2" />
                {navLink('/admin', '⚙️ Painel Admin')}
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
