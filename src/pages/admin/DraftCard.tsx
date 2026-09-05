import { useEffect, useRef } from 'react'
import { FileText, Eye, ChevronDown } from 'lucide-react'
import { Badge, Button } from '@/components'
import { cn } from '@/utils/cn'
import { DraftPreviewPanel } from './DraftPreviewPanel'
import type { Draft } from './types'

interface DraftCardProps {
  draft: Draft
  expanded: boolean
  onToggle: (draft: Draft) => void
  onCollapse: () => void
  onApprove: (prNumber: number) => Promise<void>
  onReject: (prNumber: number) => Promise<void>
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export function DraftCard({ draft, expanded, onToggle, onCollapse, onApprove, onReject }: DraftCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Keep the opened card in view when it expands.
  useEffect(() => {
    if (expanded) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [expanded])

  return (
    <div
      ref={ref}
      className={cn(
        'border rounded-xl bg-surface transition-colors duration-200',
        expanded ? 'border-primary/50 lg:col-span-2' : 'border-border hover:border-primary/40',
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-text truncate">{draft.title}</h3>
              <p className="text-xs text-text-secondary mt-1 truncate">
                #{draft.number} · {draft.branch} · {relativeTime(draft.createdAt)}
              </p>
            </div>
          </div>
          <Badge variant="outline" size="sm">PR</Badge>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant={expanded ? 'secondary' : 'primary'}
            size="sm"
            leftIcon={expanded ? <ChevronDown className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            onClick={() => onToggle(draft)}
          >
            {expanded ? 'Reviewing' : 'Review'}
          </Button>
        </div>

        {expanded && (
          <DraftPreviewPanel
            draft={draft}
            onCollapse={onCollapse}
            onApprove={onApprove}
            onReject={onReject}
          />
        )}
      </div>
    </div>
  )
}
