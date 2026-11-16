import { ITEMS_BY_ID, ROADMAP } from './roadmapData'
import type { ItemProgress, RoadmapItem, RoadmapState } from './types'

export const DAY_MS = 86_400_000

export function emptyProgress(): ItemProgress {
  return { status: 'todo', checked: [], customTasks: [], notes: '', links: [] }
}

export function emptyState(): RoadmapState {
  return { version: 1, updatedAt: new Date(0).toISOString(), items: {} }
}

export function progressFor(state: RoadmapState, id: string): ItemProgress {
  return { ...emptyProgress(), ...state.items[id] }
}

/** Stable id from text so checkboxes survive reordering (but not rewording). */
function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

export interface ChecklistEntry {
  id: string
  label: string
  group?: string
  weight?: string
  custom?: boolean
}

export function checklistFor(item: RoadmapItem, progress: ItemProgress): ChecklistEntry[] {
  const entries: ChecklistEntry[] = []
  item.domains?.forEach((d) =>
    d.topics.forEach((t) => entries.push({ id: `d:${slug(t)}`, label: t, group: d.name, weight: d.weight })),
  )
  item.tasks?.forEach((t) => entries.push({ id: `t:${slug(t)}`, label: t }))
  progress.customTasks.forEach((t) => entries.push({ id: `c:${slug(t)}`, label: t, custom: true }))
  return entries
}

/** 0–1. Done is always 1; otherwise the share of the checklist ticked. */
export function completion(item: RoadmapItem, progress: ItemProgress): number {
  if (progress.status === 'done') return 1
  const list = checklistFor(item, progress)
  if (list.length === 0) return progress.status === 'doing' ? 0.05 : 0
  const ids = new Set(progress.checked)
  return list.filter((e) => ids.has(e.id)).length / list.length
}

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayLocal(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(iso: string, withYear = false): string {
  const d = parseDate(iso)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ''}`
}

export function formatRange(start: string, end: string): string {
  const s = parseDate(start)
  const e = parseDate(end)
  return `${formatDate(start, s.getFullYear() !== e.getFullYear())} – ${formatDate(end, true)}`
}

export function monthLabel(d: Date): string {
  return MONTHS[d.getMonth()]
}

/** Target date for an item: a booked exam date wins over the planned end. */
export function targetDate(item: RoadmapItem, progress: ItemProgress): string {
  return progress.examDate || item.end
}

export function dependentsOf(id: string): RoadmapItem[] {
  return ROADMAP.filter((i) => i.dependsOn?.includes(id))
}

/** Every item upstream and downstream of `id` (inclusive) — used to spotlight a path. */
export function relatedIds(id: string): Set<string> {
  const out = new Set<string>([id])
  const up = (x: string) =>
    ITEMS_BY_ID[x]?.dependsOn?.forEach((d) => {
      if (!out.has(d)) {
        out.add(d)
        up(d)
      }
    })
  const down = (x: string) =>
    dependentsOf(x).forEach((d) => {
      if (!out.has(d.id)) {
        out.add(d.id)
        down(d.id)
      }
    })
  up(id)
  down(id)
  return out
}
