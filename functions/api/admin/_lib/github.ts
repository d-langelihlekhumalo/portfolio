// Shared GitHub API helpers for the admin Functions. Files under an
// underscore-prefixed directory are excluded from Cloudflare Pages'
// file-based routing, so this is safe to import without becoming a route.

const OWNER = 'd-langelihlekhumalo'
const REPO = 'portfolio'
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`
const DRAFT_LABEL = 'ai-draft'

function githubHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'andilekhumalo-admin',
  }
}

interface GithubPullRequest {
  number: number
  title: string
  html_url: string
  created_at: string
  head: { ref: string }
  labels: { name: string }[]
}

export interface Draft {
  number: number
  title: string
  branch: string
  createdAt: string
  url: string
  /** The blog post's slug, e.g. "some-post" -> reviewable at /blog/some-post
   * on the preview deployment. Null if the PR doesn't touch exactly one
   * content/blog/*.md file (unexpected shape — still listed, just without
   * a direct link to the post itself). */
  slug: string | null
}

interface GithubFile {
  filename: string
  status: string
}

const BLOG_POST_PATTERN = /^content\/blog\/([^/]+)\.md$/

async function getChangedPostSlug(token: string, prNumber: number): Promise<string | null> {
  const res = await fetch(`${API_BASE}/pulls/${prNumber}/files`, { headers: githubHeaders(token) })
  if (!res.ok) return null

  const files = (await res.json()) as GithubFile[]
  const postFiles = files
    .filter((f) => f.status !== 'removed')
    .map((f) => f.filename.match(BLOG_POST_PATTERN)?.[1])
    .filter((slug): slug is string => Boolean(slug))

  // Only confident about linking straight to the post if the PR is
  // unambiguous about which one it is.
  return postFiles.length === 1 ? postFiles[0] : null
}

export async function listDraftPRs(token: string): Promise<Draft[]> {
  const res = await fetch(`${API_BASE}/pulls?state=open&per_page=50`, {
    headers: githubHeaders(token),
  })
  if (!res.ok) throw new Error(`GitHub list PRs failed: ${res.status} ${await res.text()}`)

  const prs = (await res.json()) as GithubPullRequest[]
  const drafts = prs.filter((pr) => pr.labels?.some((label) => label.name === DRAFT_LABEL))

  return Promise.all(
    drafts.map(async (pr) => ({
      number: pr.number,
      title: pr.title,
      branch: pr.head.ref,
      createdAt: pr.created_at,
      url: pr.html_url,
      slug: await getChangedPostSlug(token, pr.number),
    })),
  )
}

export async function mergePR(token: string, prNumber: number): Promise<void> {
  const res = await fetch(`${API_BASE}/pulls/${prNumber}/merge`, {
    method: 'PUT',
    headers: githubHeaders(token),
    body: JSON.stringify({ merge_method: 'squash' }),
  })
  if (!res.ok) throw new Error(`GitHub merge PR failed: ${res.status} ${await res.text()}`)
}

export async function closePR(token: string, prNumber: number): Promise<void> {
  const res = await fetch(`${API_BASE}/pulls/${prNumber}`, {
    method: 'PATCH',
    headers: githubHeaders(token),
    body: JSON.stringify({ state: 'closed' }),
  })
  if (!res.ok) throw new Error(`GitHub close PR failed: ${res.status} ${await res.text()}`)
}

export async function dispatchGeneratePost(token: string, topic?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/actions/workflows/generate-post.yml/dispatches`, {
    method: 'POST',
    headers: githubHeaders(token),
    body: JSON.stringify({ ref: 'main', inputs: topic ? { topic } : {} }),
  })
  if (!res.ok) throw new Error(`GitHub workflow dispatch failed: ${res.status} ${await res.text()}`)
}
