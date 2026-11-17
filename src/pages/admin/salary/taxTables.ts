/*
 * SARS tax tables for individuals, by tax year.
 *
 * Source of truth: https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/
 * plus the Budget 2026 FAQ for the retirement cap and the SARS UIF page for
 * the UIF ceiling. Each Budget (February) publishes the next year's table:
 * add a new entry at the top, keep the old ones so past years can still be
 * checked, and update `checkedOn`.
 *
 * SARS names a tax year by the year it ends: "2027" = 1 Mar 2026 – 28 Feb 2027.
 */

export interface Bracket {
  /** Lowest taxable income in this bracket (rand). */
  from: number
  /** Tax on all income below `from`. */
  base: number
  /** Marginal rate for income in this bracket, e.g. 0.26. */
  rate: number
}

export interface TaxYear {
  id: string
  label: string
  start: string
  end: string
  brackets: Bracket[]
  rebates: { primary: number; secondary: number; tertiary: number }
  /** Below these, no tax is payable. Shown for reference; the maths follows from brackets − rebates. */
  thresholds: { under65: number; from65: number; from75: number }
  /** Monthly section 6A medical scheme fees tax credits. */
  medicalCredits: { main: number; firstDependant: number; additional: number }
  /** Section 11F retirement deduction: lesser of `cap` or `pct` of remuneration / taxable income. */
  retirement: { pct: number; cap: number }
  uif: { rate: number; monthlyCeiling: number }
  sources: { label: string; url: string }[]
  checkedOn: string
}

const SARS_RATES = {
  label: 'SARS: Rates of tax for individuals',
  url: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/',
}
const SARS_UIF = { label: 'SARS: Unemployment Insurance Fund', url: 'https://www.sars.gov.za/types-of-tax/unemployment-insurance-fund/' }

export const TAX_YEARS: TaxYear[] = [
  {
    id: '2027',
    label: '2026/27 (2027 tax year)',
    start: '2026-03-01',
    end: '2027-02-28',
    brackets: [
      { from: 0, base: 0, rate: 0.18 },
      { from: 245_100, base: 44_118, rate: 0.26 },
      { from: 383_100, base: 79_998, rate: 0.31 },
      { from: 530_200, base: 125_599, rate: 0.36 },
      { from: 695_800, base: 185_215, rate: 0.39 },
      { from: 887_000, base: 259_783, rate: 0.41 },
      { from: 1_878_600, base: 666_339, rate: 0.45 },
    ],
    rebates: { primary: 17_820, secondary: 9_765, tertiary: 3_249 },
    thresholds: { under65: 99_000, from65: 153_250, from75: 171_300 },
    medicalCredits: { main: 376, firstDependant: 376, additional: 254 },
    retirement: { pct: 0.275, cap: 430_000 },
    uif: { rate: 0.01, monthlyCeiling: 17_712 },
    sources: [
      SARS_RATES,
      {
        label: 'SARS: Budget 2026 FAQ (retirement cap R430 000)',
        url: 'https://www.sars.gov.za/about/sars-tax-and-customs-system/budget/budget-2026-frequently-asked-questions/',
      },
      SARS_UIF,
    ],
    checkedOn: '2026-11-17',
  },
  {
    id: '2026',
    label: '2025/26 (2026 tax year)',
    start: '2025-03-01',
    end: '2026-02-28',
    // Unchanged from the 2024 and 2025 tax years (no inflation adjustment).
    brackets: [
      { from: 0, base: 0, rate: 0.18 },
      { from: 237_100, base: 42_678, rate: 0.26 },
      { from: 370_500, base: 77_362, rate: 0.31 },
      { from: 512_800, base: 121_475, rate: 0.36 },
      { from: 673_000, base: 179_147, rate: 0.39 },
      { from: 857_900, base: 251_258, rate: 0.41 },
      { from: 1_817_000, base: 644_489, rate: 0.45 },
    ],
    rebates: { primary: 17_235, secondary: 9_444, tertiary: 3_145 },
    thresholds: { under65: 95_750, from65: 148_217, from75: 165_689 },
    medicalCredits: { main: 364, firstDependant: 364, additional: 246 },
    retirement: { pct: 0.275, cap: 350_000 },
    uif: { rate: 0.01, monthlyCeiling: 17_712 },
    sources: [SARS_RATES, SARS_UIF],
    checkedOn: '2026-11-17',
  },
]

export const CURRENT_YEAR = TAX_YEARS[0]

export function taxYearById(id: string): TaxYear {
  return TAX_YEARS.find((y) => y.id === id) ?? CURRENT_YEAR
}
