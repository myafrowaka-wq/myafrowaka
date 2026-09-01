// Session 6.3 (WDOS SEO gate, X-16) — same root cause Session 5.3 already
// hit and fixed for `alternates` (see hreflang.ts's own comment): Next.js
// does not deep-merge metadata sub-objects between a layout and a page
// that both define them. app/[locale]/layout.tsx sets a site-wide default
// `twitter` block; any page that sets its own `openGraph` but not its own
// `twitter` silently keeps that generic site-wide fallback instead — found
// live on /destinations/kenya, where og:title correctly said "Kenya Travel
// Guide" but twitter:title still said the homepage's own title. 16 page
// files had this gap. `site`/`creator` stay constant (the same handle
// everywhere); everything else mirrors the page's own openGraph values.
export function twitterCard({
  title,
  description,
  images,
}: {
  title: string
  description: string
  images?: string[]
}) {
  return {
    card: 'summary_large_image' as const,
    site: '@myafrowaka_',
    creator: '@myafrowaka_',
    title,
    description,
    ...(images ? { images } : {}),
  }
}
