import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_EVENTS_QUERY } from '@/sanity/lib/queries'
import { EventCard, type EventSummary } from '@/components/EventCard'
import { EVENT_REGIONS, matchesRegion, toSlug, fromSlug, regionAdjective } from '@/lib/eventFilters'
import { hreflangAlternates } from '@/lib/hreflang'
import { twitterCard } from '@/lib/twitterCard'

// Session 3.4 — "West African Festivals," one of the six discovery doors.

async function getRegionAndEvents(regionSlug: string) {
  const region = fromSlug(regionSlug, EVENT_REGIONS)
  if (!region) return { region: null, matching: [] as EventSummary[] }
  const events = await client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => [])
  return { region, matching: events.filter(e => matchesRegion(e, region)) }
}

export async function generateStaticParams() {
  const events = await client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => [])
  const regionsWithEvents = new Set(events.map(e => e.country?.continentRegion).filter(Boolean))
  return EVENT_REGIONS.filter(r => regionsWithEvents.has(r)).map(r => ({ region: toSlug(r) }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ region: string }> }
): Promise<Metadata> {
  const { region: regionSlug } = await params
  const { region, matching } = await getRegionAndEvents(regionSlug)
  if (!region || matching.length === 0) return {}

  const title = `${regionAdjective(region)} Festivals – MyAfroWaka`
  const description = `Verified festivals and dated events across ${region}, checked against an official source before they go live.`
  return {
    // Session 6.2 — see app/[locale]/login/page.tsx's comment: `absolute`
    // stops the parent title.template from double-appending "– MyAfroWaka".
    // openGraph's own title below is untouched — never templated.
    title: { absolute: title }, description,
    alternates: { canonical: `https://myafrowaka.com/events/region/${regionSlug}`, languages: hreflangAlternates(`https://myafrowaka.com/events/region/${regionSlug}`) },
    openGraph: { title, description, url: `https://myafrowaka.com/events/region/${regionSlug}` },
    // Session 6.3 (WDOS SEO gate) — see lib/twitterCard.ts: without this,
    // Twitter cards silently fell back to the layout's generic default.
    twitter: twitterCard({ title, description }),
  }
}

export default async function EventsByRegionPage(
  { params }: { params: Promise<{ region: string }> }
) {
  const { region: regionSlug } = await params
  const { region, matching } = await getRegionAndEvents(regionSlug)
  if (!region || matching.length === 0) notFound()

  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-6 flex gap-1">
          <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
          <span>/</span>
          <Link href="/events" className="hover:text-crimson transition-colors">Events</Link>
          <span>/</span>
          <span className="text-charcoal dark-flip-text">{region}</span>
        </nav>

        <h1 className="font-display font-bold text-charcoal dark-flip-text mb-3"
          style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}>
          {regionAdjective(region)} Festivals
        </h1>
        <p className="font-sans text-[15px] text-charcoal/60 dark-flip-muted mb-10">
          {matching.length} verified event{matching.length !== 1 ? 's' : ''} across {region}. <Link href="/events" className="text-crimson hover:text-crimson/70 underline underline-offset-2 transition-colors">Browse all events →</Link>
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matching.map(e => <EventCard key={e.slug} event={e} />)}
        </div>
      </div>
    </div>
  )
}
