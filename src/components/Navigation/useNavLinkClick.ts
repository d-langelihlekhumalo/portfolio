import { useNavigate, useLocation } from 'react-router-dom';
import type { MouseEvent } from 'react';
import { NavLink } from '@/constants/navigationLinks';

/**
 * Shared click behavior for both desktop and mobile nav links.
 *
 * 'route' links (e.g. Blog) are left alone — they render as real <Link>s and
 * navigate normally. 'anchor' links scroll to a section on the homepage; if
 * we're not already on the homepage, navigate there first and scroll once
 * it has mounted (via router location state, consumed by PublicLayout).
 */
export function useNavLinkClick(onBeforeScroll?: () => void) {
  const navigate = useNavigate();
  const location = useLocation();

  return (link: NavLink, e: MouseEvent) => {
    if (link.type === 'route') return;

    e.preventDefault();
    onBeforeScroll?.();

    if (location.pathname === '/') {
      setTimeout(() => {
        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    } else {
      navigate('/', { state: { scrollTo: link.id } });
    }
  };
}
