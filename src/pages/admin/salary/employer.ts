import { computeAnnualTax, monthlyUif, type AnnualInputs } from './engine'
import type { TaxYear } from './taxTables'

/*
 * "My employer" model. Everything here is driven by the saved profile, which
 * lives in the browser and in KV behind Cloudflare Access — never in this
 * (public) repo. The code only describes package *rules*.
 */

export type PackageType = 'ctc' | 'basic'
export type BonusKind = 'none' | 'thirteenth' | 'percentOfAnnual' | 'fixed'

export interface LineItem {
  id: string
  name: string
  monthly: number
}

export interface Allowance extends LineItem {
  kind: 'taxable' | 'travel'
}

export interface EmployerProfile {
  version: 1
  updatedAt: string
  label: string
  age: number
  packageType: PackageType
  /** Monthly cost-to-company, or monthly basic salary, depending on packageType. */
  monthlyAmount: number
  retirement: {
    enabled: boolean
    fundName: string
    employeePct: number
    employerPct: number
    /** What the percentages are applied to. */
    base: 'basic' | 'package'
  }
  medical: {
    enabled: boolean
    /** Full monthly contribution to the scheme. */
    totalMonthly: number
    /** Portion the employer pays (a taxable fringe benefit). */
    employerMonthly: number
    members: number
  }
  /** Employer-paid risk cover outside the fund (group life, disability) — taxable fringe benefit. */
  employerRiskMonthly: number
  /** CTC packages often include the employer's 1% UIF. */
  employerUifInPackage: boolean
  allowances: Allowance[]
  travel80BusinessUse: boolean
  /** After-tax deductions you pay through payroll (gap cover, funeral, union…). */
  deductions: LineItem[]
  bonus: { kind: BonusKind; value: number; month: number }
  increase: { pct: number; month: number }
}

export function emptyProfile(): EmployerProfile {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    label: 'Current employer',
    age: 30,
    packageType: 'ctc',
    monthlyAmount: 0,
    retirement: { enabled: true, fundName: 'Pension fund', employeePct: 7.5, employerPct: 7.5, base: 'basic' },
    medical: { enabled: false, totalMonthly: 0, employerMonthly: 0, members: 1 },
    employerRiskMonthly: 0,
    employerUifInPackage: true,
    allowances: [],
    travel80BusinessUse: false,
    deductions: [],
    bonus: { kind: 'thirteenth', value: 0, month: 12 },
    increase: { pct: 0, month: 3 },
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100

export interface Payslip {
  basic: number
  allowances: { name: string; amount: number; kind: Allowance['kind'] }[]
  grossCash: number
  paye: number
  uif: number
  employeeRetirement: number
  employeeMedical: number
  otherDeductions: { name: string; amount: number }[]
  totalDeductions: number
  net: number
  employer: {
    retirement: number
    medical: number
    risk: number
    uif: number
  }
  /** Taxable value added to remuneration that you never see as cash. */
  fringeBenefits: number
  packageCheck: number
}

/** Split a month's package into basic + employer costs, solving CTC circularity by iteration. */
function monthlyComponents(p: EmployerProfile, year: TaxYear, packageAmount: number) {
  const allowancesTotal = p.allowances.reduce((s, a) => s + a.monthly, 0)
  const erMedical = p.medical.enabled ? p.medical.employerMonthly : 0
  let basic = p.packageType === 'basic' ? packageAmount : packageAmount - allowancesTotal - erMedical - p.employerRiskMonthly
  for (let k = 0; k < 30; k++) {
    const retBase = p.retirement.base === 'basic' ? basic : packageAmount
    const erRet = p.retirement.enabled ? (retBase * p.retirement.employerPct) / 100 : 0
    const erUif = monthlyUif(year, basic + allowancesTotal)
    if (p.packageType === 'basic') break
    const next =
      packageAmount - allowancesTotal - erMedical - p.employerRiskMonthly - erRet - (p.employerUifInPackage ? erUif : 0)
    if (Math.abs(next - basic) < 0.005) {
      basic = next
      break
    }
    basic = next
  }
  basic = Math.max(0, basic)
  const retBase = p.retirement.base === 'basic' ? basic : packageAmount
  const erRet = p.retirement.enabled ? (retBase * p.retirement.employerPct) / 100 : 0
  const eeRet = p.retirement.enabled ? (retBase * p.retirement.employeePct) / 100 : 0
  const erUif = monthlyUif(year, basic + allowancesTotal)
  return { basic, allowancesTotal, erMedical, erRet, eeRet, erUif }
}

function annualInputsFor(p: EmployerProfile, year: TaxYear, c: ReturnType<typeof monthlyComponents>, bonus: number): AnnualInputs {
  const taxable = p.allowances.filter((a) => a.kind === 'taxable').reduce((s, a) => s + a.monthly, 0)
  const travel = p.allowances.filter((a) => a.kind === 'travel').reduce((s, a) => s + a.monthly, 0)
  return {
    year,
    age: p.age,
    salary: c.basic * 12,
    bonus,
    taxableAllowances: taxable * 12,
    travelAllowance: travel * 12,
    travelInclusion: p.travel80BusinessUse ? 0.2 : 0.8,
    employerRetirement: c.erRet * 12,
    employerMedical: c.erMedical * 12,
    otherFringeBenefits: p.employerRiskMonthly * 12,
    employeeRetirement: c.eeRet * 12,
    medicalMembers: p.medical.enabled ? p.medical.members : 0,
  }
}

function bonusAmount(p: EmployerProfile, basic: number): number {
  switch (p.bonus.kind) {
    case 'thirteenth':
      return basic
    case 'percentOfAnnual':
      return (basic * 12 * p.bonus.value) / 100
    case 'fixed':
      return p.bonus.value
    default:
      return 0
  }
}

/** A regular month's payslip at a given package amount (annualised PAYE, as payroll does). */
export function payslip(p: EmployerProfile, year: TaxYear, packageAmount = p.monthlyAmount): Payslip {
  const c = monthlyComponents(p, year, packageAmount)
  const tax = computeAnnualTax(annualInputsFor(p, year, c, 0))
  const paye = round2(tax.tax / 12)
  const uif = monthlyUif(year, c.basic + c.allowancesTotal)
  const employeeMedical = p.medical.enabled ? Math.max(0, p.medical.totalMonthly - p.medical.employerMonthly) : 0
  const otherDeductions = p.deductions.map((d) => ({ name: d.name, amount: d.monthly }))
  const otherTotal = otherDeductions.reduce((s, d) => s + d.amount, 0)
  const grossCash = c.basic + c.allowancesTotal
  const totalDeductions = round2(paye + uif + c.eeRet + employeeMedical + otherTotal)
  return {
    basic: round2(c.basic),
    allowances: p.allowances.map((a) => ({ name: a.name, amount: a.monthly, kind: a.kind })),
    grossCash: round2(grossCash),
    paye,
    uif,
    employeeRetirement: round2(c.eeRet),
    employeeMedical: round2(employeeMedical),
    otherDeductions,
    totalDeductions,
    net: round2(grossCash - totalDeductions),
    employer: {
      retirement: round2(c.erRet),
      medical: round2(c.erMedical),
      risk: p.employerRiskMonthly,
      uif: c.erUif,
    },
    fringeBenefits: round2(c.erRet + c.erMedical + p.employerRiskMonthly),
    packageCheck: round2(
      grossCash + c.erRet + c.erMedical + p.employerRiskMonthly + (p.employerUifInPackage ? c.erUif : 0),
    ),
  }
}

export interface ProjectionMonth {
  /** 1–12 calendar month. */
  month: number
  label: string
  packageAmount: number
  slip: Payslip
  bonusGross: number
  bonusTax: number
  net: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * The tax year month by month (March → February): the increase from its month
 * onward, the bonus in its month. PAYE is annualised each month like payroll;
 * `assessment` compares the year's PAYE with tax on the actual totals.
 */
export function projectYear(p: EmployerProfile, year: TaxYear) {
  const order = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2]
  const incIdx = order.indexOf(p.increase.month)
  const months: ProjectionMonth[] = order.map((m, i) => {
    const packageAmount = p.monthlyAmount * (p.increase.pct && i >= incIdx ? 1 + p.increase.pct / 100 : 1)
    const slip = payslip(p, year, packageAmount)
    let bonusGross = 0
    let bonusTax = 0
    if (p.bonus.kind !== 'none' && m === p.bonus.month) {
      const c = monthlyComponents(p, year, packageAmount)
      bonusGross = round2(bonusAmount(p, c.basic))
      const base = computeAnnualTax(annualInputsFor(p, year, c, 0)).tax
      const withBonus = computeAnnualTax(annualInputsFor(p, year, c, bonusGross)).tax
      bonusTax = round2(withBonus - base)
    }
    return { month: m, label: MONTHS[m - 1], packageAmount, slip, bonusGross, bonusTax, net: round2(slip.net + bonusGross - bonusTax) }
  })

  const sum = (f: (m: ProjectionMonth) => number) => round2(months.reduce((s, m) => s + f(m), 0))
  const payeWithheld = sum((m) => m.slip.paye + m.bonusTax)

  // Tax on the year's actual totals — what an assessment would compute from the IRP5.
  const taxable = p.allowances.filter((a) => a.kind === 'taxable')
  const travel = p.allowances.filter((a) => a.kind === 'travel')
  const actual = computeAnnualTax({
    year,
    age: p.age,
    salary: sum((m) => m.slip.basic),
    bonus: sum((m) => m.bonusGross),
    taxableAllowances: taxable.reduce((s, a) => s + a.monthly, 0) * 12,
    travelAllowance: travel.reduce((s, a) => s + a.monthly, 0) * 12,
    travelInclusion: p.travel80BusinessUse ? 0.2 : 0.8,
    employerRetirement: sum((m) => m.slip.employer.retirement),
    employerMedical: sum((m) => m.slip.employer.medical),
    otherFringeBenefits: p.employerRiskMonthly * 12,
    employeeRetirement: sum((m) => m.slip.employeeRetirement),
    medicalMembers: p.medical.enabled ? p.medical.members : 0,
  })

  return {
    months,
    totals: {
      gross: sum((m) => m.slip.grossCash + m.bonusGross),
      paye: payeWithheld,
      uif: sum((m) => m.slip.uif),
      retirementYou: sum((m) => m.slip.employeeRetirement),
      retirementEmployer: sum((m) => m.slip.employer.retirement),
      net: sum((m) => m.net),
    },
    actual,
    /** Positive = likely refund on assessment; negative = likely owing. Rough guide only. */
    assessmentDifference: round2(payeWithheld - actual.tax),
  }
}
