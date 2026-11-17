// Salary profile for /admin/salary, stored as one JSON document in Workers KV.
// Lives under /api/admin/*, so ../_middleware.ts has already verified the
// Cloudflare Access JWT and the owner's email before this runs.
//
// Salary figures never go in the repo (it's public). Without a KV binding this
// returns 501 and the page keeps the profile in the browser only.

interface Env {
  ADMIN_KV?: KVNamespace
  /** Older name for the same namespace — still honoured. */
  ROADMAP_KV?: KVNamespace
}

const KEY = 'salary:profile:v1'
const MAX_BYTES = 64 * 1024

const kv = (env: Env) => env.ADMIN_KV ?? env.ROADMAP_KV

function notConfigured() {
  return Response.json({ error: 'ADMIN_KV binding not configured' }, { status: 501 })
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const store = kv(env)
  if (!store) return notConfigured()
  const stored = await store.get(KEY)
  return new Response(stored ?? 'null', { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
}

async function save({ request, env }: EventContext<Env, string, unknown>): Promise<Response> {
  const store = kv(env)
  if (!store) return notConfigured()
  const body = await request.text()
  if (body.length > MAX_BYTES) return Response.json({ error: 'Profile too large' }, { status: 413 })
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const p = parsed as { version?: unknown; updatedAt?: unknown; monthlyAmount?: unknown }
  if (p?.version !== 1 || typeof p.updatedAt !== 'string' || typeof p.monthlyAmount !== 'number') {
    return Response.json({ error: 'Unexpected profile shape' }, { status: 400 })
  }
  await store.put(KEY, body)
  return Response.json({ ok: true, updatedAt: p.updatedAt })
}

export const onRequestPut: PagesFunction<Env> = save
export const onRequestPost: PagesFunction<Env> = save
