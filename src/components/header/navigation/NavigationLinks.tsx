
import React from 'react';
import { Link } from 'react-router-dom';
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface NavigationLinksProps {
  currentPath: string;
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({ currentPath, userType }) => {
  const { isAdmin } = useAdminAccess();

  const linkClass = (path: string) =>
    cn(
      navigationMenuTriggerStyle(),
      "bg-transparent hover:bg-muted transition-colors",
      currentPath === path && "text-primary font-medium bg-primary/10"
    );

  const showSolicitante = userType === 'solicitante' || isAdmin;
  const showFreelancer = userType === 'freelancer' || isAdmin;
  const showEmpresa = userType === 'empresa' || isAdmin;

  return (
    <nav className="hidden md:flex gap-3 flex-wrap items-center">
      <Link to="/dashboard" className={linkClass("/dashboard")}>Início</Link>
      <Link to="/jobs" className={linkClass("/jobs")}>Vagas</Link>

      {showSolicitante && <Link to="/offers" className={linkClass("/offers")}>Ofertas</Link>}
      {showSolicitante && <Link to="/solicitante-plans" className={linkClass("/solicitante-plans")}>Planos Sol.</Link>}

      {showFreelancer && <Link to="/freelancer-plans" className={linkClass("/freelancer-plans")}>Planos Free.</Link>}
      {showFreelancer && <Link to="/payment-freelancer-settings" className={linkClass("/payment-freelancer-settings")}>Pagamentos</Link>}

      {showEmpresa && <Link to="/empresa/jobs" className={linkClass("/empresa/jobs")}>Ger. Vagas</Link>}
      {showEmpresa && <Link to="/empresa-plans" className={linkClass("/empresa-plans")}>Planos Emp.</Link>}

      <Link to="/chat" className={linkClass("/chat")}>Chat</Link>

      {isAdmin && <Link to="/admin" className={linkClass("/admin")}>Admin</Link>}
    </nav>
  );
};

export default NavigationLinks;
