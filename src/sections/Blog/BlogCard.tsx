import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Card, Badge } from '@/components'
import { cn } from '@/utils/cn'
import type { PostSummary } from '@/blog/types'

interface BlogCardProps {
  post: PostSummary
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card hoverable padding="none" className="h-full">
      {/* The link is the sole interactive/focusable element — Card itself
          stays a plain visual container to avoid nesting two focusable
          elements inside each other. */}
      <Link
        to={`/blog/${post.slug}`}
        className={cn(
          'flex flex-col gap-4 h-full p-8',
          'focus:outline-2 focus:outline-primary focus:outline-offset-[-2px] rounded-xl',
        )}
      >
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>

        <h3 className="text-xl font-bold text-text leading-snug">{post.title}</h3>

        <p className="text-sm text-text-secondary leading-relaxed flex-1">
          {post.description}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Link>
    </Card>
  )
}

BlogCard.displayName = 'BlogCard'
