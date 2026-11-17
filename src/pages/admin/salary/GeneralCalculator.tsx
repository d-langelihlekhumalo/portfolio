import { useState } from 'react'
import { cn } from '@/utils/cn'
import { computeGeneral, grossForNet, type GeneralInputs } from './engine'
import { TAX_YEARS, taxYearById } from './taxTables'
import { NumberField, RankedBars, SectionTitle, SelectField, Stat, Toggle, focusRing, pct, rand, rand0 } from './ui'

type Mode = 'gross' | 'net'

const LOCAL_KEY = 'salary-general-v1'

interface Saved {
  yearId: string
  age: number
  grossMonthly: number
  targetNet: number
  retirementPct: number
  medicalMembers: number
  medicalMonthly: number
  bonusAnnual: number
  travelMonthly: number
  travel80BusinessUse: boolean
  otherAllowancesMonthly: number
  mode: Mode
}

const DEFAULTS: Saved = {
  yearId: TAX_YEARS[0].id,
  age: 30,
  grossMonthly: 40_000,
  targetNet: 30_000,
  retirementPct: 0,
  medicalMembers: 0,
  medicalMonthly: 0,
  bonusAnnual: 0,
  travelMonthly: 0,
  travel80BusinessUse: false,
  otherAllowancesMonthly: 0,
  mode: 'gross',
}

/** The general calculator keeps its last inputs in this browser only — handy, not sensitive enough for KV. */
function useSaved(): [Saved, (patch: Partial<Saved>) => void] {
  const [s, setS] = useState<Saved>(() => {
    try {
      return { ...DEFAULTS, ...JSON.parse(window.localStorage.getItem(LOCAL_KEY) ?? '{}') }
    } catch {
      return DEFAULTS
    }
  })
  const patch = (p: Partial<Saved>) =>
    setS((cur) => {
      const next = { ...cur, ...p }
      try {
        window.localStorage.setItem(LOCAL_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  return [s, patch]
}

export function GeneralCalculator() {
  const [s, set] = useSaved()
  const year = taxYearById(s.yearId)

  const base: Omit<GeneralInputs, 'grossMonthly'> = {
    year,
    age: s.age,
    retirementPct: s.retirementPct,
    medicalMembers: s.medicalMembers,
    medicalMonthly: s.medicalMembers > 0 ? s.medicalMonthly : 0,
    bonusAnnual: s.bonusAnnual,
    travelMonthly: s.travelMonthly,
    travel80BusinessUse: s.travel80BusinessUse,
    otherAllowancesMonthly: s.otherAllowancesMonthly,
  }
  const gross = s.mode === 'gross' ? s.grossMonthly : grossForNet(base, s.targetNet)
  const r = computeGeneral({ ...base, grossMonthly: gross })
  const a = r.annual
  const keepPer100 = 100 * (1 - a.marginalRate)
  const maxSlice = Math.max(1, ...a.bracketSlices.map((b) => b.incomeInBracket))

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      {/* Inputs */}
      <section aria-label="Inputs" className="space-y-5">
        <div className="grid grid-cols-2 rounded-lg border border-border p-1" role="radiogroup" aria-label="Calculate">
          {(
            [
              ['gross', 'Gross → take-home'],
              ['net', 'Take-home → gross'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={s.mode === m}
              onClick={() => set({ mode: m })}
              className={cn(
                'rounded-md px-2 py-1.5 text-xs',
                s.mode === m ? 'bg-text/[0.08] font-semibold text-text' : 'text-text-secondary hover:text-text',
                focusRing,
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {s.mode === 'gross' ? (
          <NumberField label="Gross salary per month" prefix="R" step={500} value={s.grossMonthly} onChange={(n) => set({ grossMonthly: n })} />
        ) : (
          <NumberField
            label="Take-home you want per month"
            prefix="R"
            step={500}
            value={s.targetNet}
            onChange={(n) => set({ targetNet: n })}
            hint="Solves for the gross salary that pays this, with everything below held fixed."
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Tax year"
            value={s.yearId}
            onChange={(v) => set({ yearId: v })}
            options={TAX_YEARS.map((y) => ({ value: y.id, label: y.label.split(' ')[0] }))}
          />
          <NumberField label="Age" value={s.age} min={16} max={110} onChange={(n) => set({ age: n })} hint="65+ and 75+ get extra rebates." />
        </div>

        <NumberField
          label="Your retirement contribution"
          suffix="%"
          step={0.5}
          max={27.5}
          value={s.retirementPct}
          onChange={(n) => set({ retirementPct: n })}
          hint="Pension, provident or RA through payroll, as % of gross. Reduces taxable income."
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="People on medical aid"
            value={s.medicalMembers}
            max={12}
            onChange={(n) => set({ medicalMembers: Math.round(n) })}
            hint="Including you. 0 = none."
          />
          <NumberField
            label="You pay per month"
            prefix="R"
            step={100}
            value={s.medicalMonthly}
            onChange={(n) => set({ medicalMonthly: n })}
          />
        </div>

        <NumberField label="Bonus / 13th cheque (per year)" prefix="R" step={1000} value={s.bonusAnnual} onChange={(n) => set({ bonusAnnual: n })} />

        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Travel allowance / month" prefix="R" step={500} value={s.travelMonthly} onChange={(n) => set({ travelMonthly: n })} />
          <NumberField
            label="Other allowances / month"
            prefix="R"
            step={100}
            value={s.otherAllowancesMonthly}
            onChange={(n) => set({ otherAllowancesMonthly: n })}
            hint="Cellphone, internet…"
          />
        </div>
        {s.travelMonthly > 0 && (
          <Toggle
            label="At least 80% business travel"
            checked={s.travel80BusinessUse}
            onChange={(b) => set({ travel80BusinessUse: b })}
            hint="Then only 20% of the allowance is taxed through PAYE, instead of 80%."
          />
        )}
      </section>

      {/* Results */}
      <section aria-label="Results" className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {s.mode === 'gross' ? 'Take-home per month' : 'Gross salary needed per month'}
          </p>
          <p className="mt-1 text-5xl font-bold tabular-nums text-text">{rand0(s.mode === 'gross' ? r.month.net : gross)}</p>
          <p className="mt-2 text-sm text-text-secondary">
            {s.mode === 'gross'
              ? `from ${rand0(r.month.gross)} gross, in the ${year.label} tax year`
              : `to take home ${rand0(r.month.net)} a month, in the ${year.label} tax year`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 border-y border-border sm:grid-cols-4 sm:divide-x sm:divide-border sm:gap-x-0 [&>*]:sm:px-5 [&>*:first-child]:sm:pl-0">
          <Stat label="PAYE per month" value={rand0(r.month.paye)} />
          <Stat label="Effective tax rate" value={pct(a.effectiveRate)} note="Tax ÷ remuneration" />
          <Stat label="Marginal rate" value={pct(a.marginalRate, 0)} note={`Keep R${keepPer100.toFixed(0)} of the next R100`} />
          <Stat label="UIF per month" value={rand(r.month.uif)} note={r.month.uif >= year.uif.monthlyCeiling * year.uif.rate ? 'At the ceiling' : undefined} />
        </div>

        <div>
          <SectionTitle>Where your monthly gross goes</SectionTitle>
          <RankedBars
            label="Monthly gross split"
            total={r.month.gross}
            rows={[
              { label: 'Take-home', value: r.month.net, emphasis: true },
              { label: 'PAYE', value: r.month.paye },
              { label: 'Retirement', value: r.month.retirement, note: 'Your contribution — still your money, just not in your pocket' },
              { label: 'Medical aid', value: r.month.medical },
              { label: 'UIF', value: r.month.uif },
            ]}
          />
        </div>

        {s.bonusAnnual > 0 && (
          <div className="rounded-lg border border-border p-4">
            <SectionTitle>Bonus month</SectionTitle>
            <p className="text-sm text-text">
              A <span className="font-semibold">{rand0(s.bonusAnnual)}</span> bonus pays out{' '}
              <span className="font-semibold">{rand0(r.bonusNet)}</span> after{' '}
              <span className="font-semibold">{rand0(r.bonusTax)}</span> extra PAYE (
              {pct(r.bonusTax / s.bonusAnnual)} of it).
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Payroll taxes it as the difference between tax on your annual pay with and without the bonus — so it
              lands at your top marginal rate, sometimes across two brackets.
            </p>
          </div>
        )}

        <div>
          <SectionTitle aside={<span className="text-xs text-text-secondary">Taxable income {rand0(a.taxableIncome)}</span>}>
            Tax by bracket (annual)
          </SectionTitle>
          <ul className="space-y-2">
            {a.bracketSlices.map((b, i) => {
              const active = b.incomeInBracket > 0
              return (
                <li key={b.from} className="grid grid-cols-[3rem_1fr_7rem_6rem] items-center gap-3 text-sm">
                  <span className={cn('font-semibold tabular-nums', active ? 'text-text' : 'text-text-secondary/60')}>
                    {pct(b.rate, 0)}
                  </span>
                  <span className="h-3 rounded-r bg-border/40" title={`${rand0(b.from)} – ${b.to ? rand0(b.to) : 'and above'}`}>
                    <span
                      className="block h-full rounded-r bg-primary"
                      style={{ width: `${(b.incomeInBracket / maxSlice) * 100}%`, opacity: 0.35 + (i / (a.bracketSlices.length - 1)) * 0.65 }}
                    />
                  </span>
                  <span className={cn('text-right tabular-nums', active ? 'text-text' : 'text-text-secondary/60')}>
                    {rand0(b.incomeInBracket)}
                  </span>
                  <span className={cn('text-right tabular-nums', active ? 'text-text' : 'text-text-secondary/60')}>
                    {rand0(b.taxOnSlice)}
                  </span>
                </li>
              )
            })}
            <li className="grid grid-cols-[3rem_1fr_7rem_6rem] gap-3 border-t border-border pt-2 text-xs text-text-secondary">
              <span>Rate</span>
              <span>Income taxed in this bracket</span>
              <span className="text-right">Income</span>
              <span className="text-right">Tax</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-text-secondary">
            Each rate applies only to the slice of income inside its bracket — a raise never costs more than it pays.
          </p>
        </div>

        <div>
          <SectionTitle>The full annual calculation</SectionTitle>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border">
              {[
                ['Remuneration (incl. bonus & taxable allowances)', a.remuneration],
                [`− Retirement deduction (max ${pct(year.retirement.pct)} / ${rand0(year.retirement.cap)})`, -a.retirementDeduction],
                ['= Taxable income', a.taxableIncome],
                ['Tax on taxable income (brackets)', a.taxBeforeRebates],
                [`− Rebates (age ${s.age})`, -a.rebates],
                ['− Medical scheme tax credits', -a.medicalCredits],
                ['= Annual PAYE', a.tax],
              ].map(([label, v]) => (
                <tr key={label as string}>
                  <td className={cn('py-1.5 pr-4', String(label).startsWith('=') ? 'font-semibold text-text' : 'text-text-secondary')}>
                    {label}
                  </td>
                  <td className={cn('py-1.5 text-right tabular-nums', String(label).startsWith('=') ? 'font-semibold text-text' : 'text-text')}>
                    {rand(v as number)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {a.retirementExcess > 0 && (
            <p className="mt-2 text-xs text-text-secondary">
              {rand0(a.retirementExcess)} of retirement contributions exceed this year's limit; SARS carries it forward
              to later years.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
