import type { MetadataRoute } from 'next'

// Session 5.3 — these internal/auth routes now also technically exist at
// /fr/... and /pt/... (everything moved under app/[locale] together, see
// that layout's own comment for why), even though nobody will ever reach
// them that way in practice. Disallowing both forms costs nothing and
// keeps this list honest about what actually resolves now.
const DISALLOWED_PATHS = [
  '/user-dashboard',
  '/dashboard',
  '/login',
  '/register',
  '/admin',
  '/studio',
  '/search',
  // Session 6.3 (WDOS Content Integrity gate, X-17) — an internal
  // design-system reference page, not real user content: its component
  // examples use placeholder href="#" links on purpose (they're showing
  // what a Button/Card looks like, not linking anywhere real). Nothing
  // in the site links to it, but it had no robots exclusion at all
  // before this, so it was technically crawlable/indexable.
  '/style-guide',
]

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://myafrowaka.com'
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          ...DISALLOWED_PATHS,
          ...DISALLOWED_PATHS.flatMap(p => [`/fr${p}`, `/pt${p}`]),
          '/api/',
          '/go/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
