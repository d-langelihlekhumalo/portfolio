import { Badge, Button } from '@/components'
import { Eye } from 'lucide-react'
import type { Draft } from './types'

interface DraftCardProps {
  draft: Draft
  onReview: (draft: Draft) => void
}

/**
 * Compact list item — no iframe, no per-card actions beyond opening the
 * review modal. Keeping Approve/Reject out of the list means a draft can't
 * be acted on without first seeing its rendered preview.
 */
export function DraftCard({ draft, onReview }: DraftCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 bg-surface flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h3 className="font-semibold text-text truncate">{draft.title}</h3>
        <p className="text-xs text-text-secondary mt-1 truncate">
          #{draft.number} · {draft.branch} · {new Date(draft.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Badge variant="outline" size="sm">PR</Badge>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Eye className="w-4 h-4" />}
          onClick={() => onReview(draft)}
        >
          Review
        </Button>
      </div>
    </div>
  )
}
