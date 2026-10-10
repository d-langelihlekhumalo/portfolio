import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { SectionWrapper } from '@/components'
import postsIndex from '@/generated/blog-index.json'
import type { PostSummary } from '@/blog/types'

const posts = postsIndex as PostSummary[]

interface WritingProps extends React.HTMLAttributes<HTMLElement> {
  id?: string
  ariaLabel?: string
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** Latest 2–3 posts, as plain rows — the full archive lives at /blog. */
export const Writing = forwardRef<HTMLElement, WritingProps>(
  ({ id = 'writing', ariaLabel = 'Recent writing', className, ...props }, ref) => {
    if (posts.length === 0) return null

    const latest = posts.slice(0, 3)

    return (
      <SectionWrapper
        ref={ref}
        id={id}
        heading="Writing"
        background="default"
        spacing="xl"
        variant="contained"
        role="region"
        ariaLabel={ariaLabel}
        className={className}
        {...props}
      >
        <div className="divide-y divide-border">
          {latest.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="block py-6 first:pt-0 last:pb-0 focus:outline-2 focus:outline-primary focus:outline-offset-2"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-semibold text-text hover:text-primary transition-colors">{post.title}</h3>
                <time dateTime={post.date} className="flex-shrink-0 text-sm text-text-secondary">
                  {formatDate(post.date)}
                </time>
              </div>
              <p className="mt-1 max-w-[65ch] text-sm text-text-secondary">{post.description}</p>
            </Link>
          ))}
        </div>

        <Link
          to="/blog"
          className="mt-8 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline focus:outline-2 focus:outline-primary focus:outline-offset-2 rounded-sm"
        >
          All posts
        </Link>
      </SectionWrapper>
    )
  },
)

Writing.displayName = 'Writing'
