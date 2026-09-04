// Reads content/blog/*.md frontmatter and writes src/generated/blog-index.json
// (gitignored) — a build-time index the blog list page imports directly, with
// no runtime fetch. Runs before `vite build` (see package.json).

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const contentDir = path.join(root, 'content', 'blog')
const outPath = path.join(root, 'src', 'generated', 'blog-index.json')

async function main() {
  let files
  try {
    files = (await readdir(contentDir)).filter((f) => f.endsWith('.md'))
  } catch {
    files = []
  }

  const posts = []
  for (const file of files) {
    const raw = await readFile(path.join(contentDir, file), 'utf-8')
    const { data } = matter(raw)
    const expectedSlug = file.replace(/\.md$/, '')

    for (const field of ['title', 'slug', 'date', 'description']) {
      if (!data[field]) {
        throw new Error(`[generate-blog-index] ${file} is missing required frontmatter field "${field}"`)
      }
    }
    if (data.slug !== expectedSlug) {
      throw new Error(
        `[generate-blog-index] ${file}: frontmatter slug "${data.slug}" must match the filename "${expectedSlug}"`,
      )
    }

    posts.push({
      title: data.title,
      slug: data.slug,
      date: data.date,
      tags: data.tags ?? [],
      description: data.description,
      sources: data.sources ?? [],
      hasUnverifiedCode: data.hasUnverifiedCode ?? false,
    })
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1)) // newest first

  await mkdir(path.dirname(outPath), { recursive: true })
  await writeFile(outPath, JSON.stringify(posts, null, 2) + '\n', 'utf-8')
  console.log(`[generate-blog-index] wrote ${posts.length} post(s) to ${path.relative(root, outPath)}`)
}

main().catch((err) => {
  console.error(err.message)
  process.exitCode = 1
})
