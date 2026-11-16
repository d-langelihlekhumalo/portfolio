export type LaneId = 'build' | 'read' | 'foundations' | 'cloud' | 'ai' | 'devops' | 'data' | 'skills'

export type ItemKind = 'certification' | 'fundamentals' | 'course' | 'book' | 'project' | 'skill'

/** core = the plan; strong = worth it this year; parked = only if it's rewarded or the role changes. */
export type Priority = 'core' | 'strong' | 'parked'

export type ArtifactKind =
  | 'study-guide'
  | 'cheat-sheet'
  | 'lab'
  | 'quiz'
  | 'notes'
  | 'tracker'
  | 'deck'
  | 'diagram'
  | 'other'

export interface ArtifactLink {
  title: string
  url: string
  kind: ArtifactKind
}

export interface ResourceLink {
  label: string
  url: string
}

export interface Domain {
  name: string
  /** As printed in the official study guide, e.g. "20–25%". Omitted when the guide doesn't publish one. */
  weight?: string
  topics: string[]
}

export interface RoadmapItem {
  id: string
  title: string
  /** Exam code or short label shown on the map, e.g. "AI-200". */
  code?: string
  kind: ItemKind
  lane: LaneId
  priority: Priority
  /** ISO date (YYYY-MM-DD). Ignored for parked items. */
  start: string
  /** ISO date. For certifications this is the target exam date. */
  end: string
  summary: string
  why: string
  outcome: string
  dependsOn?: string[]
  /** Exam skills outline — each topic becomes a checklist entry. */
  domains?: Domain[]
  /** Checklist for non-exam items. */
  tasks?: string[]
  skillsAsOf?: string
  resources: ResourceLink[]
  /**
   * Study artifacts made for this item (study guides, cheat sheets, labs…).
   * Committed links live here; links added from the UI are stored with
   * progress instead, so a new artifact never needs a redeploy.
   */
  artifacts: ArtifactLink[]
}

export interface Lane {
  id: LaneId
  label: string
}

export type ItemStatus = 'todo' | 'doing' | 'done'

export interface ItemProgress {
  status: ItemStatus
  /** Ids of checked checklist entries (see checklistFor in progress.ts). */
  checked: string[]
  /** Checklist entries added from the UI. */
  customTasks: string[]
  notes: string
  links: ArtifactLink[]
  /** Booked exam date, if different from the planned target. */
  examDate?: string
  score?: number
}

export interface RoadmapState {
  version: 1
  updatedAt: string
  items: Record<string, ItemProgress>
}
