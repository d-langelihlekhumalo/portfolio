// Static prerender step, run after `vite build`.
//
// This is a client-only React SPA: `dist/index.html` ships with an empty
// `<div id="root">` and everything is rendered by JavaScript. Google's
// renderer usually copes with that, but Bing, DuckDuckGo, social-card
// scrapers, and every AI crawler (GPTBot, ClaudeBot, PerplexityBot, ...) do
// not execute JavaScript — they would see a blank page.
//
// To fix that without standing up a real SSR framework for a single static
// page, this script serves the freshly built `dist/` locally, loads it in a
// real browser, waits for React to mount, and writes the fully rendered DOM
// back into `dist/index.html`. The bundled script tags are untouched, so
// real browsers still hydrate-by-remount and the page stays fully
// interactive — this only changes what non-JS clients receive on first
// paint. See index.css / index.html for the matching `js-animations` CSS
// escape hatch that keeps scroll-reveal content visible for them too.

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { writeFile } from 'node:fs/promises'
import { preview } from 'vite'
import { chromium } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function main() {
  const server = await preview({
    root,
    preview: { host: '127.0.0.1', strictPort: false },
    logLevel: 'warn',
  })

  const url = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${server.config.preview.port}/`

  // Use the system-installed Chrome rather than Playwright's managed browser
  // build — keeps this script working without a separate `playwright install`.
  const browser = await chromium.launch({ channel: 'chrome' })

  try {
    // Dark is the site's default theme (no stored preference / no system
    // preference in a clean browser context), matching what most visitors —
    // and every non-JS client — will actually see.
    const page = await browser.newPage({ colorScheme: 'dark' })

    const pageErrors = []
    page.on('pageerror', (err) => pageErrors.push(err))

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })

    // Sanity check that React actually mounted before we snapshot the DOM.
    await page.waitForSelector('#root h1', { timeout: 10_000 })

    if (pageErrors.length > 0) {
      throw new Error(
        `${pageErrors.length} runtime error(s) while rendering for prerender:\n` +
          pageErrors.map((e) => e.stack ?? String(e)).join('\n'),
      )
    }

    // The bootstrap inline script (index.html) marks JS as available before
    // hydration so scroll animations only run for clients that can run them.
    // Strip that mark before snapshotting: this file is exactly the
    // "JS not available yet" state non-JS clients will load it in.
    await page.evaluate(() => document.documentElement.classList.remove('js-animations'))

    const html = await page.evaluate(() => `<!doctype html>\n${document.documentElement.outerHTML}\n`)

    const outPath = path.join(root, 'dist', 'index.html')
    await writeFile(outPath, html, 'utf-8')
    console.log(
      `[prerender] wrote static snapshot to ${path.relative(root, outPath)} (${(html.length / 1024).toFixed(1)} KB)`,
    )
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
