// Batch 1 (owner's "Honeymoon collection" request, 2026-09-06) — shared
// constant so the client and the API agree on what an un-named save means,
// rather than each hardcoding its own default string that could drift.
export const DEFAULT_COLLECTION = 'General'

/** Real, sourced pattern this borrows from: Pinterest boards and Kayak's
 * Wishlist both let the same saved place live in more than one collection
 * at once (see the UX Overhaul Roadmap artifact, section 5) — so this
 * only normalises blank/whitespace input to the default rather than
 * de-duplicating across collections. That de-dup happens server-side,
 * scoped to one (user, attraction, collection) triple, not one
 * (user, attraction) pair — see app/api/user/saved/route.ts.
 */
export function normalizeCollectionName(name: string | undefined | null): string {
  const trimmed = (name ?? '').trim()
  return trimmed.length > 0 ? trimmed.slice(0, 60) : DEFAULT_COLLECTION
}
