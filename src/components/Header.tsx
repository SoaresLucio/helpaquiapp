
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import MobileMenu from './header/MobileMenu';
import NavLinks from './header/NavLinks';
import UserSection from './header/UserSection';
import NotificationBadge from './header/NotificationBadge';

const Header = () => {
  const { pathname } = useLocation();
  const [scrolling, setScrolling] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolling(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        scrolling
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm'
          : 'bg-background'
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileMenu currentPath={pathname} />
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-extrabold text-xl text-gradient-primary">HelpAqui</span>
          </Link>
          <NavLinks currentPath={pathname} />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              aria-label="Buscar no HelpAqui"
              className="w-[200px] lg:w-[280px] pl-8"
            />
          </div>
          <NotificationBadge />
          <UserSection isAuthenticated={isAuthenticated} />
        </div>
      </div>
    </header>
  );
};

export default Header;
