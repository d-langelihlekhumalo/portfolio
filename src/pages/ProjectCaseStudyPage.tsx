import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { ArrowLeft, ExternalLink, GitBranch } from 'lucide-react'
import { SectionWrapper, Badge, Button } from '@/components'
import { usePageMeta } from '@/hooks/usePageMeta'
import { loadProjectCaseStudy, type ProjectCaseStudy } from '@/content/projectCaseStudy'

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean
}

function CodeBlock({ className, children, ...props }: CodeProps) {
  const isBlock = Boolean(className)
  if (!isBlock) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-surface text-primary text-sm" {...props}>
        {children}
      </code>
    )
  }
  return (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

function ProjectCaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [study, setStudy] = useState<ProjectCaseStudy | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setStudy(undefined)
    if (slug) {
      loadProjectCaseStudy(slug).then((result) => {
        if (!cancelled) setStudy(result)
      })
    }
    return () => {
      cancelled = true
    }
  }, [slug])

  usePageMeta({
    title: study ? `${study.title} — Case Study — Andile Khumalo` : 'Case Study — Andile Khumalo',
    description: study?.summary ?? 'Project case study.',
    path: `/projects/${slug ?? ''}`,
  })

  if (study === undefined) {
    return (
      <SectionWrapper background="default" spacing="lg" role="region" ariaLabel="Loading case study">
        <p className="text-text-secondary">Loading…</p>
      </SectionWrapper>
    )
  }

  if (study === null) {
    return (
      <SectionWrapper background="default" spacing="lg" role="region" ariaLabel="Case study not found">
        <div className="flex flex-col items-start gap-4">
          <h1 className="text-3xl font-bold text-text">Case study not found</h1>
          <p className="text-text-secondary">That project doesn&apos;t have a write-up, or the link is out of date.</p>
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/#projects')}>
            Back to Projects
          </Button>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper background="default" spacing="lg" variant="contained" role="article" ariaLabel={study.title}>
      <article className="max-w-3xl mx-auto">
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Projects
        </Link>

        <div className="flex items-center gap-3 text-sm text-text-secondary mb-3">
          {study.status && <Badge variant="outline" size="sm">{study.status}</Badge>}
          {study.year && <span>{study.year}</span>}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-text leading-tight mb-4">{study.title}</h1>
        <p className="text-lg text-text-secondary leading-relaxed mb-6">{study.summary}</p>

        {study.tech.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {study.tech.map((t) => (
              <Badge key={t} variant="default" size="sm">
                {t}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-10">
          {study.liveUrl && (
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ExternalLink className="w-4 h-4" />}
              onClick={() => window.open(study.liveUrl, '_blank', 'noopener,noreferrer')}
            >
              View live
            </Button>
          )}
          {study.repoUrl && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<GitBranch className="w-4 h-4" />}
              onClick={() => window.open(study.repoUrl, '_blank', 'noopener,noreferrer')}
            >
              GitHub
            </Button>
          )}
        </div>

        <div className="prose-blog">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{ code: CodeBlock }}
          >
            {study.content}
          </ReactMarkdown>
        </div>
      </article>
    </SectionWrapper>
  )
}

export default ProjectCaseStudyPage
