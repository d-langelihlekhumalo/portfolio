// Looks up the real Cloudflare Pages preview URL for a branch, rather than
// guessing at the preview-URL format — that isn't a stable public contract.

const PROJECT_NAME = 'andilekhumalo'

interface PagesDeployment {
  url: string
  deployment_trigger?: { metadata?: { branch?: string } }
}

interface Env {
  CLOUDFLARE_API_TOKEN: string
  CLOUDFLARE_ACCOUNT_ID: string
}

export async function getPreviewUrlForBranch(env: Env, branch: string): Promise<string | null> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments?per_page=25`,
    { headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` } },
  )
  if (!res.ok) return null

  const data = (await res.json()) as { result?: PagesDeployment[] }
  const deployment = data.result?.find((d) => d.deployment_trigger?.metadata?.branch === branch)
  return deployment?.url ?? null
}
