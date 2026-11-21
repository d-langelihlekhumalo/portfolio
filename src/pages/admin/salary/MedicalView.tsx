import { cn } from '@/utils/cn'
import { msaMonthly, payslip, projectYear, syncMedical, type EmployerProfile } from './employer'
import { compareScenario } from './whatIf'
import { medicalSummary } from './medical'
import type { TaxYear } from './taxTables'
import { NumberField, SectionTitle, Stat, Toggle, focusRing, rand, rand0 } from './ui'

type Update = (fn: (p: EmployerProfile) => EmployerProfile) => void

export function MedicalView({
  p,
  year,
  update,
  onOpen,
}: {
  p: EmployerProfile
  year: TaxYear
  update: Update
  onOpen: (id: string) => void
}) {
  if (!p.medical.enabled) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-sm text-text-secondary">
        <p className="font-semibold text-text">Not on medical aid</p>
        <p className="mt-2">Switch on “I'm on medical aid” under Medical aid on the left to see your credits.</p>
      </div>
    )
  }
  const taxable = projectYear(p, year).actual.taxableIncome
  const m = medicalSummary({
    year,
    age: p.age,
    members: p.medical.members,
    totalMonthly: p.medical.totalMonthly,
    employerMonthly: p.medical.employerMonthly,
    outOfPocketAnnual: p.medical.outOfPocketAnnual,
    disability: p.medical.disability,
    taxableIncome: taxable,
  })
  const net = payslip(p, year).net
  const trueCost = Math.max(0, payslip({ ...p, medical: { ...p.medical, enabled: false } }, year).net - net)
  const msa = msaMonthly(p.medical)
  const family = [
    { label: '+ a partner or other adult', adults: 1, children: 0 },
    { label: '+ a child', adults: 0, children: 1 },
    { label: '+ a partner and a child', adults: 1, children: 1 },
  ].map((f) => {
    const r = compareScenario(
      p,
      [{ kind: 'medicalDependants', adults: p.medical.adults + f.adults, children: p.medical.children + f.children }],
      year,
    )
    const after = syncMedical({
      ...p,
      medical: { ...p.medical, adults: p.medical.adults + f.adults, children: p.medical.children + f.children },
    })
    return {
      label: f.label,
      premium: after.medical.totalMonthly - p.medical.totalMonthly,
      credit: r.delta.medicalCreditMonthly,
      net: r.delta.netMonthly,
    }
  })
  const setMed = (patch: Partial<EmployerProfile['medical']>) =>
    update((cur) => ({ ...cur, medical: { ...cur.medical, ...patch } }))
  const link = (id: string, label: string) => (
    <button type="button" onClick={() => onOpen(id)} className={cn('rounded text-primary hover:opacity-80', focusRing)}>
      {label}
    </button>
  )

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-x-6 border-y border-border sm:grid-cols-4 sm:divide-x sm:divide-border sm:gap-x-0 [&>*]:sm:px-5 [&>*:first-child]:sm:pl-0">
        <Stat
          label="Scheme contribution / month"
          value={rand0(p.medical.totalMonthly)}
          note={`${rand0(p.medical.employerMonthly)} from the company`}
        />
        <Stat label="Tax credit / month" value={rand0(m.creditMonthly)} note="Off PAYE, every month" />
        <Stat label="Tax credits this year" value={rand0(m.creditAnnual)} />
        <Stat label="Est. extra credit on assessment" value={rand0(m.s6b.credit)} note="Section 6B, when you file" />
      </div>

      <div className="grid gap-10 xl:grid-cols-2">
        <section>
          <SectionTitle>Monthly credit, person by person</SectionTitle>
          <ul className="divide-y divide-border">
            {m.perMember.map((row) => (
              <li key={row.label} className="flex justify-between py-1.5 text-sm">
                <span className="text-text-secondary">{row.label}</span>
                <span className="tabular-nums text-text">{rand(row.monthly)}</span>
              </li>
            ))}
            <li className="flex justify-between py-1.5 text-sm font-semibold">
              <span className="text-text">Med. Aid Tax Credit Applied</span>
              <span className="tabular-nums text-text">{rand(m.creditMonthly)}</span>
            </li>
          </ul>
          <p className="mt-3 text-sm text-text-secondary">
            SARS sets the credit per person, whatever the plan costs — a cheaper plan doesn't lower them, so on a budget
            plan they cover a bigger share of the cost. {link('medical-credit', 'How the credit works')} ·{' '}
            {link('medical-employer', 'How the employer amount is taxed')}
          </p>
          <div className="mt-6 rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary">What medical aid really costs your take-home</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-text">{rand0(trueCost)} / month</p>
            <p className="mt-1 text-sm text-text-secondary">
              Take-home with medical aid vs without it — after the company's share, the fringe-benefit tax and the{' '}
              {rand0(m.creditMonthly)} credit
              {p.packageType === 'ctc' && p.medical.employerMonthly > 0
                ? '. In a CTC package the company amount would otherwise be paid to you, so it counts.'
                : '.'}
            </p>
          </div>
        </section>

        <section>
          <SectionTitle>Additional medical expenses credit (s6B)</SectionTitle>
          <p className="text-sm text-text-secondary">
            Out-of-pocket costs the scheme didn't pay — co-payments, a GP visit from savings that ran out, prescribed
            medicine, specs — can earn an extra credit, but only when you file your return, and only above a threshold.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberField
              label="Out-of-pocket medical costs this tax year"
              prefix="R"
              step={500}
              value={p.medical.outOfPocketAnnual}
              onChange={(n) => setMed({ outOfPocketAnnual: n })}
              hint="Keep the receipts — SARS can ask."
            />
            <div className="pt-5">
              <Toggle
                label="Someone in the family has a disability"
                checked={p.medical.disability}
                onChange={(b) => setMed({ disability: b })}
                hint="Uses the 33.3% formula with no income threshold (needs an ITR-DD)."
              />
            </div>
          </div>
          <table className="mt-5 w-full text-sm">
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-1.5 pr-3 text-text-secondary">Scheme fees this year</td>
                <td className="py-1.5 text-right tabular-nums text-text">{rand(m.feesAnnual)}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 text-text-secondary">
                  Less {m.s6b.higherRate ? '3' : '4'} × your annual credits of {rand0(m.creditAnnual)}
                </td>
                <td className="py-1.5 text-right tabular-nums text-text">
                  −{rand((m.s6b.higherRate ? 3 : 4) * m.creditAnnual)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 text-text-secondary">Fees above that (not below zero)</td>
                <td className="py-1.5 text-right tabular-nums text-text">{rand(m.s6b.excessFees)}</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 text-text-secondary">Plus out-of-pocket costs</td>
                <td className="py-1.5 text-right tabular-nums text-text">{rand(p.medical.outOfPocketAnnual)}</td>
              </tr>
              {!m.s6b.higherRate && (
                <tr>
                  <td className="py-1.5 pr-3 text-text-secondary">Less 7.5% of taxable income ({rand0(taxable)})</td>
                  <td className="py-1.5 text-right tabular-nums text-text">−{rand(m.s6b.threshold)}</td>
                </tr>
              )}
              <tr>
                <td className="py-1.5 pr-3 text-text-secondary">Qualifying amount</td>
                <td className="py-1.5 text-right tabular-nums text-text">{rand(m.s6b.qualifying)}</td>
              </tr>
              <tr className="font-semibold">
                <td className="py-1.5 pr-3 text-text">× {m.s6b.higherRate ? '33.3%' : '25%'} = extra credit</td>
                <td className="py-1.5 text-right tabular-nums text-primary">{rand(m.s6b.credit)}</td>
              </tr>
            </tbody>
          </table>
          {m.s6b.credit === 0 && !m.s6b.higherRate && (
            <p className="mt-3 text-sm text-text-secondary">
              Nothing yet: you'd need about{' '}
              <span className="font-semibold text-text">{rand0(Math.max(0, m.s6b.threshold - m.s6b.excessFees))}</span>{' '}
              of out-of-pocket costs this year before the extra credit starts.
            </p>
          )}
          <p className="mt-3 text-[11px] text-text-secondary">
            Formula: {m.s6b.formula}. Estimate only — SARS works it out on assessment from your scheme's tax
            certificate.
          </p>
        </section>
      </div>

      {p.medical.mode === 'plan' && p.medical.rates.main > 0 && (
        <section>
          <SectionTitle
            aside={
              <span className="text-xs text-text-secondary">
                {p.medical.planName || 'Your plan'}, company pays the main member
              </span>
            }
          >
            What adding family would cost you
          </SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-secondary">
                  <th className="pb-2 text-left font-medium" />
                  <th className="pb-2 text-right font-medium">Extra premium</th>
                  <th className="pb-2 text-right font-medium">Extra tax credit</th>
                  <th className="pb-2 text-right font-medium">Take-home change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {family.map((f) => (
                  <tr key={f.label}>
                    <td className="py-2 pr-3 text-text">{f.label}</td>
                    <td className="py-2 pl-3 text-right tabular-nums text-text">{rand0(f.premium)}</td>
                    <td className="py-2 pl-3 text-right tabular-nums text-text">{rand0(f.credit)}</td>
                    <td className="py-2 pl-3 text-right font-semibold tabular-nums text-primary">−{rand0(-f.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-text-secondary">
            Dependants' contributions come off your pay after tax; the medical tax credit for each one lowers your PAYE,
            so the real cost is the premium less the credit. Try other combinations on the What if tab.
          </p>
          {msa > 0 && (
            <p className="mt-2 text-sm text-text-secondary">
              Medical Savings Account: about <span className="font-semibold text-text">{rand0(msa * 12)}</span> a year
              for day-to-day costs with your current members ({rand0(msa)} of the monthly contribution).
            </p>
          )}
        </section>
      )}
    </div>
  )
}
