import { ChevronRight, NotebookPen } from 'lucide-react'
import { cn } from '@/utils/cn'
import { BENEFIT_BY_ID, riskInfo } from './benefitInfo'
import { fringeTaxCost, payslip, type EmployerProfile } from './employer'
import type { TaxYear } from './taxTables'
import { SectionTitle, Stat, focusRing, rand, rand0 } from './ui'

interface Card {
  id: string
  title: string
  summary: string
  monthly: number
  taxCost: number
}

function BenefitCard({ c, hasNotes, onOpen }: { c: Card; hasNotes: boolean; onOpen: (id: string) => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(c.id)}
        className={cn(
          'group flex h-full w-full flex-col rounded-lg border border-border p-4 text-left hover:border-primary/60',
          focusRing,
        )}
      >
        <span className="flex w-full items-start justify-between gap-3">
          <span className="font-semibold text-text group-hover:text-primary">{c.title}</span>
          <span className="shrink-0 text-lg font-bold tabular-nums text-text">{rand0(c.monthly)}</span>
        </span>
        <span className="mt-1.5 line-clamp-3 text-sm text-text-secondary">{c.summary}</span>
        <span className="mt-auto flex w-full items-center justify-between gap-3 pt-3 text-xs text-text-secondary">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {Math.abs(c.taxCost) < 1 ? 'No net tax effect' : `Costs you ${rand(c.taxCost)} PAYE / month`}
            {hasNotes && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap text-text">
                <NotebookPen aria-hidden="true" className="h-3 w-3" /> Your notes
              </span>
            )}
          </span>
          <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-primary">
            Meaning &amp; terms <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        </span>
      </button>
    </li>
  )
}

export function BenefitsView({ p, year, onOpen }: { p: EmployerProfile; year: TaxYear; onOpen: (id: string) => void }) {
  const s = payslip(p, year)
  const cards: Card[] = []
  if (s.employer.retirement > 0)
    cards.push({
      id: 'pension-employer',
      title: BENEFIT_BY_ID['pension-employer'].title,
      summary: BENEFIT_BY_ID['pension-employer'].summary,
      monthly: s.employer.retirement,
      taxCost: fringeTaxCost(p, year, { kind: 'retirement' }),
    })
  if (s.employer.medical > 0)
    cards.push({
      id: 'medical-employer',
      title: BENEFIT_BY_ID['medical-employer'].title,
      summary: BENEFIT_BY_ID['medical-employer'].summary,
      monthly: s.employer.medical,
      taxCost: fringeTaxCost(p, year, { kind: 'medical' }),
    })
  for (const r of p.riskBenefits) {
    const info = riskInfo(r.id, r.name)
    cards.push({
      id: r.id,
      title: r.name,
      summary: info.summary,
      monthly: r.monthly,
      taxCost: fringeTaxCost(p, year, { kind: 'risk', id: r.id }),
    })
  }
  const total = cards.reduce((sum, c) => sum + c.monthly, 0)
  const taxCost = cards.reduce((sum, c) => sum + c.taxCost, 0)
  const hasNotes = (id: string) => !!(p.notes[id]?.terms.trim() || p.notes[id]?.link)

  const deductionIds = ['pension-employee', 'pension-additional', 'medical-credit', 'paye', 'uif']

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-x-6 border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-border sm:gap-x-0 [&>*]:sm:px-5 [&>*:first-child]:sm:pl-0">
        <Stat label="Company benefits / month" value={rand0(total)} />
        <Stat label="Per year" value={rand0(total * 12)} />
        <Stat
          label="Extra PAYE they cause / month"
          value={rand0(taxCost)}
          note="Fringe-benefit tax, net of deductions"
        />
      </div>

      <div>
        <SectionTitle
          aside={<span className="text-xs text-text-secondary">Add or rename cover under “Company-paid cover”</span>}
        >
          What the company contributes
        </SectionTitle>
        {cards.length === 0 ? (
          <p className="text-sm text-text-secondary">No company contributions in your profile yet.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {cards.map((c) => (
              <BenefitCard key={c.id} c={c} hasNotes={hasNotes(c.id)} onOpen={onOpen} />
            ))}
          </ul>
        )}
      </div>

      <div>
        <SectionTitle>What your deductions mean</SectionTitle>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {deductionIds.map((id) => {
            const info = BENEFIT_BY_ID[id]
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onOpen(id)}
                  className={cn('group flex w-full items-start justify-between gap-4 px-4 py-3 text-left', focusRing)}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-text group-hover:text-primary">{info.title}</span>
                    <span className="mt-0.5 block text-sm text-text-secondary">{info.summary}</span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary group-hover:text-primary"
                  />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
