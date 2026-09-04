import { visit } from 'unist-util-visit'
import type { Root } from 'mdast'

/**
 * Reads fence-meta on code blocks (```tsx unverified) and exposes it as
 * `data.hProperties['data-unverified']` so react-markdown's `code` renderer
 * can flag that specific block for review — a per-snippet counterpart to
 * the post-level `hasUnverifiedCode` frontmatter flag.
 */
export function remarkUnverifiedCode() {
  return (tree: Root) => {
    visit(tree, 'code', (node) => {
      const meta = (node as { meta?: string | null }).meta
      if (!meta?.split(/\s+/).includes('unverified')) return

      node.data ??= {}
      node.data.hProperties = {
        ...(node.data.hProperties as Record<string, unknown> | undefined),
        'data-unverified': 'true',
      }
    })
  }
}
