import { dispatchGeneratePost } from './_lib/github'

interface Env {
  GITHUB_TOKEN: string
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let topic: string | undefined
  try {
    const body = (await request.json()) as { topic?: string }
    topic = body?.topic?.trim() || undefined
  } catch {
    // No body, or invalid JSON — topic just stays undefined (let generation pick one).
  }

  try {
    await dispatchGeneratePost(env.GITHUB_TOKEN, topic)
    return Response.json({ ok: true })
  } catch (err) {
    return new Response(`Failed to trigger generation: ${(err as Error).message}`, { status: 502 })
  }
}
