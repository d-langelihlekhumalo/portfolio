import React from 'react';
import { cn } from '@/utils/cn';
import { NavLinksProps } from './Navigation.types';

export const NavLinks: React.FC<NavLinksProps> = ({ links, onLinkClick }) => {
  const handleLinkClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    onLinkClick?.(sectionId);

    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  };

  return (
    <nav
      className="hidden lg:flex gap-8"
      aria-label="Main navigation"
    >
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(e) => handleLinkClick(link.id, e)}
          className={cn(
            'text-sm font-medium text-text-secondary transition-colors duration-200',
            'hover:text-text',
            'focus:outline-2 focus:outline-offset-2 focus:outline-primary'
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};
