// Owner review (2026-09-06) — several homepage sections (the editorial
// slider, Featured Attractions, Stories from Across Africa) showed the
// exact same items every single visit: each query just ordered by recency
// and sliced the top N.
//
// Owner review (2026-09-10) — the daily seed wasn't enough: "I can load
// it again later today, and it's supposed to start from Nigeria." The
// homepage's randomised sections (Where Will You Go Next?, Explore by
// Experience, Featured Attractions, the editorial slider, From the
// Journal) now reshuffle on every page load — the homepage is
// `force-dynamic` so each request re-renders server-side with a fresh
// `shuffle()`. `dailyShuffle` is kept for anywhere a stable-per-day
// order is still wanted. mulberry32 is a small, fast, seedable PRNG —
// good enough for "pick a believable-random subset," not a cryptographic
// use.

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Days since the Unix epoch, in UTC — the same value for every visitor for a given calendar day, and only that. */
export function daysSinceEpoch(): number {
  return Math.floor(Date.now() / 86_400_000)
}

/**
 * Deterministically shuffles `items` using a seed. Pass a stable seed (e.g.
 * `daysSinceEpoch()`, optionally offset per-section so different sections
 * don't all reshuffle into the same order) to get "random-looking, but
 * identical for everyone until the seed changes."
 */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const rand = mulberry32(seed)
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Convenience: today's shuffle of `items`, offset by `salt` so sections drawing from overlapping pools don't land on the same order. */
export function dailyShuffle<T>(items: T[], salt = 0): T[] {
  return seededShuffle(items, daysSinceEpoch() + salt * 104_729) // 104729 is prime, just to spread salts apart
}

/**
 * A fresh, genuinely-random shuffle — different on every call. Use this
 * (not `dailyShuffle`) for content that should visibly re-order on a page
 * reload. Safe to call in a server component only when that route opts
 * out of static caching (`export const dynamic = 'force-dynamic'`),
 * otherwise the first render's order is frozen into the prerender.
 */
export function shuffle<T>(items: T[]): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
