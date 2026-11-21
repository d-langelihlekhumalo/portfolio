import { useEffect } from 'react'
import { Link, NavLink, useParams } from 'react-router-dom'
import { ArrowLeft, Cloud, CloudOff, HardDrive } from 'lucide-react'
import { cn } from '@/utils/cn'
import { CURRENT_YEAR } from './taxTables'
import { GeneralCalculator } from './GeneralCalculator'
import { EmployerCalculator } from './EmployerCalculator'
import { useSalaryProfile, type SaveStatus, type SyncMode } from './useSalaryProfile'
import { focusRing } from './ui'

function SyncBadge({ mode, saveStatus }: { mode: SyncMode; saveStatus: SaveStatus }) {
  let Icon = HardDrive
  let text = 'Saved in this browser only'
  if (mode === 'loading') text = 'Loading profile…'
  if (mode === 'cloud') {
    Icon = Cloud
    text = saveStatus === 'saving' ? 'Saving…' : 'Synced to your private storage'
    if (saveStatus === 'error') {
      Icon = CloudOff
      text = 'Sync failed — saved in this browser'
    }
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary" aria-live="polite">
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {text}
    </span>
  )
}

/**
 * Private salary & tax calculators under /admin (Cloudflare Access-gated).
 * General = any salary, current SARS tables. My employer = a saved profile of
 * the package rules; the figures live in the browser / KV, never in the repo.
 */
function SalaryPage() {
  const { section, view } = useParams()
  const employer = section === 'employer'
  const salary = useSalaryProfile()

  useEffect(() => {
    const prev = document.title
    document.title = 'Salary & tax'
    return () => {
      document.title = prev
    }
  }, [])

  const tab = (to: string, label: string, end = false) => (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'rounded-md px-3 py-1.5 text-sm',
          isActive ? 'bg-text/[0.08] font-semibold text-text' : 'text-text-secondary hover:text-text',
          focusRing,
        )
      }
    >
      {label}
    </NavLink>
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
            <Link to="/admin/roadmap" className="hover:text-primary">
              Learning roadmap
            </Link>
          </nav>
        </div>
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-end justify-between gap-4 px-4 pb-6 pt-6 sm:px-6">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">Salary &amp; tax</p>
            <h1 className="text-3xl font-bold leading-tight text-text md:text-4xl">What's left after SARS</h1>
            <p className="mt-3 max-w-2xl text-sm text-text-secondary md:text-base">
              PAYE, UIF and take-home on the {CURRENT_YEAR.label} SARS tables. Estimates for planning — your payslip and
              your assessment are what count.
            </p>
          </div>
          {employer && <SyncBadge mode={salary.mode} saveStatus={salary.saveStatus} />}
        </div>
        <div className="mx-auto max-w-[1280px] px-4 pb-4 sm:px-6">
          <div className="inline-flex gap-1 rounded-lg border border-border p-1" role="tablist" aria-label="Calculator">
            {tab('/admin/salary', 'General', true)}
            {tab('/admin/salary/employer', 'My employer')}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        {employer ? (
          <EmployerCalculator profile={salary.profile} update={salary.update} view={view} />
        ) : (
          <GeneralCalculator />
        )}

        <footer className="mt-12 space-y-2 border-t border-border pt-6 text-xs text-text-secondary">
          <p>
            Tables: {CURRENT_YEAR.label}, checked against SARS on {CURRENT_YEAR.checkedOn}.{' '}
            {CURRENT_YEAR.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 && ' · '}
                <a href={s.url} target="_blank" rel="noreferrer" className="text-primary hover:opacity-80">
                  {s.label}
                </a>
              </span>
            ))}
          </p>
          <p>
            Not covered: travel logbook claims and anything else only settled when you file. The s6B medical credit is
            an estimate. Not tax advice.
          </p>
          {employer && (
            <p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear the saved employer profile?')) salary.reset()
                }}
                className={cn('rounded text-primary hover:opacity-80', focusRing)}
              >
                Clear saved profile
              </button>
            </p>
          )}
        </footer>
      </main>
    </div>
  )
}

export default SalaryPage
