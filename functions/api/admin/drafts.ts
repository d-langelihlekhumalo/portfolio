import { listDraftPRs } from './_lib/github'
import { getPreviewUrlForBranch } from './_lib/cloudflare'

interface Env {
  GITHUB_TOKEN: string
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  try {
    const prs = await listDraftPRs(env.GITHUB_TOKEN)
    const drafts = await Promise.all(
      prs.map(async (pr) => {
        const deploymentUrl = await getPreviewUrlForBranch(env, pr.branch)
        // Link straight to the actual new post, not the preview's homepage —
        // that's the whole point of the preview (reviewing the new content).
        const previewUrl = deploymentUrl && pr.slug ? `${deploymentUrl}/blog/${pr.slug}` : deploymentUrl
        return { ...pr, previewUrl }
      }),
    )
    return Response.json({ drafts })
  } catch (err) {
    return new Response(`Failed to list drafts: ${(err as Error).message}`, { status: 502 })
  }
}
