import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components'
import { cn } from '@/utils/cn'
import type { Draft } from './types'

interface DraftReviewModalProps {
  draft: Draft
  onClose: () => void
  /** Resolve when the action succeeds — the modal closes and the list refreshes.
   * Reject the promise to surface an error inside the modal. */
  onApprove: (prNumber: number) => Promise<void>
  onReject: (prNumber: number) => Promise<void>
}

export function DraftReviewModal({ draft, onClose, onApprove, onReject }: DraftReviewModalProps) {
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Esc to close, lock body scroll, focus the close button on open.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [busy, onClose])

  const run = async (action: 'approve' | 'reject') => {
    setBusy(action)
    setError(null)
    try {
      await (action === 'approve' ? onApprove(draft.number) : onReject(draft.number))
      // Parent closes + refreshes on success.
    } catch (err) {
      setError((err as Error).message)
      setBusy(null)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={() => !busy && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-review-title"
    >
      <div
        className="bg-background border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-4 border-b border-border">
          <div className="min-w-0">
            <h2 id="draft-review-title" className="font-semibold text-text truncate">
              {draft.title}
            </h2>
            <p className="text-xs text-text-secondary mt-1 truncate">
              #{draft.number} · {draft.branch}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={busy !== null}
            aria-label="Close review"
            className="text-text-secondary hover:text-text transition-colors flex-shrink-0 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 bg-surface">
          {draft.previewUrl ? (
            <iframe
              src={draft.previewUrl}
              title={`Preview of ${draft.title}`}
              className="w-full h-full block"
            />
          ) : (
            <div className="p-6 text-sm text-text-secondary">
              Preview deployment isn't ready yet — close this and refresh in a moment.
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border-t border-red-400/30 px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 p-4 border-t border-border">
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
              className={cn('inline-flex items-center gap-1.5 text-sm text-primary hover:underline')}
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
        </div>
      </div>
    </div>,
    document.body,
  )
}
