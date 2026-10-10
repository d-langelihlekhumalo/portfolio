import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { NAVIGATION_LINKS } from '../../constants/navigationLinks';
import { NavigationProps } from './Navigation.types';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { HamburgerButton } from './HamburgerButton';
import { MobileMenu } from './MobileMenu';
import { DarkModeToggle } from './DarkModeToggle';
import { useNavLinkClick } from './useNavLinkClick';

export const Navigation: React.FC<NavigationProps> = ({
  isDark,
  onToggleDarkMode,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const handleAnchorClick = useNavLinkClick();

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
      {/* Navigation bar background — always fully solid, not translucent, so
          content never shows through while scrolling (bug #3). A bottom
          border appears only once scrolled. */}
      <div
        className={cn(
          'bg-background transition-[border-color] duration-300',
          hasScrolled ? 'border-b border-border' : 'border-b border-transparent'
        )}
      >
        {/* Navigation content — same container as SectionWrapper (1120px, 24px/16px padding) */}
        <div className={cn(
          'mx-auto max-w-[1120px] flex items-center justify-between',
          'px-4 sm:px-6',
          'h-14 sm:h-15 md:h-16'
        )}>
          {/* Logo */}
          <Logo text="Andile" />

          {/* Desktop Nav Links (hidden on mobile/tablet) */}
          <NavLinks links={NAVIGATION_LINKS} />

          {/* Right side: Start a project + Dark mode toggle + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <a
              href="#contact"
              onClick={(e) => handleAnchorClick({ id: 'contact', label: 'Start a project' }, e)}
              className="hidden sm:inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:opacity-90 transition-opacity focus:outline-2 focus:outline-primary focus:outline-offset-2"
            >
              Start a project
            </a>

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
