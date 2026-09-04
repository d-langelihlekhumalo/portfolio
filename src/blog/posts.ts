import { load as parseYaml } from 'js-yaml'
import type { Post, PostFrontmatter } from './types'

// Lazy by default (no `eager: true`) — each post's markdown becomes its own
// code-split chunk, only fetched when that post is actually viewed.
const postModules = import.meta.glob('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>

function slugFromPath(path: string): string {
  return (path.split('/').pop() ?? '').replace(/\.md$/, '')
}

const pathBySlug = new Map<string, string>(
  Object.keys(postModules).map((path) => [slugFromPath(path), path]),
)

const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/

/**
 * Splits `---` frontmatter from a raw markdown string and parses it with
 * js-yaml. Deliberately not gray-matter here: gray-matter calls Node's
 * `Buffer` internally, which doesn't exist in a browser — fine in the
 * build-time script (scripts/generate-blog-index.mjs), not fine bundled
 * into client code. js-yaml alone is pure JS and browser-safe.
 */
function parsePost(raw: string): Post {
  const match = raw.match(FRONTMATTER_PATTERN)
  if (!match) return { title: '', slug: '', date: '', tags: [], description: '', content: raw }

  const [, frontmatterBlock, content] = match
  const data = (parseYaml(frontmatterBlock) ?? {}) as PostFrontmatter
  return { ...data, content: content.trim() }
}

export async function loadPost(slug: string): Promise<Post | null> {
  const path = pathBySlug.get(slug)
  if (!path) return null

  const raw = await postModules[path]()
  return parsePost(raw)
}
