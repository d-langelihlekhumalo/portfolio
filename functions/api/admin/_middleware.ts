// Verifies the Cloudflare Access identity server-side for every route under
// /api/admin/*, rather than trusting the Access dashboard gate alone — a
// misconfigured or paused Access policy shouldn't leave a PR-merging
// endpoint open to the internet. Also don't trust the
// Cf-Access-Authenticated-User-Email header by itself; verify the signed
// JWT with jose against Cloudflare's own JWKS.

import { createRemoteJWKSet, jwtVerify } from 'jose'

interface Env {
  ADMIN_EMAIL: string
  CF_ACCESS_TEAM_DOMAIN: string
}

// Module-scope cache: Cloudflare Workers reuse isolates across requests
// where possible, so this (and jose's own internal JWKS cache) avoids
// re-fetching the JWKS on every request.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
let cachedDomain: string | null = null

function getJWKS(teamDomain: string) {
  if (!jwks || cachedDomain !== teamDomain) {
    jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`))
    cachedDomain = teamDomain
  }
  return jwks
}

export const onRequest: PagesFunction<Env> = async ({ request, env, next }) => {
  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  if (!token) {
    return new Response('Unauthorized: no Cf-Access-Jwt-Assertion header', { status: 401 })
  }

  try {
    const { payload } = await jwtVerify(token, getJWKS(env.CF_ACCESS_TEAM_DOMAIN))
    const email = typeof payload.email === 'string' ? payload.email : undefined

    if (!email || email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return new Response(`Forbidden: JWT email "${email}" does not match ADMIN_EMAIL`, { status: 403 })
    }
  } catch (err) {
    // TEMPORARY diagnostic detail — narrowing down a live auth failure.
    // Revert to a bare 401 once this is resolved; don't ship this long-term.
    return new Response(
      `Unauthorized: jwtVerify failed — ${(err as Error).name}: ${(err as Error).message}`,
      { status: 401 },
    )
  }

  return next()
}
