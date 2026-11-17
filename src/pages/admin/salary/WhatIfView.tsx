import { useMemo, useState } from 'react'
import { Bot, Check, Copy } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { EmployerProfile } from './employer'
import type { TaxYear } from './taxTables'
import {
  CHANGE_LABELS,
  WHAT_IF_TOOL,
  aiContext,
  compareScenario,
  type ScenarioSummary,
  type WhatIfChange,
} from './whatIf'
import { Disclosure, NumberField, SectionTitle, SelectField, focusRing, pct, rand0 } from './ui'

type Kind = WhatIfChange['kind']

interface Draft {
  increase: { on: boolean; pct: number }
  package: { on: boolean; monthlyAmount: number }
  pensionRate: { on: boolean; employeePct: number }
  additionalPension: { on: boolean; type: 'amount' | 'pct'; value: number }
  medicalMembers: { on: boolean; members: number }
  medicalCost: { on: boolean; totalMonthly: number; employerMonthly: number }
  bonus: { on: boolean; amount: number }
}

const draftFrom = (p: EmployerProfile): Draft => ({
  increase: { on: false, pct: 6 },
  package: { on: false, monthlyAmount: Math.round(p.monthlyAmount * 1.15) },
  pensionRate: { on: false, employeePct: p.retirement.employeePct + 2 },
  additionalPension: {
    on: false,
    type: p.retirement.additional.type,
    value: p.retirement.additional.value + (p.retirement.additional.type === 'pct' ? 2 : 1000),
  },
  medicalMembers: {
    on: false,
    members: (p.medical.enabled ? p.medical.members : 0) + 1,
  },
  medicalCost: {
    on: false,
    totalMonthly: p.medical.totalMonthly,
    employerMonthly: p.medical.employerMonthly,
  },
  bonus: { on: false, amount: Math.round(p.monthlyAmount) },
})

function toChanges(d: Draft): WhatIfChange[] {
  const out: WhatIfChange[] = []
  if (d.package.on) out.push({ kind: 'package', monthlyAmount: d.package.monthlyAmount })
  if (d.increase.on) out.push({ kind: 'increase', pct: d.increase.pct })
  if (d.pensionRate.on) out.push({ kind: 'pensionRate', employeePct: d.pensionRate.employeePct })
  if (d.additionalPension.on)
    out.push({
      kind: 'additionalPension',
      type: d.additionalPension.type,
      value: d.additionalPension.value,
    })
  if (d.medicalMembers.on) out.push({ kind: 'medicalMembers', members: d.medicalMembers.members })
  if (d.medicalCost.on)
    out.push({
      kind: 'medicalCost',
      totalMonthly: d.medicalCost.totalMonthly,
      employerMonthly: d.medicalCost.employerMonthly,
    })
  if (d.bonus.on) out.push({ kind: 'bonus', amount: d.bonus.amount })
  return out
}

const PRESETS: {
  label: string
  apply: (d: Draft, p: EmployerProfile) => Draft
}[] = [
  {
    label: 'A 6% increase',
    apply: (d) => ({ ...d, increase: { on: true, pct: 6 } }),
  },
  {
    label: 'Put R1 000 more into pension',
    apply: (d, p) => ({
      ...d,
      additionalPension: {
        on: true,
        type: 'amount',
        value: (p.retirement.additional.type === 'amount' ? p.retirement.additional.value : 0) + 1000,
      },
    }),
  },
  {
    label: 'Add a dependant to medical aid',
    apply: (d, p) => ({
      ...d,
      medicalMembers: {
        on: true,
        members: (p.medical.enabled ? p.medical.members : 0) + 1,
      },
    }),
  },
  {
    label: 'A 13th cheque',
    apply: (d, p) => ({
      ...d,
      bonus: { on: true, amount: Math.round(p.monthlyAmount) },
    }),
  },
  {
    label: 'A job offer 20% higher',
    apply: (d, p) => ({
      ...d,
      package: { on: true, monthlyAmount: Math.round(p.monthlyAmount * 1.2) },
    }),
  },
]

function Row({
  on,
  onToggle,
  label,
  children,
}: {
  on: boolean
  onToggle: (b: boolean) => void
  label: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('rounded-lg border p-3', on ? 'border-primary/60' : 'border-border')}>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => onToggle(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
        {label}
      </label>
      {on && <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>}
    </div>
  )
}

const ROWS: {
  key: keyof ScenarioSummary
  label: string
  money: boolean
  good: 'up' | 'down' | 'neutral'
}[] = [
  { key: 'netMonthly', label: 'Take-home / month', money: true, good: 'up' },
  { key: 'payeMonthly', label: 'PAYE / month', money: true, good: 'down' },
  {
    key: 'retirementMonthly',
    label: 'Into retirement / month (you + company)',
    money: true,
    good: 'up',
  },
  {
    key: 'medicalCreditMonthly',
    label: 'Medical tax credit / month',
    money: true,
    good: 'neutral',
  },
  { key: 'annualNet', label: 'Take-home / year', money: true, good: 'up' },
  { key: 'annualPaye', label: 'PAYE / year', money: true, good: 'down' },
  {
    key: 'effectiveRate',
    label: 'Effective tax rate',
    money: false,
    good: 'down',
  },
]

export function WhatIfView({ p, year }: { p: EmployerProfile; year: TaxYear }) {
  const [draft, setDraft] = useState<Draft>(() => draftFrom(p))
  const [copied, setCopied] = useState<'context' | 'tool' | null>(null)
  const changes = toChanges(draft)
  const result = useMemo(() => compareScenario(p, changes, year), [p, year, JSON.stringify(changes)]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends Kind>(k: K, patch: Partial<Draft[K]>) =>
    setDraft((d) => ({ ...d, [k]: { ...d[k], ...patch } }))
  const fmt = (n: number, money: boolean) => (money ? rand0(n) : pct(n))
  const signed = (n: number, money: boolean) => {
    if (money ? Math.abs(n) < 0.5 : Math.abs(n) < 0.0005) return '—'
    return `${n > 0 ? '+' : '−'}${fmt(Math.abs(n), money)}`
  }

  const copy = async (what: 'context' | 'tool') => {
    const text = what === 'context' ? aiContext(p, year, changes, result) : JSON.stringify(WHAT_IF_TOOL, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
      window.setTimeout(() => setCopied(null), 2000)
    } catch {
      /* clipboard blocked — nothing to do */
    }
  }

  return (
    <div className="grid gap-10 2xl:grid-cols-[minmax(0,26rem)_1fr]">
      <section aria-label="Scenario" className="space-y-3">
        <SectionTitle>What if I…</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((pr) => (
            <button
              key={pr.label}
              type="button"
              onClick={() => setDraft(pr.apply(draftFrom(p), p))}
              className={cn(
                'rounded-full border border-border px-3 py-1 text-xs text-text hover:border-primary hover:text-primary',
                focusRing,
              )}
            >
              {pr.label}
            </button>
          ))}
        </div>
        <Row on={draft.increase.on} onToggle={(on) => set('increase', { on })} label={CHANGE_LABELS.increase}>
          <NumberField
            label="Increase"
            suffix="%"
            step={0.5}
            value={draft.increase.pct}
            onChange={(n) => set('increase', { pct: n })}
          />
        </Row>
        <Row on={draft.package.on} onToggle={(on) => set('package', { on })} label={CHANGE_LABELS.package}>
          <NumberField
            label={`New monthly ${p.packageType === 'ctc' ? 'CTC' : 'basic'}`}
            prefix="R"
            step={500}
            value={draft.package.monthlyAmount}
            onChange={(n) => set('package', { monthlyAmount: n })}
          />
        </Row>
        <Row on={draft.pensionRate.on} onToggle={(on) => set('pensionRate', { on })} label={CHANGE_LABELS.pensionRate}>
          <NumberField
            label="Your fund rate"
            suffix="%"
            step={0.5}
            value={draft.pensionRate.employeePct}
            onChange={(n) => set('pensionRate', { employeePct: n })}
            hint={`Now ${p.retirement.employeePct}%`}
          />
        </Row>
        <Row
          on={draft.additionalPension.on}
          onToggle={(on) => set('additionalPension', { on })}
          label={CHANGE_LABELS.additionalPension}
        >
          <SelectField
            label="As"
            value={draft.additionalPension.type}
            onChange={(v) => set('additionalPension', { type: v })}
            options={[
              { value: 'amount', label: 'Rand amount' },
              { value: 'pct', label: '% of salary' },
            ]}
          />
          <NumberField
            label="Additional contribution"
            prefix={draft.additionalPension.type === 'amount' ? 'R' : undefined}
            suffix={draft.additionalPension.type === 'pct' ? '%' : undefined}
            step={draft.additionalPension.type === 'amount' ? 250 : 0.5}
            value={draft.additionalPension.value}
            onChange={(n) => set('additionalPension', { value: n })}
          />
        </Row>
        <Row
          on={draft.medicalMembers.on}
          onToggle={(on) => set('medicalMembers', { on })}
          label={CHANGE_LABELS.medicalMembers}
        >
          <NumberField
            label="People on the plan"
            min={0}
            max={12}
            value={draft.medicalMembers.members}
            onChange={(n) => set('medicalMembers', { members: Math.round(n) })}
            hint="Credits only — change the cost below too if the premium changes."
          />
        </Row>
        <Row on={draft.medicalCost.on} onToggle={(on) => set('medicalCost', { on })} label={CHANGE_LABELS.medicalCost}>
          <NumberField
            label="Total / month"
            prefix="R"
            step={100}
            value={draft.medicalCost.totalMonthly}
            onChange={(n) => set('medicalCost', { totalMonthly: n })}
          />
          <NumberField
            label="Company pays / month"
            prefix="R"
            step={100}
            value={draft.medicalCost.employerMonthly}
            onChange={(n) => set('medicalCost', { employerMonthly: n })}
          />
        </Row>
        <Row on={draft.bonus.on} onToggle={(on) => set('bonus', { on })} label={CHANGE_LABELS.bonus}>
          <NumberField
            label="Bonus (gross)"
            prefix="R"
            step={1000}
            value={draft.bonus.amount}
            onChange={(n) => set('bonus', { amount: n })}
          />
        </Row>
      </section>

      <section aria-label="Result" className="space-y-6">
        <div>
          <SectionTitle
            aside={
              <span className="text-xs text-text-secondary">
                Full year, {year.label.split(' ')[0]}, no mid-year increase
              </span>
            }
          >
            Now vs scenario
          </SectionTitle>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-secondary">
                <th className="pb-2 text-left font-medium" />
                <th className="pb-2 text-right font-medium">Now</th>
                <th className="pb-2 text-right font-medium">Scenario</th>
                <th className="pb-2 text-right font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROWS.map((r) => (
                <tr key={r.key}>
                  <td className="py-2 pr-3 text-text-secondary">{r.label}</td>
                  <td className="py-2 pl-3 text-right tabular-nums text-text">
                    {fmt(result.baseline[r.key], r.money)}
                  </td>
                  <td className="py-2 pl-3 text-right tabular-nums text-text">
                    {fmt(result.scenario[r.key], r.money)}
                  </td>
                  <td
                    className={cn(
                      'py-2 pl-3 text-right font-semibold tabular-nums',
                      r.key === 'netMonthly' && changes.length ? 'text-primary' : 'text-text',
                    )}
                  >
                    {signed(result.delta[r.key], r.money)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-border p-4" aria-live="polite">
          {changes.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Tick a change on the left, or start from one of the suggestions.
            </p>
          ) : (
            <ul className="space-y-1.5 text-sm text-text">
              {result.sentences.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
        </div>

        <Disclosure title="Ask an AI about this scenario">
          <p className="text-sm text-text-secondary">
            The calculator does the tax maths; an AI is useful for the “should I?” conversation. Copy the scenario with
            its figures into a chat — it includes your package, so only paste it somewhere you're comfortable with.
          </p>
          <button
            type="button"
            onClick={() => copy('context')}
            disabled={changes.length === 0}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary hover:opacity-90 disabled:opacity-40',
              focusRing,
            )}
          >
            {copied === 'context' ? (
              <Check aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Copy aria-hidden="true" className="h-4 w-4" />
            )}
            {copied === 'context' ? 'Copied' : 'Copy scenario for AI'}
          </button>
          <div className="border-t border-border pt-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-text">
              <Bot aria-hidden="true" className="h-4 w-4" /> Plugging in an agent later
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Scenarios are plain data, so an agent can call the same engine as a tool:{' '}
              <code className="font-mono text-xs">{WHAT_IF_TOOL.name}</code> takes a list of changes and returns the
              comparison above. The model decides what to try; the numbers always come from here.
            </p>
            <button
              type="button"
              onClick={() => copy('tool')}
              className={cn(
                'mt-2 inline-flex items-center gap-1.5 rounded text-sm text-primary hover:opacity-80',
                focusRing,
              )}
            >
              {copied === 'tool' ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <Copy aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              {copied === 'tool' ? 'Copied' : 'Copy tool definition (JSON)'}
            </button>
          </div>
        </Disclosure>
      </section>
    </div>
  )
}
