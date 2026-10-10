// Regenerates public/og-image.png (1200×630) from scripts/og-image.html,
// filling in the template from the same constants the rest of the site
// uses — one source of truth, not a hand-maintained image.
//
// Usage: node scripts/og-image.mjs

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { readFile, writeFile, rm } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { PORTFOLIO, AVAILABILITY, POSITIONING } from '../src/constants/portfolio.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

async function main() {
  const template = await readFile(path.join(__dirname, 'og-image.html'), 'utf-8')
  const html = template
    .replace('__NAME__', PORTFOLIO.name)
    .replace('__HEADLINE__', POSITIONING.headline)
    .replace('__TAGLINE__', `${AVAILABILITY.titleSuffix} · ${PORTFOLIO.location}`)

  const tempPath = path.join(__dirname, '.og-image-render.html')
  await writeFile(tempPath, html, 'utf-8')

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
    await page.goto(`file://${tempPath}`)
    const outPath = path.join(root, 'public', 'og-image.png')
    await page.screenshot({ path: outPath })
    console.log(`[og-image] wrote ${path.relative(root, outPath)}`)
  } finally {
    await browser.close()
    await rm(tempPath, { force: true })
  }
}

main().catch((err) => {
  console.error('[og-image] failed:', err)
  process.exitCode = 1
})
