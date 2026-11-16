import { Paperclip } from 'lucide-react'
import { cn } from '@/utils/cn'
import { completion, formatRange, progressFor, targetDate } from './progress'
import type { RoadmapItem, RoadmapState } from './types'
import { KIND_META, ProgressBar, STATUS_LABEL, StatusDot, focusRing } from './ui'

interface Group {
  label: string
  match: (item: RoadmapItem, end: string) => boolean
}

const GROUPS: Group[] = [
  { label: 'December sprint', match: (_, end) => end <= '2027-01-10' },
  { label: 'Jan – Mar 2027', match: (_, end) => end <= '2027-03-31' },
  { label: 'Apr – Jun 2027', match: (_, end) => end <= '2027-06-30' },
  { label: 'Jul – Sep 2027', match: (_, end) => end <= '2027-09-30' },
  { label: 'Oct – Dec 2027', match: () => true },
]

interface ListProps {
  items: RoadmapItem[]
  state: RoadmapState
  selectedId: string | null
  onSelect: (id: string) => void
}

export function RoadmapRow({
  item,
  state,
  selected,
  onSelect,
  showDates = true,
}: {
  item: RoadmapItem
  state: RoadmapState
  selected: boolean
  onSelect: (id: string) => void
  showDates?: boolean
}) {
  const p = progressFor(state, item.id)
  const pct = completion(item, p)
  const Icon = KIND_META[item.kind].icon
  const artifactCount = item.artifacts.length + p.links.length
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={cn(
          'grid w-full grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 px-3 py-3 text-left rounded-lg',
          'sm:grid-cols-[auto_1fr_9rem_6rem]',
          'hover:bg-text/[0.04]',
          selected && 'bg-primary/[0.07]',
          focusRing,
        )}
      >
        <StatusDot status={p.status} />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-sm">
            <Icon aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-text-secondary" />
            {item.code && <span className="whitespace-nowrap font-semibold text-text">{item.code}</span>}
            <span className="truncate text-text">{item.title}</span>
            {item.priority === 'strong' && (
              <span className="hidden md:inline text-[11px] text-text-secondary border border-border rounded px-1.5">
                strong
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-xs text-text-secondary">{item.summary}</span>
        </span>
        {showDates && (
          <span className="col-start-2 sm:col-start-auto text-xs text-text-secondary">
            {formatRange(item.start, targetDate(item, p))}
          </span>
        )}
        <span className="col-start-2 sm:col-start-auto flex items-center gap-2">
          <ProgressBar value={pct} status={p.status} label={`${STATUS_LABEL[p.status]}, ${Math.round(pct * 100)}%`} />
          {artifactCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-text-secondary" title="Artifacts">
              <Paperclip aria-hidden="true" className="h-3 w-3" />
              {artifactCount}
            </span>
          )}
        </span>
      </button>
    </li>
  )
}

export function RoadmapList({ items, state, selectedId, onSelect }: ListProps) {
  const sorted = [...items].sort((a, b) => a.end.localeCompare(b.end) || a.start.localeCompare(b.start))
  const buckets = GROUPS.map((g) => ({ ...g, items: [] as RoadmapItem[] }))
  for (const item of sorted) {
    const end = targetDate(item, progressFor(state, item.id))
    buckets.find((b) => b.match(item, end))!.items.push(item)
  }

  return (
    <div className="space-y-8">
      {buckets
        .filter((b) => b.items.length > 0)
        .map((b) => (
          <section key={b.label} aria-label={b.label}>
            <h3 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">{b.label}</h3>
            <ul className="divide-y divide-border">
              {b.items.map((item) => (
                <RoadmapRow
                  key={item.id}
                  item={item}
                  state={state}
                  selected={selectedId === item.id}
                  onSelect={onSelect}
                />
              ))}
            </ul>
          </section>
        ))}
    </div>
  )
}
