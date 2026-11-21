import { useCallback, useState, type ReactNode } from 'react'
import { NavLink, useSearchParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  payslip,
  projectYear,
  type Allowance,
  type BenefitNote,
  type EmployerProfile,
  type LineItem,
  type ProjectionMonth,
} from './employer'
import { TAX_YEARS, taxYearById } from './taxTables'
import { BENEFIT_BY_ID, riskInfo } from './benefitInfo'
import { BenefitDrawer } from './BenefitDrawer'
import { BenefitsView } from './BenefitsView'
import { MedicalView } from './MedicalView'
import { WhatIfView } from './WhatIfView'
import { Payslip } from './Payslip'
import { figuresFor } from './drawerFigures'
import {
  NumberField,
  RankedBars,
  SectionTitle,
  SelectField,
  Stat,
  Toggle,
  Disclosure,
  focusRing,
  inputClass,
  pct,
  rand,
  rand0,
} from './ui'

const MONTH_OPTIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
  (label, i) => ({
    value: i + 1,
    label,
  }),
)

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

function MedicalPlanFields({ p, set }: { p: EmployerProfile; set: (patch: Partial<EmployerProfile>) => void }) {
  const m = p.medical
  const med = (patch: Partial<EmployerProfile['medical']>) => set({ medical: { ...m, ...patch } })
  const yourShare = Math.max(0, m.totalMonthly - m.employerMonthly)
  return (
    <>
      <label className="block">
        <span className="block text-xs font-medium text-text-secondary">Plan</span>
        <input
          className={cn(inputClass, 'mt-1 normal-nums')}
          value={m.planName}
          placeholder="e.g. your scheme and plan"
          onChange={(e) => med({ planName: e.target.value })}
        />
      </label>
      <div>
        <p className="text-xs font-medium text-text-secondary">Total contribution per person / month</p>
        <div className="mt-1 grid grid-cols-3 gap-2">
          <NumberField
            label="Main"
            prefix="R"
            step={50}
            value={m.rates.main}
            onChange={(n) => med({ rates: { ...m.rates, main: n } })}
          />
          <NumberField
            label="Adult"
            prefix="R"
            step={50}
            value={m.rates.adult}
            onChange={(n) => med({ rates: { ...m.rates, adult: n } })}
          />
          <NumberField
            label="Child"
            prefix="R"
            step={50}
            value={m.rates.child}
            onChange={(n) => med({ rates: { ...m.rates, child: n } })}
          />
        </div>
        <p className="mt-1 text-[11px] leading-snug text-text-secondary">
          From the scheme's contribution table — use the total column (it includes any savings account portion).
        </p>
      </div>
      <Field2>
        <NumberField
          label="Adult dependants"
          min={0}
          max={6}
          value={m.adults}
          onChange={(n) => med({ adults: Math.max(0, Math.round(n)) })}
          hint="Spouse, partner, parent"
        />
        <NumberField
          label="Child dependants"
          min={0}
          max={10}
          value={m.children}
          onChange={(n) => med({ children: Math.max(0, Math.round(n)) })}
          hint={m.maxChargedChildren > 0 ? `Charged for up to ${m.maxChargedChildren}` : undefined}
        />
      </Field2>
      <SelectField
        label="The company pays"
        value={m.employerCovers}
        onChange={(v) => med({ employerCovers: v })}
        options={[
          { value: 'main', label: 'The main member in full' },
          { value: 'amount', label: 'A fixed amount' },
        ]}
      />
      {m.employerCovers === 'amount' && (
        <NumberField
          label="Company pays / month"
          prefix="R"
          step={100}
          value={m.employerAmount}
          onChange={(n) => med({ employerAmount: n })}
        />
      )}
      <p className="rounded-lg bg-text/[0.04] px-3 py-2 text-xs text-text-secondary">
        Scheme total <span className="font-semibold text-text tabular-nums">{rand0(m.totalMonthly)}</span> · company{' '}
        <span className="font-semibold text-text tabular-nums">{rand0(m.employerMonthly)}</span> · from your pay{' '}
        <span className="font-semibold text-text tabular-nums">{rand0(yourShare)}</span> · {m.members}{' '}
        {m.members === 1 ? 'person' : 'people'}
      </p>
      <Disclosure title="Savings account portion (optional)">
        <div className="grid grid-cols-3 gap-2">
          <NumberField
            label="Main"
            prefix="R"
            step={10}
            value={m.msa.main}
            onChange={(n) => med({ msa: { ...m.msa, main: n } })}
          />
          <NumberField
            label="Adult"
            prefix="R"
            step={10}
            value={m.msa.adult}
            onChange={(n) => med({ msa: { ...m.msa, adult: n } })}
          />
          <NumberField
            label="Child"
            prefix="R"
            step={10}
            value={m.msa.child}
            onChange={(n) => med({ msa: { ...m.msa, child: n } })}
          />
        </div>
        <NumberField
          label="Most children charged"
          min={0}
          max={10}
          value={m.maxChargedChildren}
          onChange={(n) => med({ maxChargedChildren: Math.max(0, Math.round(n)) })}
          hint="0 = every child is charged. Check your scheme's rules."
        />
      </Disclosure>
    </>
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
            <Field2>
              <SelectField
                label="Additional contribution as"
                value={p.retirement.additional.type}
                onChange={(v) =>
                  set({
                    retirement: {
                      ...p.retirement,
                      additional: { ...p.retirement.additional, type: v },
                    },
                  })
                }
                options={[
                  { value: 'amount', label: 'Rand amount' },
                  { value: 'pct', label: '% of salary' },
                ]}
              />
              <NumberField
                label={p.retirement.additional.type === 'amount' ? 'Additional / month' : 'Additional %'}
                prefix={p.retirement.additional.type === 'amount' ? 'R' : undefined}
                suffix={p.retirement.additional.type === 'pct' ? '%' : undefined}
                step={p.retirement.additional.type === 'amount' ? 250 : 0.5}
                value={p.retirement.additional.value}
                onChange={(n) =>
                  set({
                    retirement: {
                      ...p.retirement,
                      additional: { ...p.retirement.additional, value: n },
                    },
                  })
                }
              />
            </Field2>
            <p className="-mt-2 text-[11px] leading-snug text-text-secondary">
              “Additional Staff Pension Contr” on the payslip.
            </p>
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
            <SelectField
              label="Enter it as"
              value={p.medical.mode}
              onChange={(v) => set({ medical: { ...p.medical, mode: v } })}
              options={[
                { value: 'plan', label: 'Plan rates per person' },
                { value: 'total', label: 'Monthly totals' },
              ]}
            />
            {p.medical.mode === 'plan' ? (
              <MedicalPlanFields p={p} set={set} />
            ) : (
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
          </>
        )}
      </Disclosure>

      <Disclosure title="Allowances">
        <LineItems<Allowance>
          items={p.allowances}
          onChange={(allowances) => set({ allowances })}
          make={() => ({
            id: newId(),
            name: 'Cellphone allowance',
            monthly: 0,
            kind: 'taxable',
          })}
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

      <Disclosure title="Company-paid cover">
        <LineItems<LineItem>
          items={p.riskBenefits}
          onChange={(riskBenefits) => set({ riskBenefits })}
          make={() => ({ id: newId(), name: 'Income protection', monthly: 0 })}
          addLabel="Add cover"
        />
        <p className="text-[11px] leading-snug text-text-secondary">
          Monthly premium the company pays for each. Each is also taxed as a fringe benefit.
        </p>
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

function MonthColumns({
  months,
  selected,
  onSelect,
}: {
  months: ProjectionMonth[]
  selected: number
  onSelect: (m: number) => void
}) {
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
          <span
            key={m.month}
            className={cn(
              'flex-1 text-center text-[11px]',
              m.month === selected ? 'font-semibold text-text' : 'text-text-secondary',
            )}
          >
            {m.label}
          </span>
        ))}
      </div>
      {shown && (
        <p className="mt-2 text-xs text-text-secondary" aria-live="polite">
          <span className="font-semibold text-text">{shown.label}</span> · take-home {rand(shown.net)}
          {shown.bonusGross > 0 && (
            <>
              {' '}
              · includes {rand0(shown.bonusGross)} bonus less {rand0(shown.bonusTax)} tax
            </>
          )}
        </p>
      )}
    </div>
  )
}

const VIEWS = [
  { id: '', label: 'Overview' },
  { id: 'benefits', label: 'Company benefits' },
  { id: 'medical', label: 'Medical aid' },
  { id: 'what-if', label: 'What if I…' },
] as const

export function EmployerCalculator({
  profile: p,
  update,
  view = '',
}: {
  profile: EmployerProfile
  update: Update
  view?: string
}) {
  const [yearId, setYearId] = useState(TAX_YEARS[0].id)
  const [selected, setSelected] = useState(() => new Date().getMonth() + 1)
  const [params, setParams] = useSearchParams()
  const year = taxYearById(yearId)
  const about = params.get('about')

  const open = useCallback(
    (id: string) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('about', id)
          return next
        },
        { replace: false },
      ),
    [setParams],
  )
  const close = useCallback(
    () =>
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('about')
        return next
      }),
    [setParams],
  )

  if (!p.monthlyAmount) {
    return (
      <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
        <ProfileEditor p={p} update={update} />
        <div className="rounded-lg border border-dashed border-border p-8 text-sm text-text-secondary">
          <p className="font-semibold text-text">Set up your package</p>
          <p className="mt-2">
            Enter your monthly {p.packageType === 'ctc' ? 'cost-to-company' : 'basic salary'} and the rest of your
            package on the left — retirement fund, medical aid and the cover the company pays for, as they appear on
            your payslip. It's saved to your browser and, when cross-device sync is enabled, to your private admin
            storage — never to the code.
          </p>
        </div>
      </div>
    )
  }

  const proj = projectYear(p, year)
  const month = proj.months.find((m) => m.month === selected) ?? proj.months[0]
  const regular = payslip(p, year)
  const info = about
    ? (BENEFIT_BY_ID[about] ??
      (p.riskBenefits.some((r) => r.id === about)
        ? riskInfo(about, p.riskBenefits.find((r) => r.id === about)!.name)
        : null))
    : null
  const emptyNote: BenefitNote = { terms: '', link: '' }

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <ProfileEditor p={p} update={update} />

      <section aria-label="Results" className="min-w-0 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <nav aria-label="Employer views" className="flex flex-wrap gap-x-5 gap-y-2 border-b border-border">
            {VIEWS.map((v) => (
              <NavLink
                key={v.id}
                to={v.id ? `/admin/salary/employer/${v.id}` : '/admin/salary/employer'}
                end
                className={({ isActive }) =>
                  cn(
                    '-mb-px border-b-2 pb-2 text-sm',
                    isActive
                      ? 'border-primary font-semibold text-text'
                      : 'border-transparent text-text-secondary hover:text-text',
                    focusRing,
                  )
                }
              >
                {v.label}
              </NavLink>
            ))}
          </nav>
          <div className="w-36">
            <SelectField
              label="Tax year"
              value={yearId}
              onChange={setYearId}
              options={TAX_YEARS.map((y) => ({
                value: y.id,
                label: y.label.split(' ')[0],
              }))}
            />
          </div>
        </div>

        {view === 'benefits' && <BenefitsView p={p} year={year} onOpen={open} />}
        {view === 'medical' && <MedicalView p={p} year={year} update={update} onOpen={open} />}
        {view === 'what-if' && <WhatIfView p={p} year={year} />}

        {view === '' && (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Take-home in a normal month
              </p>
              <p className="mt-1 text-5xl font-bold tabular-nums text-text">{rand0(regular.net)}</p>
              <p className="mt-2 text-sm text-text-secondary">
                from {rand0(p.monthlyAmount)} {p.packageType === 'ctc' ? 'CTC' : 'basic'} ·{' '}
                {pct(regular.net / p.monthlyAmount, 0)} of the package
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 border-y border-border sm:grid-cols-4 sm:divide-x sm:divide-border sm:gap-x-0 [&>*]:sm:px-5 [&>*:first-child]:sm:pl-0">
              <Stat label="Take-home this tax year" value={rand0(proj.totals.net)} />
              <Stat label="PAYE this tax year" value={rand0(proj.totals.paye)} />
              <Stat label="Effective tax rate" value={pct(proj.actual.effectiveRate)} />
              <Stat
                label="At assessment, roughly"
                value={
                  Math.abs(proj.assessmentDifference) < 1
                    ? rand0(0)
                    : proj.assessmentDifference > 0
                      ? `+${rand0(proj.assessmentDifference)}`
                      : `−${rand0(-proj.assessmentDifference)}`
                }
                note={
                  Math.abs(proj.assessmentDifference) < 1
                    ? 'PAYE matches the year’s tax'
                    : proj.assessmentDifference > 0
                      ? 'Refund (PAYE over-withheld)'
                      : 'Owing (PAYE under-withheld)'
                }
              />
            </div>

            <div>
              <SectionTitle aside={<span className="text-xs text-text-secondary">Click a month for its payslip</span>}>
                Take-home, March → February
              </SectionTitle>
              <MonthColumns months={proj.months} selected={month.month} onSelect={setSelected} />
            </div>

            <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div>
                <SectionTitle
                  aside={<span className="text-xs text-text-secondary">Click a line to see what it means</span>}
                >
                  {month.label} payslip (estimate)
                </SectionTitle>
                <Payslip m={month} p={p} onOpen={open} />
              </div>
              <div>
                <SectionTitle>Where the package goes each month</SectionTitle>
                <RankedBars
                  label="Package split"
                  total={regular.packageCheck}
                  rows={[
                    { label: 'Take-home', value: regular.net, emphasis: true },
                    { label: 'PAYE', value: regular.paye },
                    {
                      label: 'Retirement (you)',
                      value: regular.employeeRetirement,
                    },
                    {
                      label: 'Retirement (company)',
                      value: regular.employer.retirement,
                    },
                    {
                      label: 'Medical aid',
                      value: regular.employeeMedical + regular.employer.medical,
                    },
                    {
                      label: 'Company cover',
                      value: regular.employer.risk,
                      note: 'Funeral, death & disability',
                    },
                    {
                      label: 'Other',
                      value:
                        regular.uif +
                        regular.otherDeductions.reduce((s, d) => s + d.amount, 0) +
                        (p.employerUifInPackage && p.packageType === 'ctc' ? regular.employer.uif : 0),
                      note: 'UIF and other payroll deductions',
                    },
                  ]}
                />
              </div>
            </div>
          </>
        )}
      </section>

      {info && (
        <BenefitDrawer
          key={info.id}
          info={info}
          figures={figuresFor(info.id, p, year)}
          note={p.notes[info.id] ?? emptyNote}
          onNote={(n) => update((cur) => ({ ...cur, notes: { ...cur.notes, [info.id]: n } }))}
          onClose={close}
        />
      )}
    </div>
  )
}
