import { useId, useState } from 'react'
import { ExternalLink, Lock } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { BenefitInfo } from './benefitInfo'
import type { BenefitNote } from './employer'
import { Drawer, focusRing, inputClass, rand } from './ui'

const GROUP_LABEL: Record<BenefitInfo['group'], string> = {
  contribution: 'Company contribution',
  deduction: 'Deduction from your pay',
  statutory: 'Statutory',
}

export interface DrawerFigure {
  label: string
  monthly: number
  note?: string
}

function NoteEditor({ note, onChange, ask }: { note: BenefitNote; onChange: (n: BenefitNote) => void; ask: string[] }) {
  const termsId = useId()
  const linkId = useId()
  const [linkDraft, setLinkDraft] = useState(note.link)
  const [linkError, setLinkError] = useState<string | null>(null)

  const commitLink = () => {
    const v = linkDraft.trim()
    if (!v) {
      setLinkError(null)
      onChange({ ...note, link: '' })
      return
    }
    try {
      const u = new URL(v)
      if (!/^https?:$/.test(u.protocol)) throw new Error()
      setLinkError(null)
      onChange({ ...note, link: u.href })
    } catch {
      setLinkError('Enter a full http(s) link, e.g. to the benefit booklet on your intranet.')
    }
  }

  return (
    <div className="space-y-4">
      {ask.length > 0 && (
        <div>
          <p className="text-xs font-medium text-text-secondary">Worth finding out</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-text">
            {ask.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <label htmlFor={termsId} className="block text-xs font-medium text-text-secondary">
          Terms &amp; conditions, in your words
        </label>
        <textarea
          id={termsId}
          rows={6}
          value={note.terms}
          onChange={(e) => onChange({ ...note, terms: e.target.value })}
          placeholder="Paste or summarise the rules from the benefit booklet: who's covered, how much, waiting periods, how to claim…"
          className={cn(inputClass, 'resize-y normal-nums leading-relaxed')}
        />
      </div>
      <div>
        <label htmlFor={linkId} className="block text-xs font-medium text-text-secondary">
          Link to the policy document
        </label>
        <input
          id={linkId}
          type="url"
          value={linkDraft}
          onChange={(e) => setLinkDraft(e.target.value)}
          onBlur={commitLink}
          placeholder="https://"
          aria-invalid={!!linkError}
          className={cn(inputClass, 'mt-1 normal-nums')}
        />
        {linkError && <p className="mt-1 text-[11px] text-primary">{linkError}</p>}
        {note.link && !linkError && (
          <a
            href={note.link}
            target="_blank"
            rel="noreferrer"
            className={cn(
              'mt-2 inline-flex items-center gap-1 rounded text-sm text-primary hover:opacity-80',
              focusRing,
            )}
          >
            Open document <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <p className="flex items-start gap-1.5 text-[11px] leading-snug text-text-secondary">
        <Lock aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
        Saved with your private profile (this browser, and your Access-protected storage when sync is on) — never in the
        site's code. Leave out ID and policy numbers.
      </p>
    </div>
  )
}

export function BenefitDrawer({
  info,
  figures,
  note,
  onNote,
  onClose,
}: {
  info: BenefitInfo
  figures: DrawerFigure[]
  note: BenefitNote
  onNote: (n: BenefitNote) => void
  onClose: () => void
}) {
  return (
    <Drawer title={info.title} eyebrow={GROUP_LABEL[info.group]} onClose={onClose}>
      <p className="text-sm leading-relaxed text-text">{info.summary}</p>

      <div className="flex flex-wrap gap-1.5" aria-label="Payslip lines">
        {info.payslipLines.map((l) => (
          <span key={l} className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-text-secondary">
            {l}
          </span>
        ))}
      </div>

      {figures.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Your figures</h3>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="text-[11px] text-text-secondary">
                <th className="pb-1 text-left font-medium" />
                <th className="pb-1 text-right font-medium">Month</th>
                <th className="pb-1 text-right font-medium">Year</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {figures.map((f) => (
                <tr key={f.label}>
                  <td className="py-1.5 pr-3 text-text-secondary">
                    {f.label}
                    {f.note && <span className="block text-[11px]">{f.note}</span>}
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-text">{rand(f.monthly)}</td>
                  <td className="py-1.5 pl-3 text-right tabular-nums text-text">{rand(f.monthly * 12)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {info.sections.map((s) => (
        <section key={s.heading}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{s.heading}</h3>
          <div className="mt-2 space-y-2 text-sm leading-relaxed text-text">
            {s.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Your terms &amp; notes
        </h3>
        <NoteEditor note={note} onChange={onNote} ask={info.ask} />
      </section>

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Sources</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {info.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className={cn('rounded text-primary hover:opacity-80', focusRing)}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-text-secondary">
          General rules, not tax advice. Your fund and policy documents win.
        </p>
      </section>
    </Drawer>
  )
}
