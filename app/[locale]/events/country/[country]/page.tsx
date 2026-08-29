import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_EVENTS_QUERY, ALL_COUNTRIES_QUERY } from '@/sanity/lib/queries'
import { EventCard, type EventSummary } from '@/components/EventCard'
import { matchesCountry } from '@/lib/eventFilters'
import { Flag } from '@/components/Flag'
import { hreflangAlternates } from '@/lib/hreflang'

// Session 3.4 — one of the six discovery doors into the same event
// database. Only generates for a country that actually has at least one
// published event, matching the same no-thin-pages discipline
// app/sitemap.ts already applies to country/city pages: an empty country
// page submitted to Google is thin content with nothing for a crawler to
// index, not a placeholder worth publishing.

interface CountryOption {
  name: string
  slug: string
  countryCode?: string
}

export async function generateStaticParams() {
  const [events, countries] = await Promise.all([
    client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => []),
    client.fetch<CountryOption[]>(ALL_COUNTRIES_QUERY).catch(() => []),
  ])
  const slugsWithEvents = new Set(events.map(e => e.country?.slug).filter(Boolean))
  return countries.filter(c => slugsWithEvents.has(c.slug)).map(c => ({ country: c.slug }))
}

async function getCountryAndEvents(countrySlug: string) {
  const [events, countries] = await Promise.all([
    client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => []),
    client.fetch<CountryOption[]>(ALL_COUNTRIES_QUERY).catch(() => []),
  ])
  const country = countries.find(c => c.slug === countrySlug) ?? null
  const matching = events.filter(e => matchesCountry(e, countrySlug))
  return { country, matching }
}

export async function generateMetadata(
  { params }: { params: Promise<{ country: string }> }
): Promise<Metadata> {
  const { country: countrySlug } = await params
  const { country, matching } = await getCountryAndEvents(countrySlug)
  if (!country || matching.length === 0) return {}

  const title = `Festivals in ${country.name} – MyAfroWaka`
  const description = `Verified festivals, celebrations, and dated events in ${country.name} — checked against an official source before they go live.`
  return {
    title, description,
    alternates: { canonical: `https://myafrowaka.com/events/country/${countrySlug}`, languages: hreflangAlternates(`https://myafrowaka.com/events/country/${countrySlug}`) },
    openGraph: { title, description, url: `https://myafrowaka.com/events/country/${countrySlug}` },
  }
}

export default async function EventsByCountryPage(
  { params }: { params: Promise<{ country: string }> }
) {
  const { country: countrySlug } = await params
  const { country, matching } = await getCountryAndEvents(countrySlug)
  if (!country || matching.length === 0) notFound()

  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-6 flex gap-1">
          <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
          <span>/</span>
          <Link href="/events" className="hover:text-crimson transition-colors">Events</Link>
          <span>/</span>
          <span className="text-charcoal dark-flip-text">{country.name}</span>
        </nav>

        <h1 className="font-display font-bold text-charcoal dark-flip-text mb-3 flex items-center gap-3"
          style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}>
          <Flag code={country.countryCode} className="text-3xl" />
          Festivals in {country.name}
        </h1>
        <p className="font-sans text-[15px] text-charcoal/60 dark-flip-muted mb-10">
          {matching.length} verified event{matching.length !== 1 ? 's' : ''}. <Link href="/events" className="text-crimson hover:text-crimson/70 underline underline-offset-2 transition-colors">Browse all events →</Link>
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matching.map(e => <EventCard key={e.slug} event={e} />)}
        </div>
      </div>
    </div>
  )
}
