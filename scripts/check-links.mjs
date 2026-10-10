// Requests every external link found in the built site and fails the build
// if any responds with something other than 2xx/3xx. Run after `npm run
// build` (reads dist/).
//
// Usage: node scripts/check-links.mjs

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, readdir } from 'node:fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const distDir = path.join(root, 'dist')
const SITE_URL = (process.env.VITE_SITE_URL || 'https://andilekhumalo.pages.dev').replace(/\/$/, '')

const HREF_PATTERN = /href="(https?:\/\/[^"]+)"/g

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) return htmlFiles(full)
      return entry.name.endsWith('.html') ? [full] : []
    }),
  )
  return files.flat()
}

async function externalLinks() {
  const files = await htmlFiles(distDir)
  const links = new Set()

  for (const file of files) {
    const html = await readFile(file, 'utf-8')
    for (const match of html.matchAll(HREF_PATTERN)) {
      const url = match[1]
      if (!url.startsWith(SITE_URL)) links.add(url)
    }
  }

  return [...links].sort()
}

async function checkLink(url) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    // Some servers (e.g. GitHub) reject HEAD on certain routes — fall back to GET.
    if (res.status === 405 || res.status === 403) {
      res = await fetch(url, { method: 'GET', redirect: 'follow' })
    }
    return { url, ok: res.status < 400, status: res.status }
  } catch (err) {
    return { url, ok: false, status: null, error: err.message }
  }
}

async function main() {
  const links = await externalLinks()
  if (links.length === 0) {
    console.log('[check-links] no external links found')
    return
  }

  console.log(`[check-links] checking ${links.length} external link(s)...`)
  const results = await Promise.all(links.map(checkLink))

  const failed = results.filter((r) => !r.ok)
  for (const r of results) {
    const label = r.ok ? 'OK ' : 'FAIL'
    console.log(`  [${label}] ${r.status ?? 'ERR'}  ${r.url}${r.error ? `  (${r.error})` : ''}`)
  }

  if (failed.length > 0) {
    console.error(`[check-links] ${failed.length}/${links.length} link(s) failed`)
    process.exitCode = 1
  } else {
    console.log(`[check-links] all ${links.length} link(s) OK`)
  }
}

main().catch((err) => {
  console.error('[check-links] failed:', err)
  process.exitCode = 1
})
