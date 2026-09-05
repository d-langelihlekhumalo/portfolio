import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { HeroVisual } from '@/components'

interface AdminHeaderProps {
  /** null = still loading */
  draftCount: number | null
}

function statusLine(count: number | null): string {
  if (count === null) return 'Loading drafts…'
  if (count === 0) return 'All caught up — nothing waiting for review.'
  return `${count} draft${count === 1 ? '' : 's'} awaiting your review.`
}

/**
 * Compact branded header for the admin area — the portfolio's own dark/
 * minimal language and the existing HeroVisual, not a marketing hero.
 */
export function AdminHeader({ draftCount }: AdminHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-border bg-surface/40">
      <div className="max-w-5xl mx-auto px-4 md:px-10 pt-6">
        <nav className="flex items-center gap-5 text-sm text-text-secondary">
          <Link to="/" className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to site
          </Link>
          <Link to="/blog" className="hover:text-primary transition-colors">
            View blog
          </Link>
        </nav>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-10 pb-10 md:pb-14 pt-6 md:pt-8 flex items-center justify-between gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            Blog Admin
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text leading-tight">
            Review &amp; publish
          </h1>
          <p className="text-text-secondary mt-3 text-sm md:text-base">{statusLine(draftCount)}</p>
        </div>

        <div className="hidden md:block w-40 lg:w-52 opacity-70 flex-shrink-0" aria-hidden="true">
          <HeroVisual />
        </div>
      </div>
    </header>
  )
}
