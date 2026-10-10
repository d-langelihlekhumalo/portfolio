import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { AVAILABILITY, PORTFOLIO, POSITIONING } from './src/constants/portfolio'

const SITE_TITLE = `${PORTFOLIO.name}, ${AVAILABILITY.titleSuffix}`
const SITE_DESCRIPTION = AVAILABILITY.metaDescription
const JSONLD_DESCRIPTION = `${POSITIONING.headline} ${POSITIONING.subhead}`

// Fills index.html's static <title>/meta/OG/JSON-LD defaults from the same
// AVAILABILITY_MODE constant usePageMeta uses for client-side route changes,
// so there's one source of truth instead of two hand-maintained copies.
function htmlMetaPlugin(): Plugin {
  return {
    name: 'portfolio-html-meta',
    transformIndexHtml(html) {
      return html
        .replaceAll('%SITE_TITLE%', SITE_TITLE)
        .replaceAll('%SITE_DESCRIPTION%', SITE_DESCRIPTION)
        .replaceAll('%JSONLD_DESCRIPTION%', JSONLD_DESCRIPTION)
        .replaceAll('%JSONLD_JOB_TITLE%', PORTFOLIO.title)
    },
  }
}

export default defineConfig({
  plugins: [react(), htmlMetaPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    open: true
  }
})
