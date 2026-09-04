import { NavLink } from '../../constants/navigationLinks';

export interface NavigationProps {
  isDark: boolean;
  onToggleDarkMode: (isDark: boolean) => void;
}

export interface LogoProps {
  text?: string;
  onClick?: () => void;
}

export interface NavLinksProps {
  links: NavLink[];
  onLinkClick?: (sectionId: string) => void;
}

export interface HamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
  ariaLabel?: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  links: NavLink[];
  onLinkClick: (sectionId: string) => void;
  onClose: () => void;
}

export interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  ariaLabel?: string;
}
