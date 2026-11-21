import { Link, NavLink } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/utils/cn'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/blog', label: 'Blog' },
  { to: '/admin/roadmap', label: 'Learning roadmap' },
  { to: '/admin/salary', label: 'Salary & tax' },
]

/** Shared nav for every page under /admin (all behind the same Access gate). */
export function AdminNav() {
  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to site
      </Link>
      <span aria-hidden="true" className="h-4 w-px bg-border" />
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            cn(
              'rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              isActive && 'font-semibold text-text',
            )
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
