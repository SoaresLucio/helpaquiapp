
import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useAuth } from '@/hooks/useAuth';
import MobileMenu from './components/header/MobileMenu';
import NavLinks from './components/header/NavLinks';
import UserSection from './components/header/UserSection';
import NotificationBadge from './components/header/NotificationBadge';

const Header = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const [scrolling, setScrolling] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const { user, isAuthenticated } = useAuth();
  
  // Simulating notification count
  const notificationCount = 3;
  
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  // Handle scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolling(true);
      } else {
        setScrolling(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
          <MobileMenu currentPath={currentPath} />
          
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-helpaqui-blue">
              HelpAqui
            </span>
          </Link>

          <NavLinks currentPath={currentPath} />
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`relative rounded-md ${searchFocus ? 'ring-2 ring-ring' : ''} hidden sm:block`}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full md:w-[200px] lg:w-[300px] pl-8"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
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
