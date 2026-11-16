import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Cloud,
  CloudOff,
  Download,
  HardDrive,
  List as ListIcon,
  Map as MapIcon,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ITEMS_BY_ID, LANES, ROADMAP } from './roadmapData'
import {
  completion,
  daysBetween,
  formatDate,
  parseDate,
  progressFor,
  targetDate,
  todayLocal,
} from './progress'
import { RoadmapMap } from './RoadmapMap'
import { RoadmapList, RoadmapRow } from './RoadmapList'
import { ItemPanel } from './ItemPanel'
import { useRoadmapState, type SaveStatus, type SyncMode } from './useRoadmapState'
import type { LaneId, RoadmapState } from './types'
import { ProgressBar, StatusDot, focusRing } from './ui'

/** null = fit the year to the screen. */
const ZOOM_LEVELS: (number | null)[] = [null, 4, 6]
const PLANNED = ROADMAP.filter((i) => i.priority !== 'parked')
const PARKED = ROADMAP.filter((i) => i.priority === 'parked')

function SyncBadge({ mode, saveStatus }: { mode: SyncMode; saveStatus: SaveStatus }) {
  let icon = HardDrive
  let text = 'Saved on this device'
  if (mode === 'loading') text = 'Loading progress…'
  if (mode === 'cloud') {
    icon = Cloud
    text = saveStatus === 'saving' ? 'Saving…' : 'Synced'
    if (saveStatus === 'error') {
      icon = CloudOff
      text = 'Sync failed — saved on this device'
    }
  }
  const Icon = icon
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary" aria-live="polite">
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {text}
    </span>
  )
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const on = () => setNarrow(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return narrow
}

function Stats({ state, onSelect }: { state: RoadmapState; onSelect: (id: string) => void }) {
  const today = todayLocal()
  const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const overall = PLANNED.reduce((sum, i) => sum + completion(i, progressFor(state, i.id)), 0) / PLANNED.length
  const certs = PLANNED.filter((i) => i.kind === 'certification')
  const passed = certs.filter((i) => progressFor(state, i.id).status === 'done').length

  const next = certs
    .filter((i) => progressFor(state, i.id).status !== 'done')
    .map((i) => ({ item: i, date: targetDate(i, progressFor(state, i.id)) }))
    .filter((x) => x.date >= isoToday)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const focus = PLANNED.filter((i) => {
    const p = progressFor(state, i.id)
    if (p.status === 'done') return false
    return p.status === 'doing' || (i.start <= isoToday && targetDate(i, p) >= isoToday)
  })
    .sort((a, b) => targetDate(a, progressFor(state, a.id)).localeCompare(targetDate(b, progressFor(state, b.id))))
    .slice(0, 4)

  const cell = 'px-0 py-4 sm:px-6 first:pl-0'
  return (
    <div className="grid grid-cols-2 gap-x-6 border-y border-border lg:grid-cols-[1fr_1fr_1fr_2fr] lg:divide-x lg:divide-border lg:gap-x-0">
      <div className={cell}>
        <p className="text-xs text-text-secondary">Overall</p>
        <p className="mt-1 text-2xl font-bold text-text">{Math.round(overall * 100)}%</p>
        <ProgressBar value={overall} status="doing" className="mt-2" label="Overall completion" />
      </div>
      <div className={cell}>
        <p className="text-xs text-text-secondary">Certifications passed</p>
        <p className="mt-1 text-2xl font-bold text-text">
          {passed}
          <span className="text-base font-normal text-text-secondary"> / {certs.length}</span>
        </p>
      </div>
      <div className={cell}>
        <p className="text-xs text-text-secondary">Next exam</p>
        {next ? (
          <button
            type="button"
            onClick={() => onSelect(next.item.id)}
            className={cn('mt-1 block text-left rounded hover:text-primary', focusRing)}
          >
            <span className="text-2xl font-bold text-text">{daysBetween(today, parseDate(next.date))}</span>
            <span className="text-base text-text-secondary"> days</span>
            <span className="block text-xs text-text-secondary">
              {next.item.code} · {formatDate(next.date, true)}
            </span>
          </button>
        ) : (
          <p className="mt-1 text-sm text-text-secondary">Nothing scheduled</p>
        )}
      </div>
      <div className={cn(cell, 'col-span-2 lg:col-span-1 border-t border-border lg:border-t-0')}>
        <p className="text-xs text-text-secondary">Focus now</p>
        {focus.length === 0 ? (
          <p className="mt-1 text-sm text-text-secondary">Nothing active — pick the next item on the map.</p>
        ) : (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {focus.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => onSelect(i.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-sm text-text hover:border-primary hover:text-primary',
                    focusRing,
                  )}
                >
                  <StatusDot status={progressFor(state, i.id).status} className="h-2 w-2" />
                  {i.code ?? i.title}
                  <span className="text-xs text-text-secondary">
                    {Math.round(completion(i, progressFor(state, i.id)) * 100)}%
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/**
 * Private learning roadmap (Nov 2026 → Dec 2027) — certifications, reading,
 * the capstone build and skill tracks on one timeline, each linked to its
 * study artifacts. Lives under /admin, so the existing Cloudflare Access
 * application gates it; never prerendered, never indexed.
 */
function RoadmapPage() {
  // Private page: just the tab title — no canonical/OG tags (see usePageMeta for public routes).
  useEffect(() => {
    const prev = document.title
    document.title = 'Learning roadmap'
    return () => {
      document.title = prev
    }
  }, [])
  const { itemId } = useParams()
  const navigate = useNavigate()
  const narrow = useIsNarrow()
  const { state, mode, saveStatus, updateItem, replaceState, isState } = useRoadmapState()

  const [view, setView] = useState<'map' | 'list'>(() => (narrow ? 'list' : 'map'))
  const [zoom, setZoom] = useState(0)
  const [hidden, setHidden] = useState<Set<LaneId>>(new Set())
  const [hideDone, setHideDone] = useState(false)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selected = itemId ? ITEMS_BY_ID[itemId] : undefined
  const select = useCallback((id: string) => navigate(`/admin/roadmap/${id}`), [navigate])
  const close = useCallback(() => navigate('/admin/roadmap'), [navigate])

  const visible = useMemo(
    () =>
      PLANNED.filter(
        (i) => !hidden.has(i.lane) && !(hideDone && progressFor(state, i.id).status === 'done'),
      ),
    [hidden, hideDone, state],
  )

  const toggleLane = (id: LaneId) =>
    setHidden((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const exportState = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `roadmap-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importState = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isState(parsed)) throw new Error()
      replaceState(parsed)
      setImportError(null)
    } catch {
      setImportError("That file isn't a roadmap progress export.")
    }
  }

  const chip = (on: boolean) =>
    cn(
      'rounded-md border px-2.5 py-1 text-xs',
      on ? 'border-text-secondary text-text' : 'border-border text-text-secondary line-through decoration-text-secondary/50',
      'hover:border-text-secondary',
      focusRing,
    )

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-6">
          <nav className="flex flex-wrap items-center gap-5 text-sm text-text-secondary">
            <Link to="/" className="inline-flex items-center gap-1.5 hover:text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to site
            </Link>
            <Link to="/admin" className="hover:text-primary">
              Blog admin
            </Link>
          </nav>
        </div>
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-4 px-4 pb-8 pt-6 sm:px-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Learning roadmap</p>
            <h1 className="text-3xl font-bold leading-tight text-text md:text-4xl">Nov 2026 → Dec 2027</h1>
            <p className="mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
              Seven certifications, one capstone, and the reading and skills that connect them. Click anything to
              open its checklist, notes and study artifacts.
            </p>
          </div>
          <SyncBadge mode={mode} saveStatus={saveStatus} />
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] space-y-8 px-4 py-8 sm:px-6">
        <Stats state={state} onSelect={select} />

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Show lanes">
            {LANES.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={!hidden.has(l.id)}
                onClick={() => toggleLane(l.id)}
                className={chip(!hidden.has(l.id))}
              >
                {l.label}
              </button>
            ))}
            <label className="ml-2 inline-flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary">
              <input
                type="checkbox"
                checked={hideDone}
                onChange={(e) => setHideDone(e.target.checked)}
                className="accent-[rgb(var(--protea-rgb))]"
              />
              Hide done
            </label>
          </div>

          <div className="flex items-center gap-2">
            {view === 'map' && (
              <div className="flex items-center rounded-lg border border-border" role="group" aria-label="Zoom">
                <button
                  type="button"
                  aria-label="Zoom out"
                  disabled={zoom === 0}
                  onClick={() => setZoom((z) => Math.max(0, z - 1))}
                  className={cn('p-1.5 text-text-secondary hover:text-text disabled:opacity-40', focusRing)}
                >
                  <ZoomOut aria-hidden="true" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  disabled={zoom === ZOOM_LEVELS.length - 1}
                  onClick={() => setZoom((z) => Math.min(ZOOM_LEVELS.length - 1, z + 1))}
                  className={cn('p-1.5 text-text-secondary hover:text-text disabled:opacity-40', focusRing)}
                >
                  <ZoomIn aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 rounded-lg border border-border p-0.5" role="radiogroup" aria-label="View">
              {(
                [
                  ['map', 'Map', MapIcon],
                  ['list', 'List', ListIcon],
                ] as const
              ).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs',
                    view === v ? 'bg-text/[0.08] font-semibold text-text' : 'text-text-secondary hover:text-text',
                    focusRing,
                  )}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === 'map' ? (
          <div className="space-y-3">
            <RoadmapMap
              items={visible}
              state={state}
              dayPx={ZOOM_LEVELS[zoom]}
              activeId={hoverId ?? selected?.id ?? null}
              selectedId={selected?.id ?? null}
              onHover={setHoverId}
              onSelect={select}
            />
            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1.5"><StatusDot status="todo" /> To do</span>
              <span className="inline-flex items-center gap-1.5"><StatusDot status="doing" /> In progress</span>
              <span className="inline-flex items-center gap-1.5"><StatusDot status="done" /> Done</span>
              <span className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rotate-45 border border-primary" /> Exam target
              </span>
              <span>Dashed = strong pick, not core · Hover or select an item to trace what it builds on and unlocks</span>
            </p>
          </div>
        ) : (
          <RoadmapList items={visible} state={state} selectedId={selected?.id ?? null} onSelect={select} />
        )}

        {/* Parked */}
        <section aria-labelledby="parked-heading" className="border-t border-border pt-8">
          <h2 id="parked-heading" className="text-lg font-semibold text-text">
            Parked
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Good certifications for a different role. Revisit if work rewards them or the job moves towards data.
          </p>
          <ul className="mt-3 divide-y divide-border">
            {PARKED.map((item) => (
              <RoadmapRow
                key={item.id}
                item={item}
                state={state}
                selected={selected?.id === item.id}
                onSelect={select}
                showDates={false}
              />
            ))}
          </ul>
        </section>

        <footer className="flex flex-wrap items-center gap-4 border-t border-border pt-6 text-xs text-text-secondary">
          <button type="button" onClick={exportState} className={cn('inline-flex items-center gap-1.5 rounded hover:text-primary', focusRing)}>
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            Export progress
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn('inline-flex items-center gap-1.5 rounded hover:text-primary', focusRing)}
          >
            <Upload aria-hidden="true" className="h-3.5 w-3.5" />
            Import progress
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={importState} className="hidden" />
          {importError && <span className="text-primary">{importError}</span>}
          {mode === 'local' && (
            <span>Progress is stored in this browser. Bind ROADMAP_KV to sync across devices.</span>
          )}
        </footer>
      </main>

      {selected && (
        <ItemPanel item={selected} state={state} onUpdate={updateItem} onClose={close} onNavigate={select} />
      )}
    </div>
  )
}

export default RoadmapPage
