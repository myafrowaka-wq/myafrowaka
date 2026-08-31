import { client } from '@/sanity/lib/client'
import { ALL_ATTRACTIONS_QUERY, ALL_COUNTRIES_QUERY } from '@/sanity/lib/queries'

// Shared client-side suggestion index for the two typeahead search bars (the
// hero search and PlanTripCard's "Where to?" field). Fetched once and cached
// at module scope so both bars — and any future one — share a single
// Sanity round trip per page load instead of duplicating it.

export interface AttractionSuggestion {
  kind: 'attraction'
  name: string
  slug: string
  countryName?: string
}

export interface CountrySuggestion {
  kind: 'country'
  name: string
  slug: string
}

export type Suggestion = AttractionSuggestion | CountrySuggestion

let cache: Promise<Suggestion[]> | null = null

interface RawAttraction { name: string; slug: string; country?: { name: string } }
interface RawCountry { name: string; slug: string }

export function loadSuggestionIndex(): Promise<Suggestion[]> {
  if (!cache) {
    cache = Promise.all([
      client.fetch<RawAttraction[]>(ALL_ATTRACTIONS_QUERY).catch(() => []),
      client.fetch<RawCountry[]>(ALL_COUNTRIES_QUERY).catch(() => []),
    ]).then(([attractions, countries]) => [
      ...countries.map((c): CountrySuggestion => ({ kind: 'country', name: c.name, slug: c.slug })),
      ...attractions.map((a): AttractionSuggestion => ({
        kind: 'attraction', name: a.name, slug: a.slug, countryName: a.country?.name,
      })),
    ])
  }
  return cache
}

export function filterSuggestions(
  index: Suggestion[],
  query: string,
  opts: { kinds?: Array<Suggestion['kind']>; limit?: number } = {}
): Suggestion[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const kinds = opts.kinds ?? ['attraction', 'country']
  const limit = opts.limit ?? 7
  return index
    .filter(s => kinds.includes(s.kind) && s.name.toLowerCase().includes(q))
    // Names starting with the query outrank names that merely contain it.
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1
      return aStarts - bStarts || a.name.localeCompare(b.name)
    })
    .slice(0, limit)
}
