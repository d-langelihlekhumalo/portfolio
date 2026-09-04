import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { NAVIGATION_LINKS } from '../../constants/navigationLinks';
import { NavigationProps } from './Navigation.types';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { HamburgerButton } from './HamburgerButton';
import { MobileMenu } from './MobileMenu';
import { DarkModeToggle } from './DarkModeToggle';

export const Navigation: React.FC<NavigationProps> = ({
  isDark,
  onToggleDarkMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasScrolled = scrollY > 4;

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'animate-fade-in'
      )}
    >
      {/* Navigation bar background */}
      <div
        className={cn(
          'transition-all duration-300',
          hasScrolled
            ? 'bg-background/80 backdrop-blur-md shadow-lg border-b border-border/50'
            : 'bg-background border-b border-border/0'
        )}
      >
        {/* Navigation content */}
        <div className={cn(
          'mx-auto max-w-6xl flex items-center justify-between',
          'px-4 sm:px-gutter md:px-gutter',
          'h-14 sm:h-15 md:h-16'
        )}>
          {/* Logo */}
          <Logo text="Andile" />

          {/* Desktop Nav Links (hidden on mobile/tablet) */}
          <NavLinks links={NAVIGATION_LINKS} />

          {/* Right side: Dark mode toggle + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Dark Mode Toggle */}
            <DarkModeToggle
              isDark={isDark}
              onToggle={() => onToggleDarkMode(!isDark)}
            />

            {/* Hamburger Button (mobile only) */}
            <HamburgerButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        links={NAVIGATION_LINKS}
        onLinkClick={() => {
          // Mobile menu will close via onClose
        }}
        onClose={() => setIsMenuOpen(false)}
      />
    </nav>
  );
};
