import { useEffect } from 'react'

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'https://andilekhumalo.pages.dev').replace(/\/$/, '')

interface PageMeta {
  title: string
  description: string
  /** Route path, e.g. '/', '/blog', '/blog/some-slug'. */
  path: string
}

function setMeta(selector: string, attr: string, value: string) {
  document.querySelector(selector)?.setAttribute(attr, value)
}

/**
 * Updates <title>, description, canonical, and OG/Twitter tags in place for
 * the current route. index.html ships static defaults (correct for the
 * homepage on a fresh load); this keeps them correct on every client-side
 * route change, and — since it runs before the prerender script snapshots
 * the DOM — bakes the right per-route tags into each page's static HTML too.
 */
export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => {
    const url = `${SITE_URL}${path}`

    document.title = title
    setMeta('meta[name="description"]', 'content', description)
    setMeta('link[rel="canonical"]', 'href', `${url}/`.replace(/\/+$/, '/'))
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[property="og:url"]', 'content', `${url}/`.replace(/\/+$/, '/'))
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
    setMeta('meta[name="twitter:url"]', 'content', `${url}/`.replace(/\/+$/, '/'))
  }, [title, description, path])
}
