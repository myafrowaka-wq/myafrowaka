// Session 3.4 — shared with components/EventsExplorer.tsx (Session 3.2's
// filter panel) rather than each maintaining its own copy. Two independent
// implementations of "does this event match December" is exactly the kind
// of drift that let the ATTRACTION_IMAGES map disagree across 8 files
// before Session 2.4 — a visitor filtering by month on /events and a
// visitor arriving at /events/month/december should see the same events
// for the same reason, not two different, quietly-diverging definitions of
// "matches December."

export const EVENT_CATEGORIES = [
  'Music', 'Food and Drink', 'Cultural', 'Religious and Spiritual',
  'Arts / Film / Fashion', 'National Celebrations', 'Tourism Industry',
]

export const EVENT_REGIONS = [
  'North Africa', 'West Africa', 'East Africa',
  'Southern Africa', 'Central Africa', 'Indian Ocean Islands',
]

export const EVENT_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const EVENT_TRAVEL_STYLES = [
  'Solo Travelers', 'Couples', 'Families', 'Backpackers',
  'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
]

export const EVENT_VERIFICATION_STATUSES = [
  'Verified', 'Date to be confirmed', 'Annual, dates vary', 'Cancelled or postponed',
]

/** "West Africa" -> "West African" for page titles ("West African Festivals",
 *  matching the plan's own example). Only North/West/East/Southern/Central
 *  Africa take the adjectival "-n" form; Indian Ocean Islands already reads
 *  correctly as a plain noun phrase and isn't rewritten. */
export function regionAdjective(region: string): string {
  return region.endsWith('Africa') ? `${region}n` : region
}

/** Lowercase, hyphenated URL segment for a display value — "West Africa" -> "west-africa". */
export function toSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Reverse of toSlug against a known list — "west-africa" -> "West Africa", or null if no match. */
export function fromSlug(slug: string, options: string[]): string | null {
  return options.find(o => toSlug(o) === slug) ?? null
}

export interface FilterableEvent {
  category?: string
  suitableFor?: string[]
  verificationStatus?: string
  startDate?: string
  estimatedTiming?: string
  country?: { slug?: string; continentRegion?: string } | null
}

export function matchesCategory(event: FilterableEvent, category: string): boolean {
  return event.category === category
}

export function matchesRegion(event: FilterableEvent, region: string): boolean {
  return event.country?.continentRegion === region
}

export function matchesCountry(event: FilterableEvent, countrySlug: string): boolean {
  return event.country?.slug === countrySlug
}

export function matchesStyle(event: FilterableEvent, style: string): boolean {
  return (event.suitableFor ?? []).includes(style)
}

export function matchesStatus(event: FilterableEvent, status: string): boolean {
  return (event.verificationStatus ?? 'Date to be confirmed') === status
}

/** True if the event's real Fixed date falls in this month, OR its honest
 *  estimated-timing text mentions it (e.g. "Expected late March 2027"). */
export function matchesMonth(event: FilterableEvent, month: string): boolean {
  const monthIndex = EVENT_MONTHS.indexOf(month)
  const matchesStart = event.startDate ? new Date(event.startDate + 'T00:00:00').getMonth() === monthIndex : false
  const matchesEstimate = (event.estimatedTiming ?? '').toLowerCase().includes(month.toLowerCase())
  return matchesStart || matchesEstimate
}
