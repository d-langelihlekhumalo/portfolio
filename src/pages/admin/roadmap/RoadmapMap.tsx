import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { LANES, PERIODS, ROADMAP_RANGE } from './roadmapData'
import {
  completion,
  daysBetween,
  formatRange,
  monthLabel,
  parseDate,
  progressFor,
  relatedIds,
  targetDate,
  todayLocal,
} from './progress'
import type { RoadmapItem, RoadmapState } from './types'
import { KIND_META, STATUS_BAR, STATUS_FILL, STATUS_LABEL, focusRing } from './ui'

const LABEL_W = 148
const HEADER_H = 48
const ROW_H = 42
const BAR_H = 30
const LANE_PAD = 10
const LABEL_GAP = 8
/** Rough glyph width for text-xs Schibsted Grotesk — only used to pack rows. */
const CHAR_W = 6.6

interface Placed {
  item: RoadmapItem
  x: number
  y: number
  w: number
  /** Label rendered to the right of a bar too narrow to hold it. */
  outside: boolean
}

interface MapProps {
  items: RoadmapItem[]
  state: RoadmapState
  /** Pixels per day; null = fit the whole range to the available width. */
  dayPx: number | null
  activeId: string | null
  selectedId: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

function labelFor(item: RoadmapItem) {
  return item.code ? `${item.code} · ${item.title}` : item.title
}

export function RoadmapMap({ items, state, dayPx: zoomPx, activeId, selectedId, onHover, onSelect }: MapProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const rangeStart = useMemo(() => parseDate(ROADMAP_RANGE.start), [])
  const totalDays = daysBetween(rangeStart, parseDate(ROADMAP_RANGE.end)) + 1

  // Track the scroller's width so "fit" zoom shows the whole year without scrolling.
  const [viewW, setViewW] = useState(0)
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(() => setViewW(el.clientWidth))
    ro.observe(el)
    setViewW(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  const dayPx = zoomPx ?? Math.max(1.6, (viewW - 4) / totalDays)
  const width = totalDays * dayPx
  const xOf = (iso: string) => daysBetween(rangeStart, parseDate(iso)) * dayPx
  const today = todayLocal()
  const todayX = daysBetween(rangeStart, today) * dayPx

  // Pack each lane into as few rows as possible without bars or their labels colliding.
  const { placed, lanes, height } = useMemo(() => {
    const placed: Record<string, Placed> = {}
    const lanes: { id: string; label: string; top: number; height: number }[] = []
    let top = HEADER_H

    for (const lane of LANES) {
      const laneItems = items
        .filter((i) => i.lane === lane.id)
        .sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end))
      if (laneItems.length === 0) continue

      const rowEnds: number[] = []
      for (const item of laneItems) {
        const p = progressFor(state, item.id)
        const x = xOf(item.start)
        const w = Math.max(xOf(targetDate(item, p)) + dayPx - x, 10)
        const labelW = labelFor(item).length * CHAR_W + 34
        // Keep the label inside unless the bar can't even fit the code.
        const outside = w < Math.min(labelW, 72)
        const occupiedEnd = outside ? x + w + LABEL_GAP + labelW : x + w
        let row = rowEnds.findIndex((end) => end + LABEL_GAP <= x)
        if (row === -1) {
          row = rowEnds.length
          rowEnds.push(0)
        }
        rowEnds[row] = occupiedEnd
        placed[item.id] = { item, x, w, outside, y: top + LANE_PAD + row * ROW_H }
      }
      const h = LANE_PAD * 2 + rowEnds.length * ROW_H - (ROW_H - BAR_H)
      lanes.push({ id: lane.id, label: lane.label, top, height: h })
      top += h
    }
    return { placed, lanes, height: top }
  }, [items, state, dayPx])

  const related = activeId ? relatedIds(activeId) : null

  const months = useMemo(() => {
    const out: { x: number; label: string; year?: number }[] = []
    const d = new Date(rangeStart)
    while (daysBetween(rangeStart, d) < totalDays) {
      out.push({
        x: daysBetween(rangeStart, d) * dayPx,
        label: monthLabel(d),
        year: d.getMonth() === 0 || out.length === 0 ? d.getFullYear() : undefined,
      })
      d.setMonth(d.getMonth() + 1)
    }
    return out
  }, [rangeStart, totalDays, dayPx])

  // Open with today in view rather than at the start of the range.
  useLayoutEffect(() => {
    const el = scroller.current
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    if (el) el.scrollLeft = Math.max(0, daysBetween(rangeStart, monthStart) * dayPx)
  }, [dayPx])

  const edges = Object.values(placed).flatMap((t) =>
    (t.item.dependsOn ?? [])
      .map((depId) => placed[depId])
      .filter(Boolean)
      .map((s) => {
        const sy = s.y + BAR_H / 2
        const ty = t.y + BAR_H / 2
        const sEnd = s.x + s.w
        let d: string
        if (t.x >= sEnd + 12) {
          const bend = Math.min(48, (t.x - sEnd) / 2)
          d = `M ${sEnd} ${sy} C ${sEnd + bend} ${sy}, ${t.x - bend} ${ty}, ${t.x} ${ty}`
        } else {
          // Overlapping windows (e.g. the capstone feeding AI-200): leave from the
          // source's top/bottom edge just before the target starts.
          const sx = Math.max(s.x + 6, Math.min(t.x - 10, sEnd - 6))
          const syEdge = ty > sy ? s.y + BAR_H : s.y
          d = `M ${sx} ${syEdge} C ${sx} ${ty}, ${sx} ${ty}, ${t.x} ${ty}`
        }
        const active = related ? related.has(s.item.id) && related.has(t.item.id) : false
        return { key: `${s.item.id}->${t.item.id}`, d, active }
      }),
  )
  // Every line at once is a hairball — draw only the spotlighted chain.
  const visibleEdges = edges.filter((e) => e.active)

  return (
    <div className="flex rounded-xl border border-border bg-surface/40">
      {/* Lane labels — outside the scroller so they never scroll away. */}
      <div className="flex-shrink-0 border-r border-border" style={{ width: LABEL_W }}>
        <div style={{ height: HEADER_H }} className="border-b border-border" />
        {lanes.map((l) => (
          <div
            key={l.id}
            style={{ height: l.height }}
            className="flex items-start px-4 pt-[18px] text-xs font-semibold uppercase tracking-wider text-text-secondary border-b border-border last:border-b-0"
          >
            {l.label}
          </div>
        ))}
      </div>

      <div ref={scroller} className="relative flex-1 overflow-x-auto overflow-y-hidden">
        <div className="relative" style={{ width, height }}>
          {/* Periods (leave) */}
          {PERIODS.map((p) => (
            <div
              key={p.label}
              className="absolute top-0 bottom-0 bg-primary/[0.05] border-x border-primary/15"
              style={{ left: xOf(p.start), width: xOf(p.end) - xOf(p.start) + dayPx }}
            >
              <span className="absolute bottom-1.5 left-2 text-[11px] text-primary/80">{p.label}</span>
            </div>
          ))}

          {/* Month grid + header */}
          {months.map((m) => (
            <div key={m.x} className="absolute top-0 bottom-0 border-l border-border/70" style={{ left: m.x }}>
              <div className="px-2 pt-2 text-xs leading-tight">
                <span className="font-semibold text-text">{m.label}</span>
                {m.year && <span className="block text-[11px] text-text-secondary">{m.year}</span>}
              </div>
            </div>
          ))}
          <div className="absolute left-0 right-0 border-b border-border" style={{ top: HEADER_H }} />
          {lanes.slice(1).map((l) => (
            <div key={l.id} className="absolute left-0 right-0 border-t border-border/70" style={{ top: l.top }} />
          ))}

          {/* Today */}
          {todayX >= 0 && todayX <= width && (
            <div className="absolute top-0 bottom-0 z-10 pointer-events-none" style={{ left: todayX }}>
              <div className="h-full border-l-2 border-dashed border-primary" />
              {/* Sits on the header's bottom edge so it never covers a month name. */}
              <span
                className="absolute left-1.5 rounded bg-primary px-1.5 py-0.5 text-[11px] font-semibold text-on-primary"
                style={{ top: HEADER_H - 10 }}
              >
                Today
              </span>
            </div>
          )}

          {/* Dependency lines */}
          <svg className="absolute inset-0 pointer-events-none" width={width} height={height} aria-hidden="true">
            <defs>
              <marker id="rm-arrow-active" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="fill-primary" />
              </marker>
            </defs>
            {visibleEdges.map((e) => (
              <path
                key={e.key}
                d={e.d}
                fill="none"
                strokeWidth={1.75}
                markerEnd="url(#rm-arrow-active)"
                className="stroke-primary"
              />
            ))}
          </svg>

          {/* Bars */}
          {Object.values(placed).map(({ item, x, y, w, outside }) => {
            const p = progressFor(state, item.id)
            const pct = completion(item, p)
            const Icon = KIND_META[item.kind].icon
            const dim = related ? !related.has(item.id) : false
            const label = labelFor(item)
            return (
              <div
                key={item.id}
                className={cn('absolute z-20 motion-safe:transition-opacity', dim && 'opacity-30')}
                style={{ left: x, top: y, height: BAR_H }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  onMouseEnter={() => onHover(item.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(item.id)}
                  onBlur={() => onHover(null)}
                  aria-label={`${label}. ${STATUS_LABEL[p.status]}, ${Math.round(pct * 100)}% complete. ${formatRange(item.start, targetDate(item, p))}.`}
                  className={cn(
                    'group relative flex h-full items-center gap-1.5 overflow-hidden rounded-md border text-left text-xs',
                    item.priority === 'strong' && p.status === 'todo' && 'border-dashed',
                    STATUS_BAR[p.status],
                    selectedId === item.id && 'outline outline-2 outline-primary outline-offset-2',
                    focusRing,
                    outside ? 'justify-center px-0' : 'px-2',
                  )}
                  style={{ width: w }}
                >
                  <span
                    aria-hidden="true"
                    className={cn('absolute inset-y-0 left-0', STATUS_FILL[p.status])}
                    style={{ width: `${pct * 100}%` }}
                  />
                  <Icon aria-hidden="true" className="relative h-3.5 w-3.5 flex-shrink-0" />
                  {!outside && (
                    <span className="relative truncate">
                      {item.code && <span className="font-semibold text-text">{item.code}</span>}
                      {item.code && <span className="text-text-secondary"> · </span>}
                      <span>{item.title}</span>
                    </span>
                  )}
                </button>
                {outside && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => onSelect(item.id)}
                    onMouseEnter={() => onHover(item.id)}
                    onMouseLeave={() => onHover(null)}
                    className="absolute top-0 flex h-full items-center whitespace-nowrap text-xs text-text-secondary hover:text-text"
                    style={{ left: w + LABEL_GAP }}
                  >
                    {item.code && <span className="font-semibold text-text">{item.code}</span>}
                    {item.code && <span>&nbsp;·&nbsp;</span>}
                    {item.title}
                  </button>
                )}
                {item.kind === 'certification' && (
                  <span
                    aria-hidden="true"
                    title="Exam target"
                    className={cn(
                      'absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border',
                      p.status === 'done' ? 'border-success bg-success' : 'border-primary bg-background',
                    )}
                    style={{ left: w - 5 }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
