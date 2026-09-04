export interface NavLink {
  id: string;
  label: string;
  href?: string;
}

export const NAVIGATION_LINKS: NavLink[] = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'tech-stack', label: 'Tech Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];
