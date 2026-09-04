import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { MobileMenuProps } from './Navigation.types';
import { useNavLinkClick } from './useNavLinkClick';

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  links,
  onLinkClick,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const handleAnchorClick = useNavLinkClick(onClose);

  useEffect(() => {
    if (isOpen) {
      // Focus first link when menu opens
      setTimeout(() => {
        firstLinkRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className={cn(
            'lg:hidden bg-surface border-b border-border',
            'transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isOpen ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'
          )}
        >
          <div className="px-4 py-3 flex flex-col gap-0">
            {links.map((link, index) => {
              const itemClassName = cn(
                'h-11 flex items-center px-4 text-base font-medium',
                'text-text-secondary transition-all duration-300',
                'hover:text-text',
                'focus:outline-2 focus:outline-offset-2 focus:outline-primary',
                'will-change-auto'
              );
              const itemStyle = {
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(-16px)',
                transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                transitionDuration: '300ms',
                transitionTimingFunction: 'ease-out',
              };

              return link.type === 'route' ? (
                <Link
                  key={link.id}
                  ref={index === 0 ? firstLinkRef : undefined}
                  to={link.href ?? '/'}
                  onClick={onClose}
                  className={itemClassName}
                  style={itemStyle}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.id}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={`#${link.id}`}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    handleAnchorClick(link, e);
                    onLinkClick(link.id);
                  }}
                  className={itemClassName}
                  style={itemStyle}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
