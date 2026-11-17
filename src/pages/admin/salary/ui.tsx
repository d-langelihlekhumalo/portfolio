import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

const zar = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 })
const zar0 = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 })

// `|| 0` turns -0 into 0, so a zero deduction never shows as "-R 0,00".
export const rand = (n: number) => zar.format(Number.isFinite(n) ? n || 0 : 0)
export const rand0 = (n: number) => zar0.format(Number.isFinite(n) ? Math.round(n) || 0 : 0)
export const pct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`

export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2'

export const inputClass = cn(
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text tabular-nums',
  'placeholder:text-text-secondary focus:outline-2 focus:outline-primary focus:outline-offset-2',
)

export function Field({ label, hint, children }: { label: string; hint?: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <div className="mt-1">{children(id)}</div>
      {hint && <p className="mt-1 text-[11px] leading-snug text-text-secondary">{hint}</p>}
    </div>
  )
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
}: {
  label: string
  hint?: string
  value: number
  onChange: (n: number) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
  max?: number
}) {
  // Keep the raw text while typing so "1." or "" don't get rewritten mid-edit.
  const [text, setText] = useState<string | null>(null)
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <div className="relative">
          {prefix && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-text-secondary">
              {prefix}
            </span>
          )}
          <input
            id={id}
            type="number"
            inputMode="decimal"
            step={step}
            min={min}
            max={max}
            value={text ?? (Number.isFinite(value) ? String(value) : '')}
            onChange={(e) => {
              setText(e.target.value)
              const n = parseFloat(e.target.value)
              onChange(Number.isFinite(n) ? n : 0)
            }}
            onBlur={() => setText(null)}
            className={cn(inputClass, prefix && 'pl-7', suffix && 'pr-10')}
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-text-secondary">
              {suffix}
            </span>
          )}
        </div>
      )}
    </Field>
  )
}

export function SelectField<T extends string | number>({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string
  hint?: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <select
          id={id}
          value={String(value)}
          onChange={(e) => {
            const found = options.find((o) => String(o.value) === e.target.value)
            if (found) onChange(found.value)
          }}
          className={inputClass}
        >
          {options.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (b: boolean) => void; hint?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-[rgb(var(--protea-rgb))]"
        />
        {label}
      </label>
      {hint && <p className="mt-1 pl-6 text-[11px] leading-snug text-text-secondary">{hint}</p>}
    </div>
  )
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{children}</h3>
      {aside}
    </div>
  )
}

export function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="py-3">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums text-text">{value}</p>
      {note && <p className="text-[11px] text-text-secondary">{note}</p>}
    </div>
  )
}

/**
 * Ranked horizontal bars on one baseline, largest first, one hue. `emphasis`
 * marks the one bar that is the point (protea); the rest are context (ink).
 */
export function RankedBars({
  rows,
  total,
  label,
}: {
  rows: { label: string; value: number; emphasis?: boolean; note?: string }[]
  total: number
  label: string
}) {
  const sorted = rows.filter((r) => r.value > 0).sort((a, b) => b.value - a.value)
  const max = sorted[0]?.value ?? 1
  return (
    <ul className="space-y-2.5" aria-label={label}>
      {sorted.map((r) => (
        <li key={r.label} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[10.5rem_1fr_auto]">
          <span className={cn('truncate', r.emphasis ? 'font-semibold text-text' : 'text-text-secondary')} title={r.note}>
            {r.label}
          </span>
          <span
            className="h-3 overflow-hidden rounded-r bg-transparent"
            role="img"
            aria-label={`${r.label}: ${rand(r.value)}, ${pct(r.value / (total || 1))} of total`}
            title={`${rand(r.value)} · ${pct(r.value / (total || 1))}`}
          >
            <span
              className={cn('block h-full rounded-r', r.emphasis ? 'bg-primary' : 'bg-text-secondary/35')}
              style={{ width: `${Math.max(1, (r.value / max) * 100)}%` }}
            />
          </span>
          <span className="tabular-nums text-right">
            <span className={r.emphasis ? 'font-semibold text-text' : 'text-text'}>{rand(r.value)}</span>
            <span className="ml-2 inline-block w-12 text-xs text-text-secondary">{pct(r.value / (total || 1), 0)}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Disclosure({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-lg border border-border">
      <summary
        className={cn(
          'flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-text',
          'hover:text-primary',
          focusRing,
        )}
      >
        {title}
        <span aria-hidden="true" className="text-text-secondary group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-4 border-t border-border px-4 py-4">{children}</div>
    </details>
  )
}
