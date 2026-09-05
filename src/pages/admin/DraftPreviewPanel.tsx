import { useState } from 'react'
import { Check, X, ExternalLink, ChevronUp } from 'lucide-react'
import { Button } from '@/components'
import type { Draft } from './types'

interface DraftPreviewPanelProps {
  draft: Draft
  onCollapse: () => void
  /** Resolve on success — the parent collapses + refreshes. Reject to show an error here. */
  onApprove: (prNumber: number) => Promise<void>
  onReject: (prNumber: number) => Promise<void>
}

/** The expanded content of a draft card: live preview iframe + actions. */
export function DraftPreviewPanel({ draft, onCollapse, onApprove, onReject }: DraftPreviewPanelProps) {
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (action: 'approve' | 'reject') => {
    setBusy(action)
    setError(null)
    try {
      await (action === 'approve' ? onApprove(draft.number) : onReject(draft.number))
    } catch (err) {
      setError((err as Error).message)
      setBusy(null)
    }
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      {draft.previewUrl ? (
        <div className="rounded-lg overflow-hidden border border-border bg-background">
          <iframe
            src={draft.previewUrl}
            title={`Preview of ${draft.title}`}
            className="w-full h-[540px] block"
          />
        </div>
      ) : (
        <p className="text-sm text-text-secondary">
          Preview deployment isn&apos;t ready yet — collapse and refresh in a moment.
        </p>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3 mt-4">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Check className="w-4 h-4" />}
          onClick={() => run('approve')}
          disabled={busy !== null}
          isLoading={busy === 'approve'}
        >
          Approve &amp; Publish
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<X className="w-4 h-4" />}
          onClick={() => run('reject')}
          disabled={busy !== null}
          isLoading={busy === 'reject'}
        >
          Reject
        </Button>

        <div className="flex-1" />

        {draft.previewUrl && (
          <a
            href={draft.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Full-size
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        )}
        <a
          href={draft.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-text-secondary hover:text-text transition-colors"
        >
          PR on GitHub
        </a>
        <button
          type="button"
          onClick={onCollapse}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors disabled:opacity-50"
        >
          Collapse
          <ChevronUp className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
