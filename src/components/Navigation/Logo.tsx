import React from 'react';
import { cn } from '@/utils/cn';
import { LogoProps } from './Navigation.types';

export const Logo: React.FC<LogoProps> = ({ text = 'Andile', onClick }) => {
  const handleClick = () => {
    onClick?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'font-bold text-text transition-colors duration-200',
        'hover:text-primary',
        'focus:outline-2 focus:outline-offset-2 focus:outline-primary',
        'text-base sm:text-lg md:text-xl'
      )}
      aria-label="Andile Khumalo - Home"
    >
      {text}
    </button>
  );
};
