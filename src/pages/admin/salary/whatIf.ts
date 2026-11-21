import { payslip, projectYear, syncMedical, type EmployerProfile } from './employer'
import type { TaxYear } from './taxTables'

/*
 * "What if I…?" — scenarios as plain data, so the same interface serves the UI
 * today and an AI agent later. An agent gets WHAT_IF_TOOL as a tool definition,
 * proposes `changes`, and the page (or a Pages Function) runs compareScenario()
 * locally: the model never does the tax maths, it only chooses what to try.
 *
 * Hook point for later: functions/api/admin/salary/ask.ts would call the Claude
 * API with WHAT_IF_TOOL, execute tool calls with compareScenario(), and return
 * the model's explanation. Not built yet — needs an API key and a cost budget.
 */

export type WhatIfChange =
  | { kind: 'increase'; pct: number }
  | { kind: 'package'; monthlyAmount: number }
  | { kind: 'pensionRate'; employeePct: number }
  | { kind: 'additionalPension'; type: 'amount' | 'pct'; value: number }
  | { kind: 'medicalDependants'; adults: number; children: number }
  | { kind: 'medicalRates'; main: number; adult: number; child: number }
  | { kind: 'medicalCost'; totalMonthly: number; employerMonthly: number }
  | { kind: 'bonus'; amount: number }

export const CHANGE_LABELS: Record<WhatIfChange['kind'], string> = {
  increase: 'I get an increase',
  package: 'My package changes (new offer, promotion)',
  pensionRate: 'I change my pension contribution rate',
  additionalPension: 'I change my additional pension contribution',
  medicalDependants: 'I add or remove medical aid dependants',
  medicalRates: 'I switch medical aid plan',
  medicalCost: 'My medical aid cost changes',
  bonus: 'I get a bonus this year',
}

export function applyChanges(p: EmployerProfile, changes: WhatIfChange[]): EmployerProfile {
  let next: EmployerProfile = structuredClone(p)
  for (const c of changes) {
    switch (c.kind) {
      case 'increase':
        next = {
          ...next,
          monthlyAmount: next.monthlyAmount * (1 + c.pct / 100),
          increase: { ...next.increase, pct: 0 },
        }
        break
      case 'package':
        next = {
          ...next,
          monthlyAmount: c.monthlyAmount,
          increase: { ...next.increase, pct: 0 },
        }
        break
      case 'pensionRate':
        next = {
          ...next,
          retirement: {
            ...next.retirement,
            enabled: true,
            employeePct: c.employeePct,
          },
        }
        break
      case 'additionalPension':
        next = {
          ...next,
          retirement: {
            ...next.retirement,
            enabled: true,
            additional: { type: c.type, value: c.value },
          },
        }
        break
      case 'medicalDependants': {
        const adults = Math.max(0, Math.round(c.adults))
        const children = Math.max(0, Math.round(c.children))
        next = {
          ...next,
          medical: { ...next.medical, enabled: true, adults, children, members: 1 + adults + children },
        }
        break
      }
      case 'medicalRates':
        next = {
          ...next,
          medical: {
            ...next.medical,
            enabled: true,
            mode: 'plan',
            rates: { main: c.main, adult: c.adult, child: c.child },
          },
        }
        break
      case 'medicalCost':
        next = {
          ...next,
          medical: {
            ...next.medical,
            enabled: true,
            mode: 'total',
            totalMonthly: c.totalMonthly,
            employerMonthly: c.employerMonthly,
          },
        }
        break
      case 'bonus':
        next = {
          ...next,
          bonus: {
            ...next.bonus,
            kind: c.amount > 0 ? 'fixed' : 'none',
            value: c.amount,
          },
        }
        break
    }
  }
  return syncMedical(next)
}

export interface ScenarioSummary {
  netMonthly: number
  payeMonthly: number
  retirementMonthly: number
  medicalCreditMonthly: number
  annualNet: number
  annualPaye: number
  annualRetirement: number
  effectiveRate: number
}

function summarise(p: EmployerProfile, year: TaxYear): ScenarioSummary {
  // Compare like with like: a flat year (no mid-year increase) for both sides.
  const flat = { ...p, increase: { ...p.increase, pct: 0 } }
  const s = payslip(flat, year)
  const y = projectYear(flat, year)
  return {
    netMonthly: s.net,
    payeMonthly: s.paye,
    retirementMonthly: s.employeeRetirement + s.employer.retirement,
    medicalCreditMonthly: s.medicalCreditMonthly,
    annualNet: y.totals.net,
    annualPaye: y.totals.paye,
    annualRetirement: y.totals.retirementYou + y.totals.retirementEmployer,
    effectiveRate: y.actual.effectiveRate,
  }
}

export function compareScenario(p: EmployerProfile, changes: WhatIfChange[], year: TaxYear) {
  const baseline = summarise(p, year)
  const scenario = summarise(applyChanges(p, changes), year)
  const delta = Object.fromEntries(
    Object.keys(baseline).map((k) => {
      const key = k as keyof ScenarioSummary
      return [
        key,
        key === 'effectiveRate'
          ? Math.round((scenario[key] - baseline[key]) * 1e6) / 1e6
          : Math.round((scenario[key] - baseline[key]) * 100) / 100,
      ]
    }),
  ) as unknown as ScenarioSummary
  return { baseline, scenario, delta, sentences: explain(baseline, delta) }
}

const r0 = (n: number) => `R${Math.round(Math.abs(n)).toLocaleString('en-ZA')}`

/** Plain-English reading of the result — deterministic, no model involved. */
function explain(b: ScenarioSummary, d: ScenarioSummary): string[] {
  const out: string[] = []
  if (Math.abs(d.netMonthly) >= 1)
    out.push(
      `Take-home ${d.netMonthly > 0 ? 'rises' : 'falls'} by ${r0(d.netMonthly)} a month (${r0(d.annualNet)} over the year).`,
    )
  if (Math.abs(d.payeMonthly) >= 1)
    out.push(`PAYE ${d.payeMonthly > 0 ? 'rises' : 'falls'} by ${r0(d.payeMonthly)} a month.`)
  if (Math.abs(d.retirementMonthly) >= 1) {
    out.push(
      `Retirement saving ${d.retirementMonthly > 0 ? 'grows' : 'shrinks'} by ${r0(d.retirementMonthly)} a month (you + employer).`,
    )
    if (d.retirementMonthly > 0 && d.netMonthly < 0) {
      const taxFunded = d.retirementMonthly + d.netMonthly
      if (taxFunded > 0)
        out.push(`Of that extra saving, about ${r0(taxFunded)} a month is effectively paid by lower tax.`)
    }
  }
  if (Math.abs(d.medicalCreditMonthly) >= 1)
    out.push(`Your monthly medical tax credit changes by ${r0(d.medicalCreditMonthly)}.`)
  if (Math.abs(d.effectiveRate) >= 0.001)
    out.push(
      `Effective tax rate moves from ${(b.effectiveRate * 100).toFixed(1)}% to ${((b.effectiveRate + d.effectiveRate) * 100).toFixed(1)}%.`,
    )
  if (out.length === 0) out.push('No meaningful change.')
  return out
}

/** Tool definition for an LLM agent (Anthropic tool-use / JSON schema). */
export const WHAT_IF_TOOL = {
  name: 'salary_what_if',
  description:
    "Run a what-if on the user's saved South African salary package. Returns baseline vs scenario take-home, PAYE, retirement saving and effective tax rate, computed with SARS 2027 tax-year tables. Use it instead of doing tax arithmetic yourself.",
  input_schema: {
    type: 'object',
    properties: {
      changes: {
        type: 'array',
        description: 'Changes applied in order to the saved package.',
        items: {
          oneOf: [
            {
              type: 'object',
              properties: {
                kind: { const: 'increase' },
                pct: { type: 'number' },
              },
              required: ['kind', 'pct'],
            },
            {
              type: 'object',
              properties: {
                kind: { const: 'package' },
                monthlyAmount: { type: 'number' },
              },
              required: ['kind', 'monthlyAmount'],
            },
            {
              type: 'object',
              properties: {
                kind: { const: 'pensionRate' },
                employeePct: { type: 'number' },
              },
              required: ['kind', 'employeePct'],
            },
            {
              type: 'object',
              properties: {
                kind: { const: 'additionalPension' },
                type: { enum: ['amount', 'pct'] },
                value: { type: 'number' },
              },
              required: ['kind', 'type', 'value'],
            },
            {
              type: 'object',
              properties: {
                kind: { const: 'medicalDependants' },
                adults: { type: 'integer', description: 'Adult dependants (not counting the main member)' },
                children: { type: 'integer' },
              },
              required: ['kind', 'adults', 'children'],
            },
            {
              type: 'object',
              description: 'Switch plan: total monthly contribution per person from the scheme table.',
              properties: {
                kind: { const: 'medicalRates' },
                main: { type: 'number' },
                adult: { type: 'number' },
                child: { type: 'number' },
              },
              required: ['kind', 'main', 'adult', 'child'],
            },
            {
              type: 'object',
              properties: {
                kind: { const: 'medicalCost' },
                totalMonthly: { type: 'number' },
                employerMonthly: { type: 'number' },
              },
              required: ['kind', 'totalMonthly', 'employerMonthly'],
            },
            {
              type: 'object',
              properties: {
                kind: { const: 'bonus' },
                amount: { type: 'number' },
              },
              required: ['kind', 'amount'],
            },
          ],
        },
      },
    },
    required: ['changes'],
  },
} as const

/** Markdown context to paste into an AI chat — includes your figures, so share deliberately. */
export function aiContext(
  p: EmployerProfile,
  year: TaxYear,
  changes: WhatIfChange[],
  result: ReturnType<typeof compareScenario>,
) {
  const row = (label: string, k: keyof ScenarioSummary, money = true) => {
    const f = (n: number) => (money ? r0(n) : `${(n * 100).toFixed(1)}%`)
    return `| ${label} | ${f(result.baseline[k])} | ${f(result.scenario[k])} | ${result.delta[k] >= 0 ? '+' : '−'}${f(Math.abs(result.delta[k]))} |`
  }
  return [
    `South African salary what-if (${year.label}; SARS tables). Figures computed by my calculator — please explain, don't recompute.`,
    '',
    `Package: ${p.packageType === 'ctc' ? 'CTC' : 'basic'} ${r0(p.monthlyAmount)}/month, age ${p.age}, pension ${p.retirement.employeePct}% + employer ${p.retirement.employerPct}%, medical aid ${p.medical.enabled ? `${p.medical.members} people (company pays ${r0(p.medical.employerMonthly)} of ${r0(p.medical.totalMonthly)})` : 'none'}.`,
    `Changes: ${changes.map((c) => JSON.stringify(c)).join('; ') || 'none'}`,
    '',
    '| | Now | Scenario | Change |',
    '|---|---|---|---|',
    row('Take-home / month', 'netMonthly'),
    row('PAYE / month', 'payeMonthly'),
    row('Retirement saving / month', 'retirementMonthly'),
    row('Take-home / year', 'annualNet'),
    row('Effective tax rate', 'effectiveRate', false),
    '',
    ...result.sentences.map((s) => `- ${s}`),
  ].join('\n')
}
