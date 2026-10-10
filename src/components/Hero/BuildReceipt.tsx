// Real numbers from baby-steps-tracker's own CI gate (`npm run verify`),
// re-checked against the repo rather than copied from anywhere else.
// Re-verify against the repo before changing any of these.
const TESTS = '436 passing'
const ENGINE_COVERAGE = '99.7%'
const BUDGET_USED_KB = 120.8
const BUDGET_TOTAL_KB = 250
const BUDGET_PCT = Math.round((BUDGET_USED_KB / BUDGET_TOTAL_KB) * 100)

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-text text-right">{value}</dd>
    </div>
  )
}

/**
 * The hero's one bold element: a CI-run summary styled like a terminal,
 * using baby-steps-tracker's real verify-gate numbers. The only place the
 * monospace / "terminal" styling appears outside blog code blocks.
 */
export function BuildReceipt() {
  return (
    <a
      href="https://github.com/d-langelihlekhumalo/baby-steps-tracker/actions"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full max-w-md rounded-lg border border-border bg-background p-5 font-mono text-sm transition-colors hover:border-text-secondary focus:outline-2 focus:outline-primary focus:outline-offset-2"
      aria-label="baby-steps-tracker CI status: 436 tests passing, 99.7% engine coverage, initial JS 120.8 of 250 kB budget, accessibility checks on every route, offline PWA support. Opens the GitHub Actions page."
    >
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <span className="text-text">baby-steps-tracker · main</span>
        <span className="text-success">CI passed</span>
      </div>
      <dl className="space-y-2">
        <Row label="tests" value={TESTS} />
        <Row label="engine coverage" value={ENGINE_COVERAGE} />
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-text-secondary">initial JS</dt>
            <dd className="text-text text-right">
              {BUDGET_USED_KB} kB / {BUDGET_TOTAL_KB} kB budget
            </dd>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div
              className="budget-bar h-full rounded-full bg-success"
              style={{ '--budget-pct': `${BUDGET_PCT}%` } as React.CSSProperties}
            />
          </div>
        </div>
        <Row label="a11y checks" value="every route" />
        <Row label="offline" value="PWA, works without network" />
      </dl>
    </a>
  )
}

BuildReceipt.displayName = 'BuildReceipt'
