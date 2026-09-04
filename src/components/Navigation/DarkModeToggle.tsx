import React from 'react';
import { cn } from '@/utils/cn';
import { DarkModeToggleProps } from './Navigation.types';

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDark,
  onToggle,
  ariaLabel,
}) => {
  return (
    <button
      onClick={() => onToggle()}
      className={cn(
        'w-8 h-8 flex items-center justify-center text-lg',
        'transition-colors duration-200 hover:text-primary',
        'focus:outline-2 focus:outline-offset-2 focus:outline-primary'
      )}
      aria-label={ariaLabel || (isDark ? 'Switch to light mode' : 'Switch to dark mode')}
      aria-pressed={isDark}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};
