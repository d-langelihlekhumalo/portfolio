import type { TaxYear } from './taxTables'

/*
 * South African employees' tax (PAYE) maths, on annual amounts.
 *
 * Method — the same order SARS uses:
 *   remuneration (cash pay + taxable allowances + fringe benefits)
 *   − retirement deduction (s11F: lesser of 27.5% of remuneration or the annual cap)
 *   = taxable income → bracket formula → − age rebates − medical credits (s6A)
 *
 * Bonuses use the standard payroll method: tax on (annual + bonus) minus tax
 * on annual alone. Employers' payroll systems annualise month by month and
 * round per period, so a real payslip can differ from this by a few rand.
 * Not covered: s6B additional medical credits, travel logbook claims and
 * anything else only settled on assessment.
 */

export interface AnnualInputs {
  year: TaxYear
  age: number
  /** Cash salary for the year, excluding bonus. */
  salary: number
  /** Bonus / 13th cheque paid in the year. */
  bonus: number
  /** Allowances taxed in full (cellphone, internet…). */
  taxableAllowances: number
  /** Travel allowance; `travelInclusion` of it is taxed through PAYE (80%, or 20% if ≥80% business use). */
  travelAllowance: number
  travelInclusion: number
  /** Employer contributions to a retirement fund — a fringe benefit, and deemed paid by you for s11F. */
  employerRetirement: number
  /** Employer contributions to medical aid — a fringe benefit. */
  employerMedical: number
  /** Other taxable fringe benefits (e.g. employer-paid group life outside the fund). */
  otherFringeBenefits: number
  /** Your own retirement contributions (pension, provident, RA through payroll). */
  employeeRetirement: number
  /** People on your medical aid, including you. 0 = no medical aid. */
  medicalMembers: number
}

export interface TaxResult {
  remuneration: number
  retirementContributions: number
  retirementDeduction: number
  retirementExcess: number
  taxableIncome: number
  taxBeforeRebates: number
  rebates: number
  medicalCredits: number
  /** Annual PAYE, never negative. */
  tax: number
  marginalRate: number
  /** Tax ÷ remuneration. */
  effectiveRate: number
  bracketSlices: BracketSlice[]
}

export interface BracketSlice {
  rate: number
  from: number
  to: number | null
  incomeInBracket: number
  taxOnSlice: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function bracketTax(year: TaxYear, taxable: number): number {
  if (taxable <= 0) return 0
  const b = [...year.brackets].reverse().find((x) => taxable > x.from) ?? year.brackets[0]
  return b.base + (taxable - b.from) * b.rate
}

export function bracketSlices(year: TaxYear, taxable: number): BracketSlice[] {
  return year.brackets.map((b, i) => {
    const next = year.brackets[i + 1]
    const to = next ? next.from : null
    const top = to === null ? taxable : Math.min(taxable, to)
    const incomeInBracket = Math.max(0, top - b.from)
    return { rate: b.rate, from: b.from, to, incomeInBracket, taxOnSlice: incomeInBracket * b.rate }
  })
}

export function marginalRate(year: TaxYear, taxable: number): number {
  if (taxable <= 0) return 0
  return ([...year.brackets].reverse().find((x) => taxable > x.from) ?? year.brackets[0]).rate
}

export function annualRebates(year: TaxYear, age: number): number {
  let r = year.rebates.primary
  if (age >= 65) r += year.rebates.secondary
  if (age >= 75) r += year.rebates.tertiary
  return r
}

/** Monthly s6A credit for a medical aid with `members` people (you + dependants). */
export function monthlyMedicalCredit(year: TaxYear, members: number): number {
  if (members <= 0) return 0
  const { main, firstDependant, additional } = year.medicalCredits
  return main + (members >= 2 ? firstDependant : 0) + Math.max(0, members - 2) * additional
}

export function monthlyUif(year: TaxYear, monthlyRemuneration: number): number {
  return round2(Math.min(Math.max(monthlyRemuneration, 0), year.uif.monthlyCeiling) * year.uif.rate)
}

export function remunerationOf(i: AnnualInputs): number {
  return (
    i.salary +
    i.bonus +
    i.taxableAllowances +
    i.travelAllowance * i.travelInclusion +
    i.employerRetirement +
    i.employerMedical +
    i.otherFringeBenefits
  )
}

export function computeAnnualTax(i: AnnualInputs): TaxResult {
  const { year } = i
  const remuneration = remunerationOf(i)
  const retirementContributions = i.employeeRetirement + i.employerRetirement
  const retirementDeduction = Math.min(
    retirementContributions,
    year.retirement.cap,
    year.retirement.pct * remuneration,
  )
  const taxableIncome = Math.max(0, remuneration - retirementDeduction)
  const taxBeforeRebates = bracketTax(year, taxableIncome)
  const rebates = annualRebates(year, i.age)
  const medicalCredits = monthlyMedicalCredit(year, i.medicalMembers) * 12
  const tax = Math.max(0, taxBeforeRebates - rebates - medicalCredits)
  return {
    remuneration,
    retirementContributions,
    retirementDeduction,
    retirementExcess: retirementContributions - retirementDeduction,
    taxableIncome,
    taxBeforeRebates: round2(taxBeforeRebates),
    rebates,
    medicalCredits,
    tax: round2(tax),
    marginalRate: marginalRate(year, taxableIncome),
    effectiveRate: remuneration > 0 ? tax / remuneration : 0,
    bracketSlices: bracketSlices(year, taxableIncome),
  }
}

/** PAYE split into the regular monthly amount and the extra tax in the bonus month. */
export function computePayeSplit(i: AnnualInputs) {
  const withBonus = computeAnnualTax(i)
  const withoutBonus = computeAnnualTax({ ...i, bonus: 0 })
  return {
    annual: withBonus,
    regularMonthly: round2(withoutBonus.tax / 12),
    bonusTax: round2(withBonus.tax - withoutBonus.tax),
  }
}

/* ───────────────────────── General calculator ───────────────────────── */

export interface GeneralInputs {
  year: TaxYear
  age: number
  grossMonthly: number
  /** Your retirement contribution as % of gross (0–100). */
  retirementPct: number
  medicalMembers: number
  /** What you pay for medical aid each month (after-tax deduction). */
  medicalMonthly: number
  bonusAnnual: number
  travelMonthly: number
  travel80BusinessUse: boolean
  otherAllowancesMonthly: number
}

export interface MonthlyBreakdown {
  gross: number
  paye: number
  uif: number
  retirement: number
  medical: number
  net: number
}

export function computeGeneral(g: GeneralInputs) {
  const employeeRetirementMonthly = (g.grossMonthly * g.retirementPct) / 100
  const inputs: AnnualInputs = {
    year: g.year,
    age: g.age,
    salary: g.grossMonthly * 12,
    bonus: g.bonusAnnual,
    taxableAllowances: g.otherAllowancesMonthly * 12,
    travelAllowance: g.travelMonthly * 12,
    travelInclusion: g.travel80BusinessUse ? 0.2 : 0.8,
    employerRetirement: 0,
    employerMedical: 0,
    otherFringeBenefits: 0,
    employeeRetirement: employeeRetirementMonthly * 12,
    medicalMembers: g.medicalMembers,
  }
  const split = computePayeSplit(inputs)
  const cashMonthly = g.grossMonthly + g.travelMonthly + g.otherAllowancesMonthly
  const uif = monthlyUif(g.year, cashMonthly)
  const month: MonthlyBreakdown = {
    gross: cashMonthly,
    paye: split.regularMonthly,
    uif,
    retirement: round2(employeeRetirementMonthly),
    medical: g.medicalMonthly,
    net: round2(cashMonthly - split.regularMonthly - uif - employeeRetirementMonthly - g.medicalMonthly),
  }
  return { inputs, ...split, month, bonusNet: round2(g.bonusAnnual - split.bonusTax) }
}

/**
 * Gross monthly salary needed for a target monthly take-home, with the other
 * general inputs held fixed. Net rises monotonically with gross, so bisection.
 */
export function grossForNet(g: Omit<GeneralInputs, 'grossMonthly'>, targetNet: number): number {
  let lo = 0
  let hi = Math.max(1000, targetNet * 3)
  while (computeGeneral({ ...g, grossMonthly: hi }).month.net < targetNet) hi *= 2
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2
    if (computeGeneral({ ...g, grossMonthly: mid }).month.net < targetNet) lo = mid
    else hi = mid
  }
  return Math.ceil(hi * 100) / 100
}
