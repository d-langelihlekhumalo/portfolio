import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Cloud,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  HardDrive,
  Map as MapIcon,
  Palmtree,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { AdminNav } from './AdminNav'
import type { Draft } from './types'
import { PERIODS, ROADMAP } from './roadmap/roadmapData'
import { completion, daysBetween, formatDate, parseDate, progressFor, targetDate, todayLocal } from './roadmap/progress'
import { useRoadmapState } from './roadmap/useRoadmapState'
import type { ArtifactLink, RoadmapItem } from './roadmap/types'
import { useSalaryProfile } from './salary/useSalaryProfile'
import { payslip, projectYear } from './salary/employer'
import { TAX_YEARS } from './salary/taxTables'

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
const HIDE_KEY = 'admin-hide-figures'

function greeting(d: Date) {
  const h = d.getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

function relativeTime(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

const rand0 = (n: number) =>
  (Math.round(n) || 0).toLocaleString('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })

/** Drafts waiting for review (open PRs from the generator). */
function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/drafts')
      .then(async (r) => {
        if (!r.ok) throw new Error(`Couldn't load drafts (${r.status})`)
        return (await r.json()) as { drafts: Draft[] }
      })
      .then((d) => !cancelled && setDrafts(d.drafts))
      .catch((e: Error) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [])
  return { drafts, error }
}

function SyncPill({ mode }: { mode: 'loading' | 'cloud' | 'local' }) {
  if (mode === 'loading') return null
  const cloud = mode === 'cloud'
  const Icon = cloud ? Cloud : HardDrive
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary">
      <Icon aria-hidden="true" className="h-3 w-3" />
      {cloud ? 'Synced' : 'This browser'}
    </span>
  )
}

function SectionCard({
  icon,
  title,
  to,
  cta,
  meta,
  children,
  links,
}: {
  icon: ReactNode
  title: string
  to: string
  cta: string
  meta?: ReactNode
  children: ReactNode
  links?: { to: string; label: string }[]
}) {
  return (
    <section
      className="flex min-w-0 flex-col rounded-xl border border-border bg-surface/40"
      aria-labelledby={`card-${to}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 id={`card-${to}`} className="flex items-center gap-2 text-sm font-semibold text-text">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        {meta}
      </header>
      <div className="flex-1 px-5 py-4">{children}</div>
      <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-5 py-3">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {links?.map((l) => (
            <Link key={l.to} to={l.to} className={cn('rounded text-text-secondary hover:text-primary', focusRing)}>
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          to={to}
          className={cn(
            'inline-flex items-center gap-1 rounded text-sm font-semibold text-primary hover:opacity-80',
            focusRing,
          )}
        >
          {cta} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </footer>
    </section>
  )
}

function Meter({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="h-1.5 w-full overflow-hidden rounded-full bg-text/10"
    >
      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(2, value * 100)}%` }} />
    </div>
  )
}

function Glance({ label, value, note, to }: { label: string; value: ReactNode; note?: ReactNode; to?: string }) {
  const body = (
    <>
      <p className="text-xs text-text-secondary">{label}</p>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums text-text', to && 'group-hover:text-primary')}>{value}</p>
      {note && <p className="mt-0.5 truncate text-xs text-text-secondary">{note}</p>}
    </>
  )
  return to ? (
    <Link to={to} className={cn('group block min-w-0 rounded-lg py-3', focusRing)}>
      {body}
    </Link>
  ) : (
    <div className="min-w-0 py-3">{body}</div>
  )
}

/**
 * /admin home: one glance at each private section, with a way into each.
 * Everything here is read from the same sources the sections use (drafts API,
 * roadmap and salary state in this browser / KV) — nothing new is stored.
 */
function AdminDashboard() {
  const today = todayLocal()
  const now = new Date()
  const { drafts, error: draftsError } = useDrafts()
  const roadmap = useRoadmapState()
  const salary = useSalaryProfile()
  const [hidden, setHidden] = useState(() => {
    try {
      return window.localStorage.getItem(HIDE_KEY) !== '0'
    } catch {
      return true
    }
  })
  const toggleHidden = () => {
    setHidden((h) => {
      try {
        window.localStorage.setItem(HIDE_KEY, h ? '0' : '1')
      } catch {
        /* storage unavailable — keep it in memory */
      }
      return !h
    })
  }

  // ── Roadmap
  const active = ROADMAP.filter((i) => i.priority !== 'parked')
  const withProgress = active.map((item) => {
    const prog = progressFor(roadmap.state, item.id)
    return { item, prog, pct: completion(item, prog), target: targetDate(item, prog) }
  })
  const overall = withProgress.reduce((s, x) => s + x.pct, 0) / Math.max(1, withProgress.length)
  const doneCount = withProgress.filter((x) => x.prog.status === 'done').length
  const upNext = withProgress
    .filter((x) => x.prog.status !== 'done' && parseDate(x.item.start) <= addDays(today, 21))
    .sort((a, b) => {
      const doing = Number(b.prog.status === 'doing') - Number(a.prog.status === 'doing')
      return doing || a.target.localeCompare(b.target)
    })
    .slice(0, 3)
  const leave = PERIODS[0]
  const daysToLeave = daysBetween(today, parseDate(leave.start))
  const onLeave = daysToLeave <= 0 && daysBetween(today, parseDate(leave.end)) >= 0

  // ── Study materials (committed + added from the UI)
  const artifacts = useMemo(() => {
    const out: { item: RoadmapItem; link: ArtifactLink }[] = []
    for (const item of ROADMAP) {
      const prog = progressFor(roadmap.state, item.id)
      for (const link of [...item.artifacts, ...prog.links]) out.push({ item, link })
    }
    return out
  }, [roadmap.state])
  const [artifactQuery, setArtifactQuery] = useState('')
  const filteredArtifacts = artifacts.filter(({ item, link }) =>
    `${link.title} ${item.code ?? ''} ${item.title}`.toLowerCase().includes(artifactQuery.trim().toLowerCase()),
  )

  // ── Salary
  const profile = salary.profile
  const year = TAX_YEARS.find((y) => y.start <= isoDate(now) && isoDate(now) <= y.end) ?? TAX_YEARS[0]
  const hasProfile = profile.monthlyAmount > 0
  const thisMonth = hasProfile
    ? projectYear(profile, year).months.find((m) => m.month === now.getMonth() + 1)
    : undefined
  const regular = hasProfile ? payslip(profile, year) : undefined
  const money = (n: number) => (hidden ? 'R •••••' : rand0(n))

  const draftCount = drafts?.length ?? null

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 pt-6 md:px-10">
          <AdminNav />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-8 md:px-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Admin</p>
          <h1 className="text-3xl font-bold leading-tight text-text md:text-4xl">{greeting(now)}, Andile</h1>
          <p className="mt-2 text-sm text-text-secondary md:text-base">
            {now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-x-6 border-t border-border md:grid-cols-4 md:divide-x md:divide-border md:gap-x-0 [&>*]:md:px-5 [&>*:first-child]:md:pl-0">
            <Glance
              label="Drafts to review"
              value={draftCount ?? '–'}
              note={draftsError ? 'Couldn’t load' : draftCount === 0 ? 'All caught up' : 'Waiting on you'}
              to="/admin/blog"
            />
            <Glance
              label={onLeave ? 'On leave until' : 'Days to leave'}
              value={onLeave ? formatDate(leave.end) : Math.max(0, daysToLeave)}
              note={`${formatDate(leave.start)} → ${formatDate(leave.end, true)}`}
              to="/admin/roadmap"
            />
            <Glance
              label="Roadmap progress"
              value={`${Math.round(overall * 100)}%`}
              note={`${doneCount} of ${active.length} done`}
              to="/admin/roadmap"
            />
            <Glance
              label={thisMonth ? `Take-home, ${thisMonth.label}` : 'Take-home'}
              value={thisMonth ? money(thisMonth.net) : '–'}
              note={thisMonth ? (thisMonth.bonusGross > 0 ? 'Includes bonus' : 'Estimate') : 'Set up your package'}
              to="/admin/salary/employer"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-10 md:px-10 lg:grid-cols-2">
        <SectionCard
          icon={<MapIcon aria-hidden="true" className="h-4 w-4" />}
          title="Learning roadmap"
          to="/admin/roadmap"
          cta="Open roadmap"
          meta={<SyncPill mode={roadmap.mode} />}
        >
          <div className="flex items-center gap-3">
            <Meter value={overall} label="Overall roadmap progress" />
            <span className="shrink-0 text-xs tabular-nums text-text-secondary">{Math.round(overall * 100)}%</span>
          </div>
          <p className="mt-5 text-xs font-medium text-text-secondary">Up next</p>
          {upNext.length === 0 ? (
            <p className="mt-2 text-sm text-text-secondary">Nothing starting in the next three weeks.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {upNext.map(({ item, prog, pct, target }) => {
                const days = daysBetween(today, parseDate(target))
                return (
                  <li key={item.id}>
                    <Link
                      to={`/admin/roadmap/${item.id}`}
                      className={cn('group flex items-center justify-between gap-4 rounded py-2.5', focusRing)}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-text group-hover:text-primary">
                          {item.code ? `${item.code} · ` : ''}
                          {item.title}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {prog.status === 'doing' ? 'In progress' : `Starts ${formatDate(item.start)}`} · target{' '}
                          {formatDate(target)}
                          {days >= 0 ? ` (${days}d)` : ' (overdue)'}
                        </span>
                      </span>
                      <span className="w-16 shrink-0">
                        <Meter value={pct} label={`${item.title} progress`} />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          {daysToLeave > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-text-secondary">
              <Palmtree aria-hidden="true" className="h-3.5 w-3.5" />
              Leave starts {formatDate(leave.start)} — the December sprint is on the roadmap.
            </p>
          )}
        </SectionCard>

        <SectionCard
          icon={<FileText aria-hidden="true" className="h-4 w-4" />}
          title="Blog"
          to="/admin/blog"
          cta={draftCount ? 'Review drafts' : 'Generate a draft'}
          links={[{ to: '/blog', label: 'View live blog' }]}
        >
          {draftsError && <p className="text-sm text-text-secondary">{draftsError}</p>}
          {drafts === null && !draftsError && <p className="text-sm text-text-secondary">Loading drafts…</p>}
          {drafts?.length === 0 && (
            <p className="text-sm text-text-secondary">
              No drafts waiting. Generate one from the blog page — it opens a PR with a live preview to approve or
              reject.
            </p>
          )}
          {drafts && drafts.length > 0 && (
            <ul className="divide-y divide-border">
              {drafts.slice(0, 4).map((d) => (
                <li key={d.number} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-text">{d.title}</span>
                    <span className="text-xs text-text-secondary">
                      #{d.number} · {relativeTime(d.createdAt)}
                    </span>
                  </span>
                  {d.previewUrl && (
                    <a
                      href={d.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        'inline-flex shrink-0 items-center gap-1 rounded text-xs text-primary hover:opacity-80',
                        focusRing,
                      )}
                    >
                      Preview <ExternalLink aria-hidden="true" className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          icon={<Calculator aria-hidden="true" className="h-4 w-4" />}
          title="Salary & tax"
          to="/admin/salary/employer"
          cta="My employer"
          meta={
            <span className="flex items-center gap-3">
              <SyncPill mode={salary.mode} />
              <button
                type="button"
                onClick={toggleHidden}
                aria-pressed={!hidden}
                className={cn(
                  'inline-flex items-center gap-1 rounded text-[11px] text-text-secondary hover:text-primary',
                  focusRing,
                )}
              >
                {hidden ? (
                  <Eye aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {hidden ? 'Show figures' : 'Hide figures'}
              </button>
            </span>
          }
          links={[
            { to: '/admin/salary', label: 'General calculator' },
            { to: '/admin/salary/employer/benefits', label: 'Benefits' },
            { to: '/admin/salary/employer/medical', label: 'Medical aid' },
            { to: '/admin/salary/employer/what-if', label: 'What if…' },
          ]}
        >
          {!hasProfile || !regular ? (
            <p className="text-sm text-text-secondary">
              Your package isn't set up yet. Enter it once under My employer and the payslip, benefits, medical aid and
              what-if views fill in.
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="text-xs text-text-secondary">Normal month take-home</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-text">{money(regular.net)}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">PAYE a month</dt>
                <dd className="mt-0.5 text-lg font-bold tabular-nums text-text">{money(regular.paye)}</dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">Into retirement a month</dt>
                <dd className="mt-0.5 tabular-nums text-text">
                  {money(regular.employeeRetirement + regular.employer.retirement)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-text-secondary">Company benefits a month</dt>
                <dd className="mt-0.5 tabular-nums text-text">{money(regular.fringeBenefits)}</dd>
              </div>
            </dl>
          )}
          <p className="mt-4 text-xs text-text-secondary">{year.label} tables · estimates, not tax advice.</p>
        </SectionCard>

        <section
          className="flex min-w-0 flex-col rounded-xl border border-border bg-surface/40"
          aria-labelledby="card-study"
        >
          <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
            <h2 id="card-study" className="flex items-center gap-2 text-sm font-semibold text-text">
              <span className="text-primary">
                <BookOpen aria-hidden="true" className="h-4 w-4" />
              </span>
              Study materials
            </h2>
            <span className="text-[11px] text-text-secondary">{artifacts.length} linked</span>
          </header>
          <div className="flex-1 px-5 py-4">
            <label className="sr-only" htmlFor="artifact-search">
              Search study materials
            </label>
            <input
              id="artifact-search"
              type="search"
              value={artifactQuery}
              onChange={(e) => setArtifactQuery(e.target.value)}
              placeholder="Search — e.g. AZ-900, cheat sheet"
              className={cn(
                'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text placeholder:text-text-secondary',
                focusRing,
              )}
            />
            <ul className="mt-3 max-h-64 divide-y divide-border overflow-y-auto">
              {filteredArtifacts.map(({ item, link }) => (
                <li key={`${item.id}-${link.url}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn('group flex items-center justify-between gap-3 rounded py-2', focusRing)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-text group-hover:text-primary">{link.title}</span>
                      <span className="text-xs text-text-secondary">{item.code ?? item.title}</span>
                    </span>
                    <ExternalLink
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-text-secondary group-hover:text-primary"
                    />
                  </a>
                </li>
              ))}
              {filteredArtifacts.length === 0 && <li className="py-2 text-sm text-text-secondary">No matches.</li>}
            </ul>
          </div>
          <footer className="border-t border-border px-5 py-3 text-xs text-text-secondary">
            Add more from any roadmap item — they show up here.
          </footer>
        </section>
      </main>
    </div>
  )
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default AdminDashboard
