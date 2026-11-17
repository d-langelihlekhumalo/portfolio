/*
 * What each payslip line means and how SARS treats it. General rules only —
 * your employer's actual terms go in the drawer's notes, which are stored in
 * your private profile (browser / KV), never in this public repo.
 */

export interface Source {
  label: string
  url: string
}

export interface BenefitInfo {
  id: string
  title: string
  /** How the line is usually labelled on a payslip. */
  payslipLines: string[]
  group: 'contribution' | 'deduction' | 'statutory'
  summary: string
  sections: { heading: string; body: string[] }[]
  /** Things to look up in the benefit booklet or ask HR — prompts for your notes. */
  ask: string[]
  sources: Source[]
}

const S = {
  rates: {
    label: 'SARS: Rates of tax for individuals',
    url: 'https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/',
  },
  budgetFaq: {
    label: 'SARS: Budget 2026 FAQ',
    url: 'https://www.sars.gov.za/about/sars-tax-and-customs-system/budget/budget-2026-frequently-asked-questions/',
  },
  fringe: {
    label: 'SARS: Guide for employers on fringe benefits',
    url: 'https://www.sars.gov.za/guide-for-employers-in-respect-of-fringe-benefits/',
  },
  para12c: {
    label: 'Seventh Schedule para 12C (value of insurance premiums)',
    url: 'https://www.acts.co.za/income-tax/sch7_12c__benefits_in_respect_of_in',
  },
  para2k: {
    label: 'Mondaq: taxation of employer-paid insurance policies (para 2(k))',
    url: 'https://www.mondaq.com/southafrica/employee-rights-labour-relations/179274/the-taxation-of-benefits-in-respect-of-insurance-policies',
  },
  proceeds: {
    label: 'Momentum: taxation of group insurance premiums and benefits',
    url: 'https://eb.momentum.co.za/webDocumentLibrary/LegalUpdates/2014/Legal%20Update%202-2014%20-%20Taxation%20of%20group%20insurance%20premiums%20and%20benefits%2017%20January%202014.pdf',
  },
  twoPot: {
    label: 'SARS: two-pot retirement system tax implications',
    url: 'https://www.sars.gov.za/latest-news/tax-directives-enhancements-and-tax-implications-of-the-two-pot-retirement-system/',
  },
  mtc: {
    label: 'SARS: Medical tax credits',
    url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/medical-credits/',
  },
  mtcRates: {
    label: 'SARS: Medical tax credit rates',
    url: 'https://www.sars.gov.za/tax-rates/medical-tax-credit-rates/',
  },
  amtc: {
    label: 'SARS: Additional medical expenses tax credit',
    url: 'https://www.sars.gov.za/types-of-tax/personal-income-tax/additional-medical-expenses-tax-credit/',
  },
  uif: {
    label: 'SARS: Unemployment Insurance Fund',
    url: 'https://www.sars.gov.za/types-of-tax/unemployment-insurance-fund/',
  },
} satisfies Record<string, Source>

const RETIREMENT_DEDUCTION =
  'Everything that goes into a retirement fund for you — your contribution, the additional one and the employer amount — is deductible up to 27.5% of the greater of your remuneration or taxable income, capped at R430 000 a year (2027 tax year). Payroll applies the deduction every month, so it lowers PAYE straight away.'

const TWO_POT =
  'Since 1 September 2024 new contributions are split: one third to a savings component you can withdraw from once a tax year (at least R2 000, taxed at your marginal rate), two thirds to a retirement component locked until retirement.'

export const BENEFITS: BenefitInfo[] = [
  {
    id: 'pension-employer',
    title: 'Pension – employer amount',
    payslipLines: ['Pension - Employer Amount'],
    group: 'contribution',
    summary:
      "What the company pays into the pension fund for you, on top of your own contribution. In a CTC package it's carved out of your package.",
    sections: [
      {
        heading: 'How it is taxed',
        body: [
          'Since 1 March 2016 the employer amount is a taxable fringe benefit — it is added to your taxable income even though you never see the cash.',
          'It is then treated as if you had contributed it yourself, so it is also deductible. The two cancel out unless your total retirement contributions are above the limit below.',
          RETIREMENT_DEDUCTION,
        ],
      },
      {
        heading: 'Where the money goes',
        body: [
          TWO_POT,
          'Some funds use part of the employer amount for admin costs and group risk cover (death or disability benefits inside the fund). That part is not invested for you — check the fund’s benefit statement.',
        ],
      },
    ],
    ask: [
      'What % of the employer amount is invested vs used for costs and risk cover?',
      'Is the % of basic salary or of the whole package?',
      'Vesting rules if you resign — do you take the full employer amount with you?',
    ],
    sources: [S.budgetFaq, S.twoPot],
  },
  {
    id: 'pension-employee',
    title: 'Pension – your contribution',
    payslipLines: ['Pension'],
    group: 'deduction',
    summary:
      'Your own contribution to the company pension fund at the fund’s set rate, deducted before PAYE is worked out.',
    sections: [
      {
        heading: 'How it is taxed',
        body: [
          RETIREMENT_DEDUCTION,
          'Every R1 you contribute costs you less than R1 in take-home — the difference is the PAYE you no longer pay, roughly your marginal rate.',
        ],
      },
      { heading: 'Access', body: [TWO_POT] },
    ],
    ask: ['Can you choose a higher fund rate?', 'Which investment portfolio are you in, and what are the fees?'],
    sources: [S.budgetFaq, S.twoPot],
  },
  {
    id: 'pension-additional',
    title: 'Additional staff pension contribution',
    payslipLines: ['Additional Staff Pension Contr'],
    group: 'deduction',
    summary:
      'A voluntary extra contribution you chose on top of the fund’s standard rate — one of the cheapest ways to save, because SARS funds part of it.',
    sections: [
      {
        heading: 'How it is taxed',
        body: [
          'Treated exactly like your normal contribution: deductible within the 27.5% / R430 000 limit, and payroll gives you the tax saving each month.',
          'Anything above the limit is not lost — it carries forward to later years and can reduce tax on your retirement lump sum or annuity.',
        ],
      },
      {
        heading: 'Access',
        body: [
          TWO_POT,
          'Use the What if tab to see how much a change costs in take-home versus how much more lands in the fund.',
        ],
      },
    ],
    ask: [
      'How often can you change the additional amount?',
      'Does it go into the same portfolio as your normal contributions?',
    ],
    sources: [S.budgetFaq, S.twoPot],
  },
  {
    id: 'medical-employer',
    title: 'Medical aid – employer amount',
    payslipLines: ['Medical Aid - Employer Amount'],
    group: 'contribution',
    summary:
      'The part of the medical scheme contribution the company pays. In a CTC package it is part of your package, not an extra.',
    sections: [
      {
        heading: 'How it is taxed',
        body: [
          'It is a taxable fringe benefit — added to your taxable income each month.',
          'For the medical tax credits it counts as if you paid it yourself, so the full scheme contribution (yours + employer) qualifies.',
        ],
      },
    ],
    ask: [
      'Is the employer amount a fixed rand figure or a % of the premium?',
      'Does it change when you change plan or add dependants?',
    ],
    sources: [S.fringe, S.mtc],
  },
  {
    id: 'medical-credit',
    title: 'Medical aid tax credit applied',
    payslipLines: ['Med. Aid Tax Credit Applied'],
    group: 'statutory',
    summary:
      'The monthly medical scheme fees tax credit (section 6A). It comes off your tax, not your pay — a fixed amount per person on the scheme, every month.',
    sections: [
      {
        heading: 'How it works',
        body: [
          'A fixed amount per person on the scheme each month: R376 for you, R376 for the first dependant and R254 for each additional dependant (2027 tax year).',
          'It is a credit against tax, so it is worth the same at every income level. It can reduce your tax to zero but not below.',
          'Medical costs above what the credit covers may qualify for the additional medical expenses credit on assessment — see the Medical aid tab.',
          'Payslips show it one of two ways: PAYE before the credit with the credit listed as a negative line, or PAYE already reduced with the credit shown for information. The tax you pay is the same either way.',
        ],
      },
    ],
    ask: ['Are all your dependants registered on the scheme so payroll counts them?'],
    sources: [S.mtc, S.mtcRates, S.amtc],
  },
  {
    id: 'funeral',
    title: 'Funeral cover',
    payslipLines: ['Funeral Cover', 'Funeral Cover - Fringe Benefits'],
    group: 'contribution',
    summary:
      'An insurance policy the company pays premiums on, paying out a lump sum for funeral costs if you or a covered family member dies. The payslip shows it twice: what the company paid, and the same amount as a taxable fringe benefit.',
    sections: [
      {
        heading: 'Why it appears twice',
        body: [
          'The company contribution line is the premium paid to the insurer.',
          'The “Fringe Benefits” line adds that premium to your taxable income (Seventh Schedule para 2(k)). It is not cash — it only increases PAYE, by roughly the premium × your marginal rate.',
        ],
      },
      {
        heading: 'When it pays out',
        body: [
          'Because you were taxed on the premiums, a lump-sum payout to you or your family is generally tax-free.',
          'If the cover sits inside the pension fund instead (an “approved” benefit), there is no separate fringe benefit line and the fund’s rules apply.',
        ],
      },
    ],
    ask: [
      'Who is covered — spouse, children, parents? Up to what age?',
      'Payout amount per person',
      'Waiting period, and how to claim',
    ],
    sources: [S.para2k, S.para12c, S.proceeds, S.fringe],
  },
  {
    id: 'death-disability',
    title: 'Death & disability cover',
    payslipLines: ['Death & Disability Cover', 'Death & Disability - Fringe Benefits'],
    group: 'contribution',
    summary:
      'Group life and disability insurance the company pays for: a lump sum to your beneficiaries if you die, and a lump sum or monthly income if you become unable to work. Like funeral cover it shows as a contribution and as a taxable fringe benefit.',
    sections: [
      {
        heading: 'How it is taxed',
        body: [
          'Premiums paid to an insurer are a taxable fringe benefit valued at the premium (para 2(k) and 12C) — your PAYE goes up by roughly premium × marginal rate.',
          'Because the premiums were taxed in your hands, lump-sum death and disability payouts from these policies are generally tax-free, and since 1 March 2015 so is monthly income-protection pay.',
        ],
      },
      {
        heading: 'Beneficiaries',
        body: [
          'Cover outside the pension fund usually needs its own beneficiary nomination form — the pension fund nomination does not automatically apply to it.',
        ],
      },
    ],
    ask: [
      'Life cover as a multiple of annual salary (e.g. 3×)?',
      'Disability: lump sum, monthly income, or both? Waiting period?',
      'Is your beneficiary nomination up to date?',
      'Can you convert the cover to a personal policy if you leave?',
    ],
    sources: [S.para2k, S.para12c, S.proceeds],
  },
  {
    id: 'paye',
    title: 'PAYE tax',
    payslipLines: ['PAYE Tax'],
    group: 'statutory',
    summary:
      'Income tax withheld monthly. Payroll annualises your taxable income (including fringe benefits), applies the brackets and rebates, subtracts the medical credit, and takes one twelfth.',
    sections: [
      {
        heading: 'What it includes',
        body: [
          'Salary, taxable allowances and every fringe benefit (pension and medical employer amounts, insurance premiums), less retirement contributions within the limit.',
          'A bonus is taxed as the difference in annual tax with and without it, so it is usually taxed at your marginal rate.',
          'Your assessment uses the actual year totals, so a mid-year increase or a bonus can leave a small refund or amount owing.',
        ],
      },
    ],
    ask: [],
    sources: [S.rates],
  },
  {
    id: 'uif',
    title: 'UIF contribution',
    payslipLines: ['UIF Contribution'],
    group: 'statutory',
    summary:
      'Unemployment Insurance Fund: 1% from you and 1% from the company, on remuneration up to R17 712 a month — so at most R177.12 each.',
    sections: [
      {
        heading: 'What it buys',
        body: [
          'Short-term income if you lose your job, and maternity, parental, adoption and illness benefits, claimed from the Department of Employment and Labour.',
          'It is not deductible for income tax.',
        ],
      },
    ],
    ask: [],
    sources: [S.uif],
  },
]

export const BENEFIT_BY_ID: Record<string, BenefitInfo> = Object.fromEntries(BENEFITS.map((b) => [b.id, b]))

/** Info for a company-paid cover line the user added themselves (not funeral / D&D). */
export function riskInfo(id: string, name: string): BenefitInfo {
  return (
    BENEFIT_BY_ID[id] ?? {
      id,
      title: name,
      payslipLines: [name, `${name} - Fringe Benefits`],
      group: 'contribution',
      summary:
        'Insurance the company pays premiums on for you. Premiums paid to an insurer are a taxable fringe benefit.',
      sections: BENEFIT_BY_ID['death-disability'].sections.slice(0, 1),
      ask: ['What does it cover, and how much does it pay?', 'Who are the beneficiaries?'],
      sources: [S.para2k, S.para12c],
    }
  )
}

/** The fringe-benefit payslip label for a cover line. */
export const fringeLabel = (id: string, name: string) =>
  id === 'death-disability' ? 'Death & Disability - Fringe Benefits' : `${name} - Fringe Benefits`
