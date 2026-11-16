import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Check, ExternalLink, Plus, Trash2, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ITEMS_BY_ID } from './roadmapData'
import { checklistFor, completion, dependentsOf, formatRange, progressFor, targetDate } from './progress'
import type { ArtifactKind, ArtifactLink, ItemProgress, ItemStatus, RoadmapItem, RoadmapState } from './types'
import { ARTIFACT_META, KIND_META, ProgressBar, STATUS_LABEL, StatusDot, focusRing } from './ui'

interface PanelProps {
  item: RoadmapItem
  state: RoadmapState
  onUpdate: (id: string, update: (p: ItemProgress) => ItemProgress) => void
  onClose: () => void
  onNavigate: (id: string) => void
}

const STATUSES: ItemStatus[] = ['todo', 'doing', 'done']

const inputClass = cn(
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text',
  'placeholder:text-text-secondary focus:outline-2 focus:outline-primary focus:outline-offset-2',
)

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{children}</h3>
      {aside}
    </div>
  )
}

function ArtifactRow({ link, onRemove }: { link: ArtifactLink; onRemove?: () => void }) {
  const meta = ARTIFACT_META[link.kind] ?? ARTIFACT_META.other
  const Icon = meta.icon
  return (
    <li className="group flex items-center gap-3 py-2.5">
      <Icon aria-hidden="true" className="h-4 w-4 flex-shrink-0 text-primary" />
      <a
        href={link.url}
        target="_blank"
        rel="noreferrer"
        className={cn('min-w-0 flex-1 rounded', focusRing)}
      >
        <span className="block truncate text-sm text-text group-hover:text-primary">{link.title}</span>
        <span className="block truncate text-xs text-text-secondary">
          {meta.label} · {hostOf(link.url)}
        </span>
      </a>
      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-text-secondary" />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${link.title}`}
          className={cn('rounded p-1 text-text-secondary hover:text-primary', focusRing)}
        >
          <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      )}
    </li>
  )
}

export function ItemPanel({ item, state, onUpdate, onClose, onNavigate }: PanelProps) {
  const p = progressFor(state, item.id)
  const list = useMemo(() => checklistFor(item, p), [item, p])
  const checked = new Set(p.checked)
  const pct = completion(item, p)
  const done = list.filter((e) => checked.has(e.id)).length
  const KindIcon = KIND_META[item.kind].icon
  const closeRef = useRef<HTMLButtonElement>(null)
  const unlocks = dependentsOf(item.id)
  const deps = (item.dependsOn ?? []).map((id) => ITEMS_BY_ID[id]).filter(Boolean)

  const [newTask, setNewTask] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkKind, setLinkKind] = useState<ArtifactKind>('study-guide')
  const [linkError, setLinkError] = useState<string | null>(null)

  const update = (fn: (p: ItemProgress) => ItemProgress) => onUpdate(item.id, fn)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [item.id, onClose])

  const toggle = (id: string) =>
    update((cur) => {
      const has = cur.checked.includes(id)
      const nextChecked = has ? cur.checked.filter((x) => x !== id) : [...cur.checked, id]
      // Ticking the first box means you've started.
      const status = !has && cur.status === 'todo' ? 'doing' : cur.status
      return { ...cur, checked: nextChecked, status }
    })

  const addTask = (e: FormEvent) => {
    e.preventDefault()
    const t = newTask.trim()
    if (!t || p.customTasks.includes(t)) return
    update((cur) => ({ ...cur, customTasks: [...cur.customTasks, t] }))
    setNewTask('')
  }

  const addLink = (e: FormEvent) => {
    e.preventDefault()
    let url: URL
    try {
      url = new URL(linkUrl.trim())
      if (!/^https?:$/.test(url.protocol)) throw new Error()
    } catch {
      setLinkError('Enter a full http(s) URL.')
      return
    }
    const title = linkTitle.trim() || hostOf(url.href)
    update((cur) => ({ ...cur, links: [...cur.links, { title, url: url.href, kind: linkKind }] }))
    setLinkTitle('')
    setLinkUrl('')
    setLinkError(null)
  }

  // Group checklist entries by exam domain, keeping tasks/custom at the end.
  const groups = useMemo(() => {
    const map = new Map<string, { weight?: string; entries: typeof list }>()
    for (const e of list) {
      const key = e.custom ? 'Your additions' : e.group ?? (item.domains ? 'Tasks' : 'Checklist')
      if (!map.has(key)) map.set(key, { weight: e.weight, entries: [] })
      map.get(key)!.entries.push(e)
    }
    return [...map.entries()]
  }, [list, item.domains])

  const artifactTotal = item.artifacts.length + p.links.length

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="roadmap-panel-title">
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-background/70"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-border bg-background sm:w-[480px]">
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-text-secondary">
              <KindIcon aria-hidden="true" className="h-3.5 w-3.5" />
              {KIND_META[item.kind].label}
              {item.priority !== 'core' && <span>· {item.priority === 'strong' ? 'Strong pick' : 'Parked'}</span>}
            </p>
            {item.code && <p className="mt-2 text-sm font-semibold text-primary">{item.code}</p>}
            <h2 id="roadmap-panel-title" className="text-xl font-bold leading-snug text-text">
              {item.title}
            </h2>
            {item.priority !== 'parked' && (
              <p className="mt-1 text-sm text-text-secondary">{formatRange(item.start, targetDate(item, p))}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn('rounded-lg p-1.5 text-text-secondary hover:text-text', focusRing)}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-6">
          <p className="text-sm text-text">{item.summary}</p>

          {/* Status */}
          <div>
            <div role="radiogroup" aria-label="Status" className="grid grid-cols-3 gap-1 rounded-lg border border-border p-1">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={p.status === s}
                  onClick={() => update((cur) => ({ ...cur, status: s }))}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm',
                    p.status === s ? 'bg-text/[0.08] text-text font-semibold' : 'text-text-secondary hover:text-text',
                    focusRing,
                  )}
                >
                  <StatusDot status={s} />
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <ProgressBar value={pct} status={p.status} label="Completion" />
              <span className="whitespace-nowrap text-xs text-text-secondary">
                {list.length > 0 ? `${done} / ${list.length}` : `${Math.round(pct * 100)}%`}
              </span>
            </div>
          </div>

          {item.kind === 'certification' && item.priority !== 'parked' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs text-text-secondary">
                Exam date
                <input
                  type="date"
                  value={p.examDate ?? ''}
                  onChange={(e) => update((cur) => ({ ...cur, examDate: e.target.value || undefined }))}
                  className={cn(inputClass, 'mt-1')}
                />
              </label>
              <label className="text-xs text-text-secondary">
                Score
                <input
                  type="number"
                  min={0}
                  max={1000}
                  placeholder="700 to pass"
                  value={p.score ?? ''}
                  onChange={(e) =>
                    update((cur) => ({ ...cur, score: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  className={cn(inputClass, 'mt-1')}
                />
              </label>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <SectionTitle>Why this, why now</SectionTitle>
              <p className="text-sm text-text-secondary">{item.why}</p>
            </div>
            <div>
              <SectionTitle>Done when</SectionTitle>
              <p className="text-sm text-text-secondary">{item.outcome}</p>
            </div>
            {(deps.length > 0 || unlocks.length > 0) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { title: 'Builds on', items: deps },
                  { title: 'Unlocks', items: unlocks },
                ]
                  .filter((g) => g.items.length > 0)
                  .map((g) => (
                    <div key={g.title}>
                      <SectionTitle>{g.title}</SectionTitle>
                      <div className="flex flex-wrap gap-1.5">
                        {g.items.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => onNavigate(d.id)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-text hover:border-primary hover:text-primary',
                              focusRing,
                            )}
                          >
                            <StatusDot status={progressFor(state, d.id).status} className="h-2 w-2" />
                            {d.code ?? d.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Artifacts */}
          <section>
            <SectionTitle aside={<span className="text-xs text-text-secondary">{artifactTotal}</span>}>
              Artifacts
            </SectionTitle>
            {artifactTotal === 0 && (
              <p className="mb-3 text-sm text-text-secondary">
                No study artifacts yet. Add a link to a study guide, cheat sheet or lab as you make them.
              </p>
            )}
            {artifactTotal > 0 && (
              <ul className="mb-3 divide-y divide-border">
                {item.artifacts.map((a) => (
                  <ArtifactRow key={a.url} link={a} />
                ))}
                {p.links.map((a, i) => (
                  <ArtifactRow
                    key={`${a.url}-${i}`}
                    link={a}
                    onRemove={() => update((cur) => ({ ...cur, links: cur.links.filter((_, j) => j !== i) }))}
                  />
                ))}
              </ul>
            )}
            <form onSubmit={addLink} className="space-y-2 rounded-lg border border-border p-3">
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Title (optional)"
                  aria-label="Artifact title"
                  className={inputClass}
                />
                <select
                  value={linkKind}
                  onChange={(e) => setLinkKind(e.target.value as ArtifactKind)}
                  aria-label="Artifact type"
                  className={cn(inputClass, 'w-auto')}
                >
                  {Object.entries(ARTIFACT_META).map(([k, m]) => (
                    <option key={k} value={k}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                  aria-label="Artifact URL"
                  inputMode="url"
                  className={inputClass}
                />
                <button
                  type="submit"
                  className={cn(
                    'inline-flex items-center gap-1 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary hover:opacity-90',
                    focusRing,
                  )}
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Add link
                </button>
              </div>
              {linkError && <p className="text-xs text-primary">{linkError}</p>}
            </form>
          </section>

          {/* Checklist */}
          <section>
            <SectionTitle
              aside={item.skillsAsOf && <span className="text-[11px] text-text-secondary">Skills as of {item.skillsAsOf}</span>}
            >
              {item.domains ? 'Skills measured' : 'Checklist'}
            </SectionTitle>
            <div className="space-y-5">
              {groups.map(([name, g]) => {
                const groupDone = g.entries.filter((e) => checked.has(e.id)).length
                return (
                  <div key={name}>
                    {(item.domains || name === 'Your additions') && (
                      <div className="mb-1.5 flex items-baseline justify-between gap-3">
                        <p className="text-sm font-semibold text-text">{name}</p>
                        <p className="whitespace-nowrap text-xs text-text-secondary">
                          {g.weight && <span className="mr-2">{g.weight}</span>}
                          {groupDone}/{g.entries.length}
                        </p>
                      </div>
                    )}
                    <ul className="space-y-0.5">
                      {g.entries.map((e) => {
                        const on = checked.has(e.id)
                        return (
                          <li key={e.id} className="flex items-start gap-1">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={on}
                              onClick={() => toggle(e.id)}
                              className={cn(
                                'flex flex-1 items-start gap-2.5 rounded-md px-1.5 py-1.5 text-left text-sm hover:bg-text/[0.04]',
                                focusRing,
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border',
                                  on ? 'border-success bg-success text-background' : 'border-text-secondary/60',
                                )}
                              >
                                {on && <Check className="h-3 w-3" strokeWidth={3} />}
                              </span>
                              <span className={cn(on ? 'text-text-secondary line-through decoration-text-secondary/50' : 'text-text')}>
                                {e.label}
                              </span>
                            </button>
                            {e.custom && (
                              <button
                                type="button"
                                aria-label={`Remove ${e.label}`}
                                onClick={() =>
                                  update((cur) => ({
                                    ...cur,
                                    customTasks: cur.customTasks.filter((t) => t !== e.label),
                                    checked: cur.checked.filter((c) => c !== e.id),
                                  }))
                                }
                                className={cn('mt-1 rounded p-1 text-text-secondary hover:text-primary', focusRing)}
                              >
                                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
            <form onSubmit={addTask} className="mt-3 flex gap-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add your own item…"
                aria-label="New checklist item"
                className={inputClass}
              />
              <button
                type="submit"
                aria-label="Add checklist item"
                className={cn('rounded-lg border border-border px-3 text-text-secondary hover:border-text-secondary hover:text-text', focusRing)}
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
              </button>
            </form>
          </section>

          {/* Notes */}
          <section>
            <SectionTitle>Notes</SectionTitle>
            <textarea
              value={p.notes}
              onChange={(e) => update((cur) => ({ ...cur, notes: e.target.value }))}
              rows={6}
              placeholder="Thoughts, weak spots, things to revisit before the exam…"
              aria-label="Notes"
              className={cn(inputClass, 'resize-y leading-relaxed')}
            />
          </section>

          {/* Resources */}
          {item.resources.length > 0 && (
            <section>
              <SectionTitle>Official resources</SectionTitle>
              <ul className="space-y-1.5">
                {item.resources.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn('inline-flex items-center gap-1.5 rounded text-sm text-primary hover:opacity-80', focusRing)}
                    >
                      {r.label}
                      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}
