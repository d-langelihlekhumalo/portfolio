import { Badge } from '@/components'
import { cn } from '@/utils/cn'

interface TagFilterBarProps {
  tags: string[]
  activeTag: string | null
  onSelect: (tag: string | null) => void
}

export function TagFilterBar({ tags, activeTag, onSelect }: TagFilterBarProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter posts by tag">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          'focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-md',
          'transition-opacity duration-150',
          activeTag !== null && 'opacity-60 hover:opacity-100',
        )}
        aria-pressed={activeTag === null}
      >
        <Badge variant={activeTag === null ? 'primary' : 'outline'}>All</Badge>
      </button>

      {tags.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(tag)}
          className={cn(
            'focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-md',
            'transition-opacity duration-150',
            activeTag !== tag && 'opacity-60 hover:opacity-100',
          )}
          aria-pressed={activeTag === tag}
        >
          <Badge variant={activeTag === tag ? 'primary' : 'outline'}>{tag}</Badge>
        </button>
      ))}
    </div>
  )
}

TagFilterBar.displayName = 'TagFilterBar'
