import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, ExternalLink, Check, X } from 'lucide-react'
import { Badge, Button } from '@/components'
import { cn } from '@/utils/cn'

interface Draft {
  number: number
  title: string
  branch: string
  createdAt: string
  url: string
  previewUrl: string | null
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText)
    throw new Error(message || `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

/**
 * Gated admin panel: generate a draft post, review it via its real Cloudflare
 * Pages preview, then approve (merge -> live) or reject (close the PR).
 * Access to this whole route is enforced by Cloudflare Access at the edge and
 * independently verified server-side by functions/api/admin/_middleware.ts —
 * this component assumes it's only ever reached by an authenticated owner.
 */
function AdminApp() {
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | 'generate' | null>(null)
  const [topic, setTopic] = useState('')

  const refresh = useCallback(async () => {
    setError(null)
    try {
      const data = await api<{ drafts: Draft[] }>('/admin/drafts')
      setDrafts(data.drafts)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleGenerate = async () => {
    setBusy('generate')
    setError(null)
    try {
      await api('/admin/generate', {
        method: 'POST',
        body: JSON.stringify({ topic: topic || undefined }),
      })
      setTopic('')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const handleApprove = async (prNumber: number) => {
    setBusy(prNumber)
    setError(null)
    try {
      await api('/admin/merge', { method: 'POST', body: JSON.stringify({ prNumber }) })
      await refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const handleReject = async (prNumber: number) => {
    setBusy(prNumber)
    setError(null)
    try {
      await api('/admin/reject', { method: 'POST', body: JSON.stringify({ prNumber }) })
      await refresh()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-3xl mx-auto px-4 md:px-10 py-10">
        <h1 className="text-3xl font-bold mb-2">Blog Admin</h1>
        <p className="text-text-secondary mb-8">Generate, review, and publish AI-drafted posts.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (optional — leave blank to pick one automatically)"
            className={cn(
              'flex-1 px-4 py-2 rounded-lg bg-surface border border-border text-text',
              'placeholder:text-text-secondary',
              'focus:outline-2 focus:outline-primary focus:outline-offset-2',
            )}
          />
          <Button onClick={handleGenerate} disabled={busy === 'generate'} isLoading={busy === 'generate'}>
            Generate Now
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Drafts awaiting review</h2>
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh drafts"
            className="text-text-secondary hover:text-primary transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {drafts === null && !error && <p className="text-text-secondary">Loading…</p>}
        {drafts?.length === 0 && <p className="text-text-secondary">No drafts waiting.</p>}

        <div className="flex flex-col gap-4">
          {drafts?.map((draft) => (
            <div key={draft.number} className="border border-border rounded-lg p-4 bg-surface">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-text">{draft.title}</h3>
                  <p className="text-xs text-text-secondary mt-1">
                    #{draft.number} · {draft.branch} · {new Date(draft.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline" size="sm">PR</Badge>
              </div>

              {draft.previewUrl ? (
                <div className="mt-4 rounded-lg overflow-hidden border border-border bg-background">
                  <iframe
                    src={draft.previewUrl}
                    title={`Preview of ${draft.title}`}
                    loading="lazy"
                    className="w-full h-[520px] block"
                  />
                </div>
              ) : (
                <p className="text-sm text-text-secondary mt-4">
                  Preview not ready yet — try refreshing shortly.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4">
                {draft.previewUrl && (
                  <a
                    href={draft.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    Open preview full-size
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                )}
                <a
                  href={draft.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-text transition-colors"
                >
                  View PR on GitHub
                </a>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="w-4 h-4" />}
                  onClick={() => handleApprove(draft.number)}
                  disabled={busy === draft.number}
                  isLoading={busy === draft.number}
                >
                  Approve &amp; Publish
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<X className="w-4 h-4" />}
                  onClick={() => handleReject(draft.number)}
                  disabled={busy === draft.number}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminApp
