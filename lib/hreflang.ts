const BASE = 'https://myafrowaka.com'

// Session 5.3 — "Add hreflang tags so Google knows which version to show
// which country." Every page's own generateMetadata() already computes a
// full canonical URL (a literal, a variable, or a template string) for
// `alternates.canonical` — this takes that same absolute URL and derives
// the /fr and /pt equivalents, matching localePrefix: 'as-needed' exactly
// (English stays unprefixed, French/Portuguese get a real path segment).
//
// Deliberately called per-page rather than relying only on
// app/[locale]/layout.tsx's own alternates.languages: Next.js does not
// deep-merge the `alternates` object between a layout and a page that both
// define it — whichever one is nearer to the rendered route wins wholesale,
// so any page with its own `alternates: { canonical }` would otherwise
// silently drop the layout's `languages` field entirely.
export function hreflangAlternates(canonicalUrl: string): Record<string, string> {
  const path = canonicalUrl.startsWith(BASE) ? canonicalUrl.slice(BASE.length) : canonicalUrl
  return {
    'x-default': `${BASE}${path}`,
    en: `${BASE}${path}`,
    fr: `${BASE}/fr${path}`,
    pt: `${BASE}/pt${path}`,
  }
}
