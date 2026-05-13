import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, FolderOpen, CreditCard, ArrowLeft, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'categories', label: 'Categorias', icon: FolderOpen },
  { id: 'plans', label: 'Planos', icon: CreditCard },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen hidden lg:flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">HelpAqui</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Link to="/dashboard">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao App
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
