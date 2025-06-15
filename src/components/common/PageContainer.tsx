
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageContainerProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gray-100 flex flex-col ${className}`}>
      {showHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default PageContainer;
