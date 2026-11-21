import { monthlyMedicalCredit } from './engine'
import type { TaxYear } from './taxTables'

/*
 * Medical aid tax credits.
 *
 * s6A — medical scheme fees tax credit: a fixed monthly amount per person on
 *   the scheme, applied through payroll every month ("Med. Aid Tax Credit Applied").
 * s6B — additional medical expenses tax credit: only on assessment (ITR12).
 *   Under 65, no disability: 25% × [(fees − 4 × s6A credits) + qualifying
 *     out-of-pocket expenses − 7.5% of taxable income], if positive.
 *   65+, or a disability in the family: 33.3% × [(fees − 3 × s6A credits) +
 *     qualifying out-of-pocket expenses].
 * Employer contributions count as fees you paid (they're taxed as a fringe benefit).
 *
 * Source: SARS Guide IT07, "Guide on the Determination of Medical Tax Credits";
 * Income Tax Act s6B(3).
 */

export interface MedicalInputs {
  year: TaxYear
  age: number
  members: number
  /** Total scheme contributions per month (you + employer). */
  totalMonthly: number
  employerMonthly: number
  outOfPocketAnnual: number
  disability: boolean
  /** Taxable income for the year (for the 7.5% threshold). */
  taxableIncome: number
}

export function medicalSummary(m: MedicalInputs) {
  const { year } = m
  const creditMonthly = monthlyMedicalCredit(year, m.members)
  const creditAnnual = creditMonthly * 12
  const feesAnnual = m.totalMonthly * 12
  const perMember = Array.from({ length: Math.max(0, m.members) }, (_, i) => ({
    label: i === 0 ? 'You (main member)' : i === 1 ? 'First dependant' : `Dependant ${i}`,
    monthly:
      i === 0
        ? year.medicalCredits.main
        : i === 1
          ? year.medicalCredits.firstDependant
          : year.medicalCredits.additional,
  }))

  const higherRate = m.age >= 65 || m.disability
  const multiple = higherRate ? 3 : 4
  const rate = higherRate ? 1 / 3 : 0.25
  const excessFees = Math.max(0, feesAnnual - multiple * creditAnnual)
  const threshold = higherRate ? 0 : 0.075 * m.taxableIncome
  const qualifying = Math.max(0, excessFees + m.outOfPocketAnnual - threshold)
  const s6b = qualifying * rate

  const youMonthly = Math.max(0, m.totalMonthly - m.employerMonthly)
  return {
    creditMonthly,
    creditAnnual,
    perMember,
    feesAnnual,
    employerAnnual: m.employerMonthly * 12,
    youAnnual: youMonthly * 12,
    /** What the scheme really costs you after the monthly credit lowers your PAYE. */
    netCostToYouMonthly: youMonthly - creditMonthly,
    s6b: {
      formula: higherRate
        ? '33.3% × [(fees − 3 × credits) + out-of-pocket]'
        : '25% × [(fees − 4 × credits) + out-of-pocket − 7.5% of taxable income]',
      excessFees,
      threshold,
      qualifying,
      credit: Math.round(s6b * 100) / 100,
      higherRate,
    },
  }
}
