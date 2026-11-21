import { Info } from 'lucide-react'
import { cn } from '@/utils/cn'
import { fringeLabel } from './benefitInfo'
import type { EmployerProfile, ProjectionMonth } from './employer'
import { focusRing, rand } from './ui'

interface Line {
  label: string
  amount: number
  /** Benefit id — makes the line open its drawer. */
  about?: string
  tag?: string
  muted?: boolean
}

function Lines({ title, lines, onOpen }: { title: string; lines: Line[]; onOpen: (id: string) => void }) {
  return (
    <div>
      <h4 className="border-b border-border pb-1.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {title}
      </h4>
      <ul className="divide-y divide-border">
        {lines.map((l, i) => {
          const content = (
            <>
              <span className={cn('min-w-0 text-left', l.muted ? 'text-text-secondary' : 'text-text')}>
                {l.label}
                {l.tag && <span className="ml-1.5 whitespace-nowrap text-[11px] text-text-secondary">· {l.tag}</span>}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-text">
                {rand(l.amount)}
                {l.about ? (
                  <Info aria-hidden="true" className="h-3.5 w-3.5 text-text-secondary group-hover:text-primary" />
                ) : (
                  <span className="w-3.5" />
                )}
              </span>
            </>
          )
          return (
            // Labels can repeat (custom lines), so key by position in this fixed list.
            <li key={`${title}-${i}`}>
              {l.about ? (
                <button
                  type="button"
                  onClick={() => onOpen(l.about!)}
                  aria-label={`${l.label}, ${rand(l.amount)} — what this means`}
                  className={cn(
                    'group flex w-full items-baseline justify-between gap-3 rounded py-1.5 text-sm hover:text-primary',
                    focusRing,
                  )}
                >
                  {content}
                </button>
              ) : (
                <div className="flex items-baseline justify-between gap-3 py-1.5 text-sm">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * A month's payslip laid out like the real one: earnings, deductions, company
 * benefits (contributions + their fringe-benefit lines). Every explained line
 * opens a drawer.
 */
export function Payslip({ m, p, onOpen }: { m: ProjectionMonth; p: EmployerProfile; onOpen: (id: string) => void }) {
  const s = m.slip
  const earnings: Line[] = [
    { label: 'Basic Salary', amount: s.basic },
    ...s.allowances.map((a) => ({ label: a.name, amount: a.amount })),
    ...(m.bonusGross > 0 ? [{ label: 'Bonus', amount: m.bonusGross }] : []),
  ]
  const payeBeforeCredit = s.paye + m.bonusTax + s.medicalCreditMonthly
  const deductions: Line[] = [
    ...(s.employeeRetirementAdditional > 0
      ? [
          {
            label: 'Additional Staff Pension Contr',
            amount: s.employeeRetirementAdditional,
            about: 'pension-additional',
          },
        ]
      : []),
    ...(s.employeeRetirementBase > 0
      ? [{ label: 'Pension', amount: s.employeeRetirementBase, about: 'pension-employee' }]
      : []),
    ...(s.medicalCreditMonthly > 0
      ? [{ label: 'Med. Aid Tax Credit Applied', amount: -s.medicalCreditMonthly, about: 'medical-credit' }]
      : []),
    { label: 'PAYE Tax', amount: payeBeforeCredit, about: 'paye', tag: m.bonusTax > 0 ? 'incl. bonus tax' : undefined },
    { label: 'UIF Contribution', amount: s.uif, about: 'uif' },
    ...(s.employeeMedical > 0
      ? [
          {
            label:
              p.medical.mode === 'plan' && p.medical.employerCovers === 'main'
                ? 'Medical aid (dependants)'
                : 'Medical aid (your share)',
            amount: s.employeeMedical,
            about: 'medical-dependants',
          },
        ]
      : []),
    ...s.otherDeductions.map((d) => ({ label: d.name, amount: d.amount })),
  ]
  const risk = s.employer.riskItems.filter((r) => r.amount > 0)
  const company: Line[] = [
    ...risk.map((r) => ({ label: fringeLabel(r.id, r.name), amount: r.amount, about: r.id, tag: 'taxable, not cash' })),
    ...risk.map((r) => ({ label: r.name, amount: r.amount, about: r.id })),
    ...(s.employer.retirement > 0
      ? [{ label: 'Pension - Employer Amount', amount: s.employer.retirement, about: 'pension-employer' }]
      : []),
    ...(s.employer.medical > 0
      ? [{ label: 'Medical Aid - Employer Amount', amount: s.employer.medical, about: 'medical-employer' }]
      : []),
    {
      label: 'UIF - Employer',
      amount: s.employer.uif,
      about: 'uif',
      muted: true,
      tag: p.packageType === 'ctc' && !p.employerUifInPackage ? 'on top of CTC' : undefined,
    },
  ]
  const totalEarnings = s.grossCash + m.bonusGross
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="rounded-lg border border-border">
      <div className="grid gap-6 p-4 md:grid-cols-2">
        <Lines title="Earnings" lines={earnings} onOpen={onOpen} />
        <Lines title="Deductions" lines={deductions} onOpen={onOpen} />
      </div>
      <div className="grid grid-cols-3 gap-3 border-y border-border bg-text/[0.03] px-4 py-3 text-sm">
        <div>
          <p className="text-xs text-text-secondary">Total earnings</p>
          <p className="font-semibold tabular-nums text-text">{rand(totalEarnings)}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Total deductions</p>
          <p className="font-semibold tabular-nums text-text">{rand(totalDeductions)}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary">Nett pay</p>
          <p className="text-lg font-bold tabular-nums text-primary">{rand(totalEarnings - totalDeductions)}</p>
        </div>
      </div>
      <div className="p-4">
        <Lines title="Company benefits (not in your nett pay)" lines={company} onOpen={onOpen} />
        {risk.length > 0 && (
          <p className="mt-3 text-[11px] leading-snug text-text-secondary">
            Lines marked “taxable, not cash” add the premium to your taxable income — that's how payroll taxes the
            cover. The pension and medical aid employer amounts are taxed the same way; open them to see the effect.
          </p>
        )}
      </div>
    </div>
  )
}
