import { useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { payslip, projectYear, type Allowance, type EmployerProfile, type LineItem, type ProjectionMonth } from './employer'
import { TAX_YEARS, taxYearById } from './taxTables'
import { NumberField, RankedBars, SectionTitle, SelectField, Stat, Toggle, Disclosure, focusRing, inputClass, pct, rand, rand0 } from './ui'

const MONTH_OPTIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((label, i) => ({
  value: i + 1,
  label,
}))

const newId = () => Math.random().toString(36).slice(2, 10)

type Update = (fn: (p: EmployerProfile) => EmployerProfile) => void

/* ───────────────────────── Profile editor ───────────────────────── */

function LineItems<T extends LineItem>({
  items,
  onChange,
  make,
  extra,
  addLabel,
}: {
  items: T[]
  onChange: (items: T[]) => void
  make: () => T
  extra?: (item: T, set: (patch: Partial<T>) => void) => ReactNode
  addLabel: string
}) {
  return (
    <div className="space-y-2">
      {items.map((it) => {
        const set = (patch: Partial<T>) => onChange(items.map((x) => (x.id === it.id ? { ...x, ...patch } : x)))
        return (
          <div key={it.id} className="grid grid-cols-[1fr_7rem_auto] items-end gap-2">
            <input
              aria-label="Name"
              value={it.name}
              onChange={(e) => set({ name: e.target.value } as Partial<T>)}
              className={inputClass}
            />
            <input
              aria-label={`${it.name} per month`}
              type="number"
              inputMode="decimal"
              min={0}
              value={it.monthly}
              onChange={(e) => set({ monthly: parseFloat(e.target.value) || 0 } as Partial<T>)}
              className={inputClass}
            />
            <button
              type="button"
              aria-label={`Remove ${it.name}`}
              onClick={() => onChange(items.filter((x) => x.id !== it.id))}
              className={cn('rounded p-2 text-text-secondary hover:text-primary', focusRing)}
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
            {extra && <div className="col-span-3 -mt-1">{extra(it, set)}</div>}
          </div>
        )
      })}
      <button
        type="button"
        onClick={() => onChange([...items, make()])}
        className={cn('inline-flex items-center gap-1 rounded text-xs text-primary hover:opacity-80', focusRing)}
      >
        <Plus aria-hidden="true" className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  )
}

function ProfileEditor({ p, update }: { p: EmployerProfile; update: Update }) {
  const set = (patch: Partial<EmployerProfile>) => update((cur) => ({ ...cur, ...patch }))
  return (
    <div className="space-y-3">
      <Disclosure title="Package" defaultOpen>
        <SelectField
          label="How the package is quoted"
          value={p.packageType}
          onChange={(v) => set({ packageType: v })}
          options={[
            { value: 'ctc', label: 'Cost-to-company (CTC)' },
            { value: 'basic', label: 'Basic salary + benefits on top' },
          ]}
        />
        <NumberField
          label={p.packageType === 'ctc' ? 'Monthly CTC' : 'Monthly basic salary'}
          prefix="R"
          step={500}
          value={p.monthlyAmount}
          onChange={(n) => set({ monthlyAmount: n })}
        />
        <NumberField label="Age" value={p.age} min={16} max={110} onChange={(n) => set({ age: n })} />
        {p.packageType === 'ctc' && (
          <Toggle
            label="Employer's 1% UIF comes out of the CTC"
            checked={p.employerUifInPackage}
            onChange={(b) => set({ employerUifInPackage: b })}
          />
        )}
      </Disclosure>

      <Disclosure title="Retirement fund">
        <Toggle
          label="I belong to a retirement fund through work"
          checked={p.retirement.enabled}
          onChange={(b) => set({ retirement: { ...p.retirement, enabled: b } })}
        />
        {p.retirement.enabled && (
          <>
            <Field2>
              <NumberField
                label="You contribute"
                suffix="%"
                step={0.5}
                value={p.retirement.employeePct}
                onChange={(n) => set({ retirement: { ...p.retirement, employeePct: n } })}
              />
              <NumberField
                label="Employer contributes"
                suffix="%"
                step={0.5}
                value={p.retirement.employerPct}
                onChange={(n) => set({ retirement: { ...p.retirement, employerPct: n } })}
              />
            </Field2>
            <SelectField
              label="Percentages are of"
              value={p.retirement.base}
              onChange={(v) => set({ retirement: { ...p.retirement, base: v } })}
              options={[
                { value: 'basic', label: 'Basic salary' },
                { value: 'package', label: 'The whole package (CTC)' },
              ]}
            />
            <p className="text-[11px] leading-snug text-text-secondary">
              The employer's share is a taxable fringe benefit, but it also counts as your contribution for the 27.5%
              deduction — so it nets out for tax unless you're over the limit.
            </p>
          </>
        )}
      </Disclosure>

      <Disclosure title="Medical aid">
        <Toggle
          label="I'm on medical aid"
          checked={p.medical.enabled}
          onChange={(b) => set({ medical: { ...p.medical, enabled: b } })}
        />
        {p.medical.enabled && (
          <>
            <Field2>
              <NumberField
                label="Total contribution / month"
                prefix="R"
                step={100}
                value={p.medical.totalMonthly}
                onChange={(n) => set({ medical: { ...p.medical, totalMonthly: n } })}
              />
              <NumberField
                label="Employer pays / month"
                prefix="R"
                step={100}
                value={p.medical.employerMonthly}
                onChange={(n) => set({ medical: { ...p.medical, employerMonthly: n } })}
              />
            </Field2>
            <NumberField
              label="People on the plan (incl. you)"
              value={p.medical.members}
              min={1}
              max={12}
              onChange={(n) => set({ medical: { ...p.medical, members: Math.max(1, Math.round(n)) } })}
            />
          </>
        )}
      </Disclosure>

      <Disclosure title="Allowances">
        <LineItems<Allowance>
          items={p.allowances}
          onChange={(allowances) => set({ allowances })}
          make={() => ({ id: newId(), name: 'Cellphone allowance', monthly: 0, kind: 'taxable' })}
          addLabel="Add allowance"
          extra={(a, setA) => (
            <select
              aria-label={`${a.name} type`}
              value={a.kind}
              onChange={(e) => setA({ kind: e.target.value as Allowance['kind'] })}
              className={cn(inputClass, 'py-1 text-xs')}
            >
              <option value="taxable">Fully taxable</option>
              <option value="travel">Travel allowance (80% or 20% taxed)</option>
            </select>
          )}
        />
        {p.allowances.some((a) => a.kind === 'travel') && (
          <Toggle
            label="At least 80% business travel"
            checked={p.travel80BusinessUse}
            onChange={(b) => set({ travel80BusinessUse: b })}
          />
        )}
      </Disclosure>

      <Disclosure title="Other employer-paid cover">
        <NumberField
          label="Employer-paid risk cover outside the fund / month"
          prefix="R"
          step={50}
          value={p.employerRiskMonthly}
          onChange={(n) => set({ employerRiskMonthly: n })}
          hint="Group life, disability or funeral cover the employer pays for you — a taxable fringe benefit."
        />
      </Disclosure>

      <Disclosure title="Payroll deductions (after tax)">
        <LineItems<LineItem>
          items={p.deductions}
          onChange={(deductions) => set({ deductions })}
          make={() => ({ id: newId(), name: 'Gap cover', monthly: 0 })}
          addLabel="Add deduction"
        />
      </Disclosure>

      <Disclosure title="Bonus and increases">
        <SelectField
          label="Bonus"
          value={p.bonus.kind}
          onChange={(v) => set({ bonus: { ...p.bonus, kind: v } })}
          options={[
            { value: 'none', label: 'None' },
            { value: 'thirteenth', label: '13th cheque (one month’s basic)' },
            { value: 'percentOfAnnual', label: '% of annual basic' },
            { value: 'fixed', label: 'Fixed amount' },
          ]}
        />
        {(p.bonus.kind === 'percentOfAnnual' || p.bonus.kind === 'fixed') && (
          <NumberField
            label={p.bonus.kind === 'fixed' ? 'Bonus amount' : 'Bonus % of annual basic'}
            prefix={p.bonus.kind === 'fixed' ? 'R' : undefined}
            suffix={p.bonus.kind === 'percentOfAnnual' ? '%' : undefined}
            value={p.bonus.value}
            onChange={(n) => set({ bonus: { ...p.bonus, value: n } })}
          />
        )}
        {p.bonus.kind !== 'none' && (
          <SelectField
            label="Paid in"
            value={p.bonus.month}
            onChange={(v) => set({ bonus: { ...p.bonus, month: v } })}
            options={MONTH_OPTIONS}
          />
        )}
        <Field2>
          <NumberField
            label="Annual increase"
            suffix="%"
            step={0.5}
            value={p.increase.pct}
            onChange={(n) => set({ increase: { ...p.increase, pct: n } })}
          />
          <SelectField
            label="From"
            value={p.increase.month}
            onChange={(v) => set({ increase: { ...p.increase, month: v } })}
            options={MONTH_OPTIONS}
          />
        </Field2>
      </Disclosure>
    </div>
  )
}

function Field2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

/* ───────────────────────── Results ───────────────────────── */

function MonthColumns({ months, selected, onSelect }: { months: ProjectionMonth[]; selected: number; onSelect: (m: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...months.map((m) => m.net))
  const shown = months.find((m) => m.month === (hover ?? selected))
  return (
    <div>
      <ul className="relative flex h-40 items-end gap-1.5" aria-label="Take-home by month">
        {months.map((m) => {
          const active = m.month === selected
          return (
            <li key={m.month} className="flex h-full flex-1">
            <button
              type="button"
              onClick={() => onSelect(m.month)}
              onMouseEnter={() => setHover(m.month)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(m.month)}
              onBlur={() => setHover(null)}
              aria-label={`${m.label}: take-home ${rand(m.net)}${m.bonusGross ? `, including bonus ${rand(m.bonusGross)}` : ''}`}
              aria-pressed={active}
              className={cn('group flex h-full flex-1 flex-col justify-end rounded-t', focusRing)}
            >
              <span
                className={cn(
                  'block w-full rounded-t-[4px]',
                  active ? 'bg-primary' : 'bg-text-secondary/35 group-hover:bg-text-secondary/55',
                )}
                style={{ height: `${(m.net / max) * 100}%` }}
              />
            </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-1.5 flex gap-1.5 border-t border-border pt-1.5">
        {months.map((m) => (
          <span key={m.month} className={cn('flex-1 text-center text-[11px]', m.month === selected ? 'font-semibold text-text' : 'text-text-secondary')}>
            {m.label}
          </span>
        ))}
      </div>
      {shown && (
        <p className="mt-2 text-xs text-text-secondary" aria-live="polite">
          <span className="font-semibold text-text">{shown.label}</span> · take-home {rand(shown.net)}
          {shown.bonusGross > 0 && <> · includes {rand0(shown.bonusGross)} bonus less {rand0(shown.bonusTax)} tax</>}
        </p>
      )}
    </div>
  )
}

function PayslipTable({ m }: { m: ProjectionMonth }) {
  const s = m.slip
  // Labels repeat across sections ("Retirement fund" is both a deduction and an
  // employer contribution), so key rows by position in this fixed layout.
  let rowIndex = 0
  const row = (label: string, v: number, strong = false, indent = false) => (
    <tr key={`row-${rowIndex++}`}>
      <td className={cn('py-1.5 pr-4', strong ? 'font-semibold text-text' : 'text-text-secondary', indent && 'pl-3')}>{label}</td>
      <td className={cn('py-1.5 text-right tabular-nums', strong ? 'font-semibold text-text' : 'text-text')}>{rand(v)}</td>
    </tr>
  )
  return (
    <table className="w-full text-sm">
      <tbody className="divide-y divide-border">
        <tr>
          <th colSpan={2} className="pt-1 pb-1.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Earnings
          </th>
        </tr>
        {row('Basic salary', s.basic, false, true)}
        {s.allowances.map((a) => row(a.name, a.amount, false, true))}
        {m.bonusGross > 0 && row('Bonus', m.bonusGross, false, true)}
        {row('Gross pay', s.grossCash + m.bonusGross, true)}
        <tr>
          <th colSpan={2} className="pt-4 pb-1.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Deductions
          </th>
        </tr>
        {row('PAYE', s.paye + m.bonusTax, false, true)}
        {row('UIF', s.uif, false, true)}
        {s.employeeRetirement > 0 && row('Retirement fund', s.employeeRetirement, false, true)}
        {s.employeeMedical > 0 && row('Medical aid (your share)', s.employeeMedical, false, true)}
        {s.otherDeductions.map((d) => row(d.name, d.amount, false, true))}
        {row('Net pay', m.net, true)}
        <tr>
          <th colSpan={2} className="pt-4 pb-1.5 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Paid by your employer (not in your net pay)
          </th>
        </tr>
        {s.employer.retirement > 0 && row('Retirement fund', s.employer.retirement, false, true)}
        {s.employer.medical > 0 && row('Medical aid', s.employer.medical, false, true)}
        {s.employer.risk > 0 && row('Risk cover', s.employer.risk, false, true)}
        {row('UIF (employer 1%)', s.employer.uif, false, true)}
      </tbody>
    </table>
  )
}

export function EmployerCalculator({ profile: p, update }: { profile: EmployerProfile; update: Update }) {
  const [yearId, setYearId] = useState(TAX_YEARS[0].id)
  const [selected, setSelected] = useState(() => new Date().getMonth() + 1)
  const [extraRetirement, setExtraRetirement] = useState(0)
  const year = taxYearById(yearId)

  if (!p.monthlyAmount) {
    return (
      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <ProfileEditor p={p} update={update} />
        <div className="rounded-lg border border-dashed border-border p-8 text-sm text-text-secondary">
          <p className="font-semibold text-text">Set up your package</p>
          <p className="mt-2">
            Enter your monthly {p.packageType === 'ctc' ? 'cost-to-company' : 'basic salary'} and the rest of your package
            on the left. It's saved to your browser and, when cross-device sync is enabled, to your private admin
            storage — never to the code.
          </p>
        </div>
      </div>
    )
  }

  const proj = projectYear(p, year)
  const month = proj.months.find((m) => m.month === selected) ?? proj.months[0]
  const regular = payslip(p, year)
  const lever = extraRetirement
    ? payslip({ ...p, retirement: { ...p.retirement, enabled: true, employeePct: p.retirement.employeePct + extraRetirement } }, year)
    : null

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <ProfileEditor p={p} update={update} />

      <section aria-label="Results" className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Take-home in a normal month</p>
            <p className="mt-1 text-5xl font-bold tabular-nums text-text">{rand0(regular.net)}</p>
            <p className="mt-2 text-sm text-text-secondary">
              from {rand0(p.monthlyAmount)} {p.packageType === 'ctc' ? 'CTC' : 'basic'} · {pct(regular.net / p.monthlyAmount, 0)} of
              the package
            </p>
          </div>
          <div className="w-40">
            <SelectField
              label="Tax year"
              value={yearId}
              onChange={setYearId}
              options={TAX_YEARS.map((y) => ({ value: y.id, label: y.label.split(' ')[0] }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 border-y border-border sm:grid-cols-4 sm:divide-x sm:divide-border sm:gap-x-0 [&>*]:sm:px-5 [&>*:first-child]:sm:pl-0">
          <Stat label="Take-home this tax year" value={rand0(proj.totals.net)} />
          <Stat label="PAYE this tax year" value={rand0(proj.totals.paye)} />
          <Stat label="Effective tax rate" value={pct(proj.actual.effectiveRate)} />
          <Stat
            label="At assessment, roughly"
            value={proj.assessmentDifference >= 0 ? `+${rand0(proj.assessmentDifference)}` : `−${rand0(-proj.assessmentDifference)}`}
            note={proj.assessmentDifference >= 0 ? 'Refund (PAYE over-withheld)' : 'Owing (PAYE under-withheld)'}
          />
        </div>

        <div>
          <SectionTitle aside={<span className="text-xs text-text-secondary">Click a month for its payslip</span>}>
            Take-home, March → February
          </SectionTitle>
          <MonthColumns months={proj.months} selected={month.month} onSelect={setSelected} />
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <SectionTitle>{month.label} payslip (estimate)</SectionTitle>
            <PayslipTable m={month} />
          </div>
          <div className="space-y-8">
            <div>
              <SectionTitle>Where the package goes each month</SectionTitle>
              <RankedBars
                label="Package split"
                total={regular.packageCheck}
                rows={[
                  { label: 'Take-home', value: regular.net, emphasis: true },
                  { label: 'PAYE', value: regular.paye },
                  { label: 'Retirement (you)', value: regular.employeeRetirement },
                  { label: 'Retirement (employer)', value: regular.employer.retirement },
                  { label: 'Medical aid', value: regular.employeeMedical + regular.employer.medical },
                  {
                    label: 'Other',
                    value:
                      regular.uif +
                      regular.otherDeductions.reduce((s, d) => s + d.amount, 0) +
                      regular.employer.risk +
                      (p.employerUifInPackage && p.packageType === 'ctc' ? regular.employer.uif : 0),
                    note: 'UIF, risk cover and other payroll deductions',
                  },
                ]}
              />
            </div>

            <div className="rounded-lg border border-border p-4">
              <SectionTitle>Lever: contribute more to retirement</SectionTitle>
              <NumberField
                label="Extra contribution"
                suffix="%"
                step={0.5}
                max={20}
                value={extraRetirement}
                onChange={setExtraRetirement}
                hint={`On top of your current ${p.retirement.enabled ? p.retirement.employeePct : 0}%.`}
              />
              {lever && (
                <p className="mt-3 text-sm text-text">
                  Saves <span className="font-semibold">{rand0(lever.employeeRetirement - regular.employeeRetirement)}</span> more a
                  month for retirement, but take-home only drops by{' '}
                  <span className="font-semibold">{rand0(regular.net - lever.net)}</span> — SARS funds{' '}
                  <span className="font-semibold">{rand0(regular.paye - lever.paye)}</span> of it through lower PAYE.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
