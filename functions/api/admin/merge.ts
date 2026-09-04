import { mergePR } from './_lib/github'

interface Env {
  GITHUB_TOKEN: string
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = (await request.json().catch(() => null)) as { prNumber?: number } | null
  const prNumber = body?.prNumber
  if (!prNumber) return new Response('Missing prNumber', { status: 400 })

  try {
    await mergePR(env.GITHUB_TOKEN, prNumber)
    return Response.json({ ok: true })
  } catch (err) {
    return new Response(`Failed to merge PR: ${(err as Error).message}`, { status: 502 })
  }
}
