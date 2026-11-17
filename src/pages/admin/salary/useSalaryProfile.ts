import { useCallback, useEffect, useRef, useState } from 'react'
import { emptyProfile, type EmployerProfile } from './employer'

/*
 * Same persistence model as the roadmap: always in localStorage, and in Workers
 * KV (behind the Access-gated /api/admin/* middleware) when ADMIN_KV is bound.
 * Newest updatedAt wins. Salary figures never touch the repo.
 */

const LOCAL_KEY = 'salary-profile-v1'
const ENDPOINT = '/api/admin/salary/profile'
const SAVE_DELAY_MS = 800

export type SyncMode = 'loading' | 'cloud' | 'local'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function isProfile(v: unknown): v is EmployerProfile {
  const p = v as EmployerProfile
  return typeof v === 'object' && v !== null && p.version === 1 && typeof p.monthlyAmount === 'number'
}

/** Fill any fields added after a profile was saved, so old profiles keep working. */
function withDefaults(p: EmployerProfile & { employerRiskMonthly?: number }): EmployerProfile {
  const d = emptyProfile()
  // v1 profiles had a single employerRiskMonthly figure instead of named cover lines.
  const legacyRisk = p.employerRiskMonthly
  const { employerRiskMonthly: _drop, ...rest } = p
  void _drop
  return {
    ...d,
    ...rest,
    retirement: {
      ...d.retirement,
      ...p.retirement,
      additional: { ...d.retirement.additional, ...p.retirement?.additional },
    },
    medical: { ...d.medical, ...p.medical },
    bonus: { ...d.bonus, ...p.bonus },
    increase: { ...d.increase, ...p.increase },
    allowances: p.allowances ?? [],
    deductions: p.deductions ?? [],
    riskBenefits:
      p.riskBenefits ?? (legacyRisk ? [{ id: 'risk', name: 'Risk cover', monthly: legacyRisk }] : d.riskBenefits),
    notes: p.notes ?? {},
  }
}

function readLocal(): EmployerProfile | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isProfile(parsed) ? withDefaults(parsed) : null
  } catch {
    return null
  }
}

function writeLocal(p: EmployerProfile) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(p))
  } catch {
    /* storage blocked — cloud copy (if any) still saves */
  }
}

export function useSalaryProfile() {
  const [profile, setProfile] = useState<EmployerProfile>(emptyProfile)
  const [mode, setMode] = useState<SyncMode>('loading')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const dirty = useRef(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const local = readLocal()
      let remote: EmployerProfile | null | undefined
      try {
        const res = await fetch(ENDPOINT, {
          headers: { Accept: 'application/json' },
        })
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const body: unknown = await res.json()
          remote = isProfile(body) ? withDefaults(body) : null
        }
      } catch {
        /* offline / dev server — local only */
      }
      if (cancelled) return
      if (remote === undefined) {
        setProfile(local ?? emptyProfile())
        setMode('local')
        return
      }
      const newest = remote && (!local || remote.updatedAt >= local.updatedAt) ? remote : local
      setProfile(newest ?? emptyProfile())
      setMode('cloud')
      if (local && newest === local) dirty.current = true
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (mode === 'loading' || !dirty.current) return
    writeLocal(profile)
    if (mode !== 'cloud') {
      setSaveStatus('saved')
      return
    }
    setSaveStatus('saving')
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(ENDPOINT, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        })
        setSaveStatus(res.ok ? 'saved' : 'error')
        if (res.ok) dirty.current = false
      } catch {
        setSaveStatus('error')
      }
    }, SAVE_DELAY_MS)
  }, [profile, mode])

  const update = useCallback((fn: (p: EmployerProfile) => EmployerProfile) => {
    dirty.current = true
    setProfile((p) => ({ ...fn(p), updatedAt: new Date().toISOString() }))
  }, [])

  const reset = useCallback(() => {
    dirty.current = true
    setProfile({ ...emptyProfile(), updatedAt: new Date().toISOString() })
  }, [])

  return { profile, mode, saveStatus, update, reset }
}
