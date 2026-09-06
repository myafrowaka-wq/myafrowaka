// Owner review (2026-09-06) — several homepage sections (the editorial
// slider, Featured Attractions, Stories from Across Africa) showed the
// exact same items every single visit: each query just ordered by recency
// and sliced the top N. The owner's own words: "if I come to the site
// tomorrow, it should not show me the same list... show me something
// different." A page reload has to stay fast (no client-side fetch-then-
// shuffle flash of the wrong content) and every visitor loading the page
// in the same moment should see the same result (a real, testable page,
// not a different one per request), so this isn't per-request Math.random()
// — it's a deterministic shuffle seeded by the current UTC day, computed
// server-side. Same list all day, a different one once the date rolls
// over. mulberry32 is a small, fast, seedable PRNG — good enough for
// "pick a believable-random subset," not a cryptographic use.

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
