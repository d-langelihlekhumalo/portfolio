export interface NavLink {
  id: string;
  label: string;
  href?: string;
  /** 'anchor' (default) scrolls to an in-page section on the homepage; 'route' navigates to a real page. */
  type?: 'anchor' | 'route';
}

export const NAVIGATION_LINKS: NavLink[] = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'how-i-work', label: 'How I work' },
  { id: 'about', label: 'About' },
  { id: 'blog', label: 'Blog', href: '/blog', type: 'route' },
];
