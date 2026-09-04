import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { MobileMenuProps } from './Navigation.types';

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  links,
  onLinkClick,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

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

  const handleLinkClick = (sectionId: string) => {
    onLinkClick(sectionId);
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    onClose();
  };

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
            {links.map((link, index) => (
              <a
                key={link.id}
                ref={index === 0 ? firstLinkRef : undefined}
                href={`#${link.id}`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  handleLinkClick(link.id);
                }}
                className={cn(
                  'h-11 flex items-center px-4 text-base font-medium',
                  'text-text-secondary transition-all duration-300',
                  'hover:text-text',
                  'focus:outline-2 focus:outline-offset-2 focus:outline-primary',
                  'will-change-auto'
                )}
                style={{
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? 'translateX(0)' : 'translateX(-16px)',
                  transitionDelay: isOpen ? `${index * 50}ms` : '0ms',
                  transitionDuration: '300ms',
                  transitionTimingFunction: 'ease-out',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
