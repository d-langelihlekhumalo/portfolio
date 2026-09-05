import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components'
import { cn } from '@/utils/cn'
import { AdminHeader } from './AdminHeader'
import { DraftCard } from './DraftCard'
import type { Draft } from './types'

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
 * Gated admin panel: generate a draft post, review it inline against its
 * real Cloudflare Pages preview, then approve (merge -> live) or reject
 * (close the PR). Access to this whole route is enforced by Cloudflare
 * Access at the edge and independently verified server-side by
 * functions/api/admin/_middleware.ts — this component assumes it's only ever
 * reached by an authenticated owner.
 */
function AdminApp() {
  const [drafts, setDrafts] = useState<Draft[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [topic, setTopic] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

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
    setGenerating(true)
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
      setGenerating(false)
    }
  }

  const handleApprove = async (prNumber: number) => {
    await api('/admin/merge', { method: 'POST', body: JSON.stringify({ prNumber }) })
    setExpandedId(null)
    await refresh()
  }

  const handleReject = async (prNumber: number) => {
    await api('/admin/reject', { method: 'POST', body: JSON.stringify({ prNumber }) })
    setExpandedId(null)
    await refresh()
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <AdminHeader draftCount={drafts?.length ?? null} />

      <div className="max-w-5xl mx-auto px-4 md:px-10 py-10">
        <div className="flex flex-col sm:flex-row gap-3 mb-12 p-4 rounded-xl border border-border bg-surface/40">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Topic (optional — leave blank to pick one automatically)"
            className={cn(
              'flex-1 px-4 py-2 rounded-lg bg-background border border-border text-text',
              'placeholder:text-text-secondary',
              'focus:outline-2 focus:outline-primary focus:outline-offset-2',
            )}
          />
          <Button onClick={handleGenerate} disabled={generating} isLoading={generating}>
            Generate Now
          </Button>
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text">Drafts</h2>
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
        {drafts?.length === 0 && (
          <p className="text-text-secondary">No drafts waiting. Generate one above.</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {drafts?.map((draft) => (
            <DraftCard
              key={draft.number}
              draft={draft}
              expanded={expandedId === draft.number}
              onToggle={(d) => setExpandedId((cur) => (cur === d.number ? null : d.number))}
              onCollapse={() => setExpandedId(null)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminApp
