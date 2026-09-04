import { useEffect, useMemo, useRef, useState } from 'react'
import { SectionWrapper } from '@/components'
import { BlogCard } from '@/sections/Blog/BlogCard'
import { TagFilterBar } from '@/sections/Blog/TagFilterBar'
import { usePageMeta } from '@/hooks/usePageMeta'
import postsIndex from '@/generated/blog-index.json'
import type { PostSummary } from '@/blog/types'

const posts = postsIndex as PostSummary[]
const INITIAL_BATCH = 24 // generous — the prerender snapshot only bakes in what's visible at mount

function BlogListPage() {
  usePageMeta({
    title: 'Blog — Andile Khumalo',
    description: 'Notes on .NET, React, and building reliable software, from a freelance full-stack developer in Cape Town.',
    path: '/blog',
  })

  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [],
  )

  const filteredPosts = useMemo(
    () => (activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts),
    [activeTag],
  )

  // Reset the reveal batch whenever the filter changes
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH)
  }, [activeTag])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => Math.min(count + INITIAL_BATCH, filteredPosts.length))
        }
      },
      { rootMargin: '400px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [filteredPosts.length])

  const visiblePosts = filteredPosts.slice(0, visibleCount)

  return (
    <SectionWrapper
      background="default"
      spacing="lg"
      role="region"
      ariaLabel="Blog posts"
    >
      <div className="flex flex-col gap-8">
        {/* SectionWrapper's own `heading` prop renders an h2 — this page needs a real h1,
            since (unlike homepage sections) it's a standalone page, not a section within one. */}
        <div>
          <h1 className="text-4xl md:text-6xl font-bold text-text leading-tight">Blog</h1>
          <p className="text-base md:text-lg text-text-secondary font-normal mt-3">
            Notes on .NET, React, and building reliable software
          </p>
        </div>

        <TagFilterBar tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />

        {visiblePosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-text-secondary">No posts with this tag yet.</p>
        )}

        {/* Progressive-reveal sentinel — invisible, just an IntersectionObserver target */}
        <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      </div>
    </SectionWrapper>
  )
}

export default BlogListPage
