import { useCallback, useEffect, useRef, useState } from 'react'
import { emptyProgress, emptyState } from './progress'
import type { ItemProgress, RoadmapState } from './types'

/*
 * Progress lives in two places:
 *
 * 1. localStorage — always written, so nothing is lost offline or in
 *    `npm run dev` (where there are no Pages Functions).
 * 2. Cloudflare KV via /api/admin/roadmap/state — when the ROADMAP_KV binding
 *    exists, so progress follows you between laptop and phone. That route
 *    sits under /api/admin/*, so the existing Access-JWT middleware guards it.
 *
 * Single user, so conflict handling is simply "newest updatedAt wins".
 */

const LOCAL_KEY = 'roadmap-state-v1'
const ENDPOINT = '/api/admin/roadmap/state'
const SAVE_DELAY_MS = 1000

export type SyncMode = 'loading' | 'cloud' | 'local'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function isState(v: unknown): v is RoadmapState {
  return (
    typeof v === 'object' &&
    v !== null &&
    (v as RoadmapState).version === 1 &&
    typeof (v as RoadmapState).items === 'object'
  )
}

function readLocal(): RoadmapState | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isState(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeLocal(state: RoadmapState) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(state))
  } catch {
    /* storage full or blocked — cloud copy (if any) still saves */
  }
}

/** null = endpoint unavailable (no KV binding, dev server, network). */
async function fetchRemote(): Promise<{ state: RoadmapState | null } | null> {
  try {
    const res = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } })
    if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) return null
    const body: unknown = await res.json()
    return { state: isState(body) ? body : null }
  } catch {
    return null
  }
}

async function pushRemote(state: RoadmapState): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    })
    return res.ok
  } catch {
    return false
  }
}

export function useRoadmapState() {
  const [state, setState] = useState<RoadmapState>(emptyState)
  const [mode, setMode] = useState<SyncMode>('loading')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const dirty = useRef(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const local = readLocal()
      const remote = await fetchRemote()
      if (cancelled) return

      if (remote === null) {
        setState(local ?? emptyState())
        setMode('local')
        return
      }

      const r = remote.state
      const newest = r && (!local || r.updatedAt >= local.updatedAt) ? r : local
      setState(newest ?? emptyState())
      setMode('cloud')
      // Local copy was newer (edited offline) — bring the cloud up to date.
      if (local && newest === local && local !== r) {
        dirty.current = true
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Persist after every change once loaded.
  useEffect(() => {
    if (mode === 'loading' || !dirty.current) return
    writeLocal(state)
    if (mode !== 'cloud') {
      setSaveStatus('saved')
      return
    }
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      const ok = await pushRemote(state)
      setSaveStatus(ok ? 'saved' : 'error')
      if (ok) dirty.current = false
    }, SAVE_DELAY_MS)
  }, [state, mode])

  // Flush a pending save if the tab is hidden mid-debounce.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && dirty.current && mode === 'cloud') {
        navigator.sendBeacon?.(ENDPOINT, new Blob([JSON.stringify(state)], { type: 'application/json' }))
      }
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [state, mode])

  const updateItem = useCallback((id: string, update: (p: ItemProgress) => ItemProgress) => {
    dirty.current = true
    setState((s) => ({
      ...s,
      updatedAt: new Date().toISOString(),
      items: { ...s.items, [id]: update({ ...emptyProgress(), ...s.items[id] }) },
    }))
  }, [])

  const replaceState = useCallback((next: RoadmapState) => {
    dirty.current = true
    setState({ ...next, updatedAt: new Date().toISOString() })
  }, [])

  return { state, mode, saveStatus, updateItem, replaceState, isState }
}
