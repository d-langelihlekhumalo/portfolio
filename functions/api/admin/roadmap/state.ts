// Learning-roadmap progress for /admin/roadmap, stored as one JSON document
// in Workers KV. Lives under /api/admin/*, so ../_middleware.ts has already
// verified the Cloudflare Access JWT and the owner's email before this runs.
//
// The KV binding is optional: without it this returns 501 and the page falls
// back to saving progress in the browser (see useRoadmapState.ts). To enable
// cross-device sync, create a namespace and add the binding in wrangler.jsonc:
//   npx wrangler kv namespace create ROADMAP_KV

interface Env {
  ROADMAP_KV?: KVNamespace
}

const KEY = 'roadmap:state:v1'
const MAX_BYTES = 512 * 1024

function notConfigured() {
  return Response.json({ error: 'ROADMAP_KV binding not configured' }, { status: 501 })
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.ROADMAP_KV) return notConfigured()
  const stored = await env.ROADMAP_KV.get(KEY)
  return new Response(stored ?? 'null', { headers: { 'Content-Type': 'application/json' } })
}

async function save({ request, env }: EventContext<Env, string, unknown>): Promise<Response> {
  if (!env.ROADMAP_KV) return notConfigured()

  const body = await request.text()
  if (body.length > MAX_BYTES) {
    return Response.json({ error: 'Roadmap state too large' }, { status: 413 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const s = parsed as { version?: unknown; items?: unknown; updatedAt?: unknown }
  if (s?.version !== 1 || typeof s.items !== 'object' || s.items === null || typeof s.updatedAt !== 'string') {
    return Response.json({ error: 'Unexpected roadmap state shape' }, { status: 400 })
  }

  await env.ROADMAP_KV.put(KEY, body)
  return Response.json({ ok: true, updatedAt: s.updatedAt })
}

export const onRequestPut: PagesFunction<Env> = save
// navigator.sendBeacon (used to flush on tab close) can only POST.
export const onRequestPost: PagesFunction<Env> = save
