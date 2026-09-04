import React from 'react';
import { cn } from '@/utils/cn';
import { HamburgerButtonProps } from './Navigation.types';

export const HamburgerButton: React.FC<HamburgerButtonProps> = ({
  isOpen,
  onClick,
  ariaLabel,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'lg:hidden w-11 h-11 flex flex-col items-center justify-center gap-1.5',
        'transition-colors duration-200 hover:text-primary',
        'focus:outline-2 focus:outline-offset-2 focus:outline-primary'
      )}
      aria-label={ariaLabel || (isOpen ? 'Close menu' : 'Open menu')}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
    >
      {/* Top line */}
      <span
        className="block w-5 h-0.5 bg-text transition-all duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'rotate(-45deg) translateY(8px)' : 'rotate(0)',
        }}
      />
      {/* Middle line */}
      <span
        className="block w-5 h-0.5 bg-text transition-all duration-300 ease-in-out"
        style={{
          opacity: isOpen ? 0 : 1,
          transform: isOpen ? 'scale(0)' : 'scale(1)',
        }}
      />
      {/* Bottom line */}
      <span
        className="block w-5 h-0.5 bg-text transition-all duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'rotate(45deg) translateY(-8px)' : 'rotate(0)',
        }}
      />
    </button>
  );
};
