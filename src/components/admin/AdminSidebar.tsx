
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Image, 
  Users, 
  Settings, 
  UserCheck, 
  MessageSquare,
  Shield
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Visão Geral',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Banners',
    href: '/admin/banners',
    icon: Image,
  },
  {
    title: 'Verificações',
    href: '/admin/verifications',
    icon: UserCheck,
  },
  {
    title: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Equipe Admin',
    href: '/admin/team',
    icon: Shield,
  },
  {
    title: 'Suporte',
    href: '/admin/support',
    icon: MessageSquare,
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-helpaqui-blue">Admin HelpAqui</h1>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-helpaqui-blue transition-colors',
                isActive && 'bg-helpaqui-blue/10 text-helpaqui-blue border-r-2 border-helpaqui-blue'
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
