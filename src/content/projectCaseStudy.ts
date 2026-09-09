import { load as parseYaml } from 'js-yaml'

export interface ProjectCaseStudyFrontmatter {
  title: string
  slug: string
  summary: string
  tech: string[]
  liveUrl?: string
  repoUrl?: string
  status?: string
  year?: string
}

export interface ProjectCaseStudy extends ProjectCaseStudyFrontmatter {
  /** Raw markdown body (frontmatter stripped). */
  content: string
}

// Lazy — each case study's markdown is its own code-split chunk, fetched only
// when that page is viewed. Mirrors src/blog/posts.ts.
const modules = import.meta.glob('/content/projects/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

function slugFromPath(path: string): string {
  return (path.split('/').pop() ?? '').replace(/\.md$/, '')
}

const pathBySlug = new Map<string, string>(
  Object.keys(modules).map((path) => [slugFromPath(path), path]),
)

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

function parse(raw: string): ProjectCaseStudy {
  const match = raw.match(FRONTMATTER_PATTERN)
  if (!match) {
    return { title: '', slug: '', summary: '', tech: [], content: raw }
  }
  const [, frontmatter, content] = match
  const data = (parseYaml(frontmatter) ?? {}) as ProjectCaseStudyFrontmatter
  return { ...data, content: content.trim() }
}

export async function loadProjectCaseStudy(slug: string): Promise<ProjectCaseStudy | null> {
  const path = pathBySlug.get(slug)
  if (!path) return null
  return parse(await modules[path]())
}
