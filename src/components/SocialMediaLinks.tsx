
import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialMediaLinksProps {
  variant?: 'default' | 'footer' | 'floating';
  className?: string;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({ 
  variant = 'default',
  className = '' 
}) => {
  const socialLinks = [
    { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/helpaqui' },
    { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/helpaqui' },
    { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/helpaqui' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://linkedin.com/company/helpaqui' },
    { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/c/helpaqui' },
  ];

  const getVariantStyles = () => {
    switch (variant) {
      case 'footer':
        return {
          container: 'flex items-center gap-2',
          button: 'text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700',
        };
      case 'floating':
        return {
          container: 'flex flex-col gap-2 fixed right-4 bottom-24 z-20',
          button: 'bg-white shadow-md hover:bg-gray-50',
        };
      default:
        return {
          container: 'flex items-center gap-2',
          button: 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      {socialLinks.map((social) => (
        <Button
          key={social.name}
          variant="ghost"
          size="icon"
          className={styles.button}
          asChild
        >
          <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
            <social.icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
    </div>
  );
};

export default SocialMediaLinks;
