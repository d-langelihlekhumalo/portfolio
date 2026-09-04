import { ExternalLink } from 'lucide-react'
import { Card } from '@/components'
import type { PostSource } from '@/blog/types'

interface SourcesListProps {
  sources: PostSource[]
}

/** Renders a post's cited sources — the review aid that lets a reader (the
 * approver, first) verify an AI-drafted post's claims before it's trusted. */
export function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) return null

  return (
    <Card padding="md" className="mt-10">
      <h2 className="text-sm font-semibold text-text uppercase tracking-wider opacity-80 mb-3">
        Sources
      </h2>
      <ul className="space-y-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              {source.title}
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </Card>
  )
}

SourcesList.displayName = 'SourcesList'
