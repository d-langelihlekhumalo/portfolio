// Static prerender step, run after `vite build`.
//
// This is a client-only React SPA: `dist/` ships with an empty
// `<div id="root">` per route and everything is rendered by JavaScript.
// Google's renderer usually copes with that, but Bing, DuckDuckGo, social-card
// scrapers, and every AI crawler (GPTBot, ClaudeBot, PerplexityBot, ...) do
// not execute JavaScript — they would see a blank page.
//
// To fix that without standing up a real SSR framework, this script serves
// the freshly built `dist/` locally, loads every public route in a real
// browser, waits for React to mount, and writes the fully rendered DOM back
// as that route's static HTML file. The bundled script tags are untouched,
// so real browsers still hydrate-by-remount and the page stays fully
// interactive — this only changes what non-JS clients receive on first
// paint. See index.css / index.html for the matching `js-animations` CSS
// escape hatch that keeps scroll-reveal content visible for them too.
//
// Route list is driven by src/generated/blog-index.json (written by
// scripts/generate-blog-index.mjs, which must run before this). /admin is
// never included here — it's gated and must never be publicly prerendered
// or cached.

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { preview } from 'vite'
import { chromium } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const SITE_URL = (process.env.VITE_SITE_URL || 'https://andilekhumalo.pages.dev').replace(/\/$/, '')

/** Route path -> output file under dist/, following Cloudflare Pages' clean-URL convention
 * (a directory's index.html, not `<slug>.html`). */
function outputPathFor(route) {
  const cleaned = route === '/' ? '' : route.replace(/^\//, '').replace(/\/$/, '')
  return path.join(root, 'dist', cleaned, 'index.html')
}

async function getRoutes() {
  const indexPath = path.join(root, 'src', 'generated', 'blog-index.json')
  let posts = []
  try {
    posts = JSON.parse(await readFile(indexPath, 'utf-8'))
  } catch {
    throw new Error(
      `[prerender] couldn't read ${path.relative(root, indexPath)} — did scripts/generate-blog-index.mjs run first?`,
    )
  }

  return {
    routes: ['/', '/blog', ...posts.map((p) => `/blog/${p.slug}`)],
    posts,
  }
}

async function snapshotRoute(browser, baseUrl, route) {
  const page = await browser.newPage({ colorScheme: 'dark' })
  const pageErrors = []
  page.on('pageerror', (err) => pageErrors.push(err))

  try {
    await page.goto(new URL(route, baseUrl).href, { waitUntil: 'networkidle', timeout: 30_000 })

    // Sanity check that React actually mounted before we snapshot the DOM.
    await page.waitForSelector('#root h1', { timeout: 10_000 })

    if (pageErrors.length > 0) {
      throw new Error(
        `${pageErrors.length} runtime error(s) rendering ${route}:\n` +
          pageErrors.map((e) => e.stack ?? String(e)).join('\n'),
      )
    }

    // The bootstrap inline script (index.html) marks JS as available before
    // hydration so scroll animations only run for clients that can run them.
    // Strip that mark before snapshotting: this file is exactly the
    // "JS not available yet" state non-JS clients will load it in.
    await page.evaluate(() => document.documentElement.classList.remove('js-animations'))

    return await page.evaluate(() => `<!doctype html>\n${document.documentElement.outerHTML}\n`)
  } finally {
    await page.close()
  }
}

function buildSitemap(routes, posts) {
  const dateBySlug = new Map(posts.map((p) => [p.slug, p.date]))
  const urls = routes.map((route) => {
    const slug = route.startsWith('/blog/') ? route.slice('/blog/'.length) : null
    const lastmod = slug ? dateBySlug.get(slug) : new Date().toISOString().slice(0, 10)
    const priority = route === '/' ? '1.0' : route === '/blog' ? '0.8' : '0.7'
    return (
      `  <url>\n` +
      `    <loc>${SITE_URL}${route === '/' ? '/' : route}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <priority>${priority}</priority>\n` +
      `  </url>`
    )
  })
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
  )
}

async function writeAdminShell() {
  // /admin is client-side-routed (gated, never prerendered) and needs its
  // own HTML shell for public/_redirects to rewrite to. Deliberately a flat
  // filename with NO extension at all — confirmed against the real
  // Cloudflare Pages edge (not just `wrangler pages dev`) that a
  // `_redirects` 200-status rewrite whose target ends in .html still gets
  // Cloudflare's automatic extension-stripping canonicalization applied
  // when served, turning the intended same-URL rewrite into a real 308
  // that changes the browser's URL and breaks client-side routing. A
  // target with no extension has nothing for that canonicalization to
  // strip. Content-Type is set explicitly in public/_headers since
  // Cloudflare can't infer text/html from an extensionless file.
  const shell = await readFile(path.join(root, 'dist', 'index.html'), 'utf-8')
  const adminShellPath = path.join(root, 'dist', 'admin-shell')
  await writeFile(adminShellPath, shell, 'utf-8')
  console.log(`[prerender] wrote ${path.relative(root, adminShellPath)} (admin SPA shell)`)
}

async function main() {
  const { routes, posts } = await getRoutes()

  // Must happen before the homepage snapshot below overwrites dist/index.html.
  await writeAdminShell()

  const server = await preview({
    root,
    preview: { host: '127.0.0.1', strictPort: false },
    logLevel: 'warn',
  })
  const baseUrl = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${server.config.preview.port}/`

  // Playwright's own managed Chromium build (not the system browser) — this
  // is what `npx playwright install chromium` provisions, both locally and
  // in CI, so the same browser build runs everywhere this script does.
  const browser = await chromium.launch()

  try {
    for (const route of routes) {
      const html = await snapshotRoute(browser, baseUrl, route)
      const outPath = outputPathFor(route)
      await mkdir(path.dirname(outPath), { recursive: true })
      await writeFile(outPath, html, 'utf-8')
      console.log(`[prerender] ${route} -> ${path.relative(root, outPath)} (${(html.length / 1024).toFixed(1)} KB)`)
    }

    const sitemapPath = path.join(root, 'dist', 'sitemap.xml')
    await writeFile(sitemapPath, buildSitemap(routes, posts), 'utf-8')
    console.log(`[prerender] wrote ${path.relative(root, sitemapPath)} (${routes.length} URLs)`)
  } finally {
    await browser.close()
    await new Promise((resolve, reject) =>
      server.httpServer.close((err) => (err ? reject(err) : resolve())),
    )
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err)
  process.exitCode = 1
})
