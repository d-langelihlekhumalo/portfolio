export interface PostSource {
  title: string
  url: string
}

/** Fields every post's frontmatter must/can declare. Kept in sync manually with
 * scripts/generate-blog-index.mjs and the generation prompt (scripts/generation/*). */
export interface PostFrontmatter {
  title: string
  slug: string
  /** ISO date string, e.g. "2026-09-04" */
  date: string
  tags: string[]
  description: string
  sources?: PostSource[]
  /** True if any code sample in the post is flagged unverified (see fence-meta below). */
  hasUnverifiedCode?: boolean
}

/** Metadata-only summary, as stored in the build-time index (src/generated/blog-index.json). */
export type PostSummary = PostFrontmatter

export interface Post extends PostFrontmatter {
  /** Raw markdown body (frontmatter stripped). */
  content: string
}
