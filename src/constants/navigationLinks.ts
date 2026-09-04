export interface NavLink {
  id: string;
  label: string;
  href?: string;
  /** 'anchor' (default) scrolls to an in-page section on the homepage; 'route' navigates to a real page. */
  type?: 'anchor' | 'route';
}

export const NAVIGATION_LINKS: NavLink[] = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog', href: '/blog', type: 'route' },
  { id: 'contact', label: 'Contact' },
];
