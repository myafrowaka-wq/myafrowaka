// Session 4.2 — "the planner is fully usable while signed out. The work
// lives in the browser's own storage as they go, so nothing is lost."
// (Master Build Plan, Session 4.1's decided spec, carried into 4.2's build.)
// This is the single source of truth for that local draft's shape and
// storage, used by both the planner page and the "Save this trip" flow —
// the draft is never cleared except by an actual successful save, so a
// visitor who hits the auth wall, signs in, and lands back on
// /plan-a-trip finds the exact trip they were building, not a blank page.

export interface TripDraftItem {
  key: string
  kind: 'attraction' | 'event'
  slug: string
}

export interface TripDraftDay {
  date: string // ISO yyyy-mm-dd
  items: TripDraftItem[]
}

export interface TripDraft {
  countrySlug: string | null
  from: string // ISO yyyy-mm-dd, or ''
  to: string
  days: TripDraftDay[]
  tripName: string
}

export const EMPTY_DRAFT: TripDraft = {
  countrySlug: null,
  from: '',
  to: '',
  days: [],
  tripName: '',
}

const STORAGE_KEY = 'myafrowaka:trip-draft:v2'

export function loadTripDraft(): TripDraft {
  if (typeof window === 'undefined') return EMPTY_DRAFT
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_DRAFT
    const parsed = JSON.parse(raw) as Partial<TripDraft>
    return {
      countrySlug: typeof parsed.countrySlug === 'string' ? parsed.countrySlug : null,
      from: typeof parsed.from === 'string' ? parsed.from : '',
      to: typeof parsed.to === 'string' ? parsed.to : '',
      // Shape-checked, not just "is an array" — a value from a future
      // format, a manual edit, or a stale dev build's different shape
      // shouldn't be able to hand the app a day/item missing fields the
      // rest of the component reads unconditionally (day.items.some(...),
      // item.kind, item.slug) and crash the page rather than just show an
      // empty trip.
      days: Array.isArray(parsed.days)
        ? parsed.days.filter((d): d is TripDraftDay =>
            typeof d?.date === 'string' && Array.isArray(d.items)
          ).map(d => ({
            date: d.date,
            items: d.items.filter((i): i is TripDraftItem =>
              typeof i?.key === 'string' && typeof i?.slug === 'string' &&
              (i.kind === 'attraction' || i.kind === 'event')
            ),
          }))
        : [],
      tripName: typeof parsed.tripName === 'string' ? parsed.tripName : '',
    }
  } catch {
    return EMPTY_DRAFT
  }
}

export function saveTripDraft(draft: TripDraft): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    // Storage full or unavailable (private browsing) — the draft just
    // won't survive a reload. Non-fatal; the session still works.
  }
}

export function clearTripDraft(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Non-fatal.
  }
}

/**
 * Builds the list of ISO date strings (inclusive) between from and to.
 * Does every calculation in UTC, never local time: constructing a Date
 * from "2027-03-10T00:00:00" (no zone suffix) parses as *local* midnight,
 * and calling .toISOString() on that converts to UTC — which rolls back
 * to the previous day for any positive UTC offset (West Africa Time,
 * where this is being built, is UTC+1). Session 3.3 hit this exact class
 * of bug once already for event calendar dates; Date.UTC() + millisecond
 * arithmetic keeps the whole calculation in one timezone throughout so it
 * can't happen here.
 */
export function dateRange(from: string, to: string): string[] {
  if (!from || !to) return []
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  if ([fy, fm, fd, ty, tm, td].some(n => Number.isNaN(n))) return []
  const start = Date.UTC(fy, fm - 1, fd)
  const end = Date.UTC(ty, tm - 1, td)
  if (end < start) return []
  const DAY_MS = 24 * 60 * 60 * 1000
  const days: string[] = []
  // Cap at 60 days — a real trip, not an accidental year-long range from a
  // typo'd date, which would otherwise render 300+ empty day rows.
  let guard = 0
  for (let t = start; t <= end && guard < 60; t += DAY_MS, guard++) {
    days.push(new Date(t).toISOString().slice(0, 10))
  }
  return days
}
