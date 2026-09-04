import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Calendar, ArrowLeft, AlertTriangle } from 'lucide-react'
import { SectionWrapper, Badge, Button } from '@/components'
import { SourcesList } from '@/sections/Blog/SourcesList'
import { remarkUnverifiedCode } from '@/blog/remark-unverified-code'
import { loadPost } from '@/blog/posts'
import { usePageMeta } from '@/hooks/usePageMeta'
import type { Post } from '@/blog/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  'data-unverified'?: string
}

function CodeBlock({ className, children, ...props }: CodeProps) {
  const isBlock = Boolean(className) // fenced blocks get a `language-*`/hljs className; inline code doesn't
  const isUnverified = props['data-unverified'] === 'true'

  if (!isBlock) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-surface text-primary text-sm" {...props}>
        {children}
      </code>
    )
  }

  return (
    <>
      {isUnverified && (
        <div className="flex items-center gap-2 text-xs font-medium text-amber-400 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
          Unverified — not tested, review before relying on this
        </div>
      )}
      <code className={className} {...props}>
        {children}
      </code>
    </>
  )
}

function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null | undefined>(undefined) // undefined = loading

  useEffect(() => {
    let cancelled = false
    setPost(undefined)
    if (slug) {
      loadPost(slug).then((result) => {
        if (!cancelled) setPost(result)
      })
    }
    return () => {
      cancelled = true
    }
  }, [slug])

  usePageMeta({
    title: post ? `${post.title} — Andile Khumalo` : 'Blog — Andile Khumalo',
    description: post?.description ?? 'Notes on .NET, React, and building reliable software.',
    path: `/blog/${slug ?? ''}`,
  })

  if (post === undefined) {
    return (
      <SectionWrapper background="default" spacing="lg" role="region" ariaLabel="Loading post">
        <p className="text-text-secondary">Loading…</p>
      </SectionWrapper>
    )
  }

  if (post === null) {
    return (
      <SectionWrapper background="default" spacing="lg" role="region" ariaLabel="Post not found">
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-3xl font-bold text-text">Post not found</h1>
          <p className="text-text-secondary">
            That post doesn't exist, or the link is out of date.
          </p>
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/blog')}>
            Back to Blog
          </Button>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper
      background="default"
      spacing="lg"
      variant="contained"
      role="article"
      ariaLabel={post.title}
    >
      <article className="max-w-3xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Blog
        </Link>

        <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-text leading-tight mb-4">
          {post.title}
        </h1>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {post.hasUnverifiedCode && (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg px-4 py-3 mb-8">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            This post contains code samples that haven't been independently verified.
          </div>
        )}

        <div className="prose-blog">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkUnverifiedCode]}
            rehypePlugins={[rehypeHighlight]}
            components={{ code: CodeBlock }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {post.sources && <SourcesList sources={post.sources} />}
      </article>
    </SectionWrapper>
  )
}

export default BlogPostPage
