
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import NavigationLinks from './navigation/NavigationLinks';

interface NavLinksProps {
  currentPath: string;
}

const NavLinks: React.FC<NavLinksProps> = ({ currentPath }) => {
  const { userType, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return <NavigationLinks currentPath={currentPath} userType={userType} />;
};

export default NavLinks;
