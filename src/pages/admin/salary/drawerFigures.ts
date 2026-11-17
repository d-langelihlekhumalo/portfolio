import { fringeTaxCost, payslip, type EmployerProfile } from './employer'
import type { DrawerFigure } from './BenefitDrawer'
import type { TaxYear } from './taxTables'

const round2 = (n: number) => Math.round(n * 100) / 100

/** The numbers shown at the top of a benefit's drawer, from the saved profile. */
export function figuresFor(id: string, p: EmployerProfile, year: TaxYear): DrawerFigure[] {
  const s = payslip(p, year)
  const fringeRow = (amount: number): DrawerFigure => ({
    label: 'Added to your taxable income',
    monthly: amount,
    note: 'Fringe benefit — not cash',
  })

  switch (id) {
    case 'pension-employer': {
      const cost = fringeTaxCost(p, year, { kind: 'retirement' })
      return [
        { label: 'Company pays into the fund', monthly: s.employer.retirement },
        fringeRow(s.employer.retirement),
        {
          label: 'Extra PAYE it causes',
          monthly: cost,
          note: Math.abs(cost) < 1 ? 'Nets out: also deductible' : 'Over the deduction limit',
        },
      ]
    }
    case 'pension-employee':
    case 'pension-additional': {
      const amount = id === 'pension-employee' ? s.employeeRetirementBase : s.employeeRetirementAdditional
      const without =
        id === 'pension-employee'
          ? payslip({ ...p, retirement: { ...p.retirement, employeePct: 0 } }, year)
          : payslip(
              {
                ...p,
                retirement: {
                  ...p.retirement,
                  additional: { ...p.retirement.additional, value: 0 },
                },
              },
              year,
            )
      const saving = round2(without.paye - s.paye)
      return [
        { label: 'Into the fund', monthly: amount },
        { label: 'PAYE saved', monthly: saving },
        { label: 'Real cost to take-home', monthly: round2(amount - saving) },
      ]
    }
    case 'medical-employer':
      return [
        { label: 'Company pays to the scheme', monthly: s.employer.medical },
        fringeRow(s.employer.medical),
        {
          label: 'Extra PAYE it causes',
          monthly: fringeTaxCost(p, year, { kind: 'medical' }),
        },
      ]
    case 'medical-credit':
      return [{ label: 'Credit off your tax', monthly: s.medicalCreditMonthly }]
    case 'paye':
      return [
        {
          label: 'Tax before the medical credit',
          monthly: round2(s.paye + s.medicalCreditMonthly),
        },
        { label: 'Medical aid tax credit', monthly: -s.medicalCreditMonthly },
        { label: 'PAYE withheld', monthly: s.paye },
      ]
    case 'uif':
      return [
        { label: 'From you', monthly: s.uif },
        { label: 'From the company', monthly: s.employer.uif },
      ]
    default: {
      const item = p.riskBenefits.find((r) => r.id === id)
      if (!item) return []
      return [
        { label: 'Premium the company pays', monthly: item.monthly },
        fringeRow(item.monthly),
        {
          label: 'Extra PAYE it causes',
          monthly: fringeTaxCost(p, year, { kind: 'risk', id }),
        },
      ]
    }
  }
}
