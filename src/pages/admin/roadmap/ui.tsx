import {
  Award,
  BookOpen,
  CirclePlay,
  FileText,
  FlaskConical,
  GraduationCap,
  Hammer,
  Link2,
  ListChecks,
  NotebookPen,
  Presentation,
  Route,
  Table2,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { ArtifactKind, ItemKind, ItemStatus } from './types'

export const KIND_META: Record<ItemKind, { label: string; icon: LucideIcon }> = {
  certification: { label: 'Certification', icon: Award },
  fundamentals: { label: 'Fundamentals (no exam)', icon: GraduationCap },
  course: { label: 'Course', icon: CirclePlay },
  book: { label: 'Book', icon: BookOpen },
  project: { label: 'Project', icon: Hammer },
  skill: { label: 'Skill track', icon: Wrench },
}

export const ARTIFACT_META: Record<ArtifactKind, { label: string; icon: LucideIcon }> = {
  'study-guide': { label: 'Study guide', icon: BookOpen },
  'cheat-sheet': { label: 'Cheat sheet', icon: FileText },
  lab: { label: 'Lab', icon: FlaskConical },
  quiz: { label: 'Quiz', icon: ListChecks },
  notes: { label: 'Notes', icon: NotebookPen },
  tracker: { label: 'Tracker', icon: Table2 },
  deck: { label: 'Deck', icon: Presentation },
  diagram: { label: 'Diagram', icon: Route },
  other: { label: 'Link', icon: Link2 },
}

export const STATUS_LABEL: Record<ItemStatus, string> = {
  todo: 'To do',
  doing: 'In progress',
  done: 'Done',
}

/*
 * Status colours stay inside the site's token table: protea (primary) marks
 * what's in progress, fynbos (success) is reserved for done/passed — the same
 * meaning it has on the public site — and everything else is ink/line.
 */
export const STATUS_BAR: Record<ItemStatus, string> = {
  todo: 'border-border bg-text/[0.04] text-text-secondary hover:border-text-secondary hover:text-text',
  doing: 'border-primary/70 bg-primary/10 text-text hover:border-primary',
  done: 'border-success/70 bg-success/10 text-text hover:border-success',
}

export const STATUS_FILL: Record<ItemStatus, string> = {
  todo: 'bg-text/10',
  doing: 'bg-primary/25',
  done: 'bg-success/25',
}

export const STATUS_DOT: Record<ItemStatus, string> = {
  todo: 'border border-text-secondary/60',
  doing: 'bg-primary',
  done: 'bg-success',
}

export function StatusDot({ status, className }: { status: ItemStatus; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full', STATUS_DOT[status], className)}
    />
  )
}

export function ProgressBar({
  value,
  status,
  className,
  label,
}: {
  value: number
  status: ItemStatus
  className?: string
  label?: string
}) {
  const pct = Math.round(value * 100)
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-border', className)}
    >
      <div
        className={cn(
          'h-full rounded-full motion-safe:transition-[width] motion-safe:duration-300',
          status === 'done' ? 'bg-success' : 'bg-primary',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2'
