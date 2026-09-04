import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { NavLinksProps } from './Navigation.types';
import { useNavLinkClick } from './useNavLinkClick';

const linkClassName = cn(
  'text-sm font-medium text-text-secondary transition-colors duration-200',
  'hover:text-text',
  'focus:outline-2 focus:outline-offset-2 focus:outline-primary'
);

export const NavLinks: React.FC<NavLinksProps> = ({ links, onLinkClick }) => {
  const handleAnchorClick = useNavLinkClick();

  return (
    <nav
      className="hidden lg:flex gap-8"
      aria-label="Main navigation"
    >
      {links.map((link) =>
        link.type === 'route' ? (
          <Link key={link.id} to={link.href ?? '/'} className={linkClassName}>
            {link.label}
          </Link>
        ) : (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => {
              handleAnchorClick(link, e);
              onLinkClick?.(link.id);
            }}
            className={linkClassName}
          >
            {link.label}
          </a>
        ),
      )}
    </nav>
  );
};
