
import React from 'react';
import { Link } from 'react-router-dom';
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { useAdminAccess } from '@/hooks/useAdminAccess';

interface NavigationLinksProps {
  currentPath: string;
  userType: 'solicitante' | 'freelancer' | 'empresa' | null;
}

const NavigationLinks: React.FC<NavigationLinksProps> = ({
  currentPath,
  userType
}) => {
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
    <nav className="hidden md:flex gap-4 flex-wrap">
      <Link to="/" className={linkClass("/")}>
        Início
      </Link>

      {showSolicitante && (
        <Link to="/offers" className={linkClass("/offers")}>
          Ofertas
        </Link>
      )}

      {showSolicitante && (
        <Link to="/solicitante-plans" className={linkClass("/solicitante-plans")}>
          Planos Sol.
        </Link>
      )}

      {showFreelancer && (
        <Link to="/freelancer-plans" className={linkClass("/freelancer-plans")}>
          Planos Free.
        </Link>
      )}

      {showEmpresa && (
        <Link to="/empresa-plans" className={linkClass("/empresa-plans")}>
          Planos Emp.
        </Link>
      )}

      {showEmpresa && (
        <Link to="/jobs" className={linkClass("/jobs")}>
          Vagas
        </Link>
      )}

      {showFreelancer && (
        <Link to="/payment-freelancer-settings" className={linkClass("/payment-freelancer-settings")}>
          Pagamentos
        </Link>
      )}

      <Link to="/chat" className={linkClass("/chat")}>
        Bate Papo
      </Link>

      <Link to="/ai-chat" className={linkClass("/ai-chat")}>
        AI Chat
      </Link>

      {isAdmin && (
        <Link to="/admin/plans" className={linkClass("/admin/plans")}>
          Admin
        </Link>
      )}
    </nav>
  );
};

export default NavigationLinks;
