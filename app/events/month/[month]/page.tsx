import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_EVENTS_QUERY } from '@/sanity/lib/queries'
import { EventCard, type EventSummary } from '@/components/EventCard'
import { EVENT_MONTHS, matchesMonth, toSlug, fromSlug } from '@/lib/eventFilters'

// Session 3.4 — "African Festivals in December," one of the six discovery
// doors. matchesMonth (lib/eventFilters.ts) is the exact same function the
// /events filter panel uses, so a lunar/Ethiopian event whose honest
// estimatedTiming text mentions this month shows up here too, not just
// events with a Fixed date that happens to fall in it.

async function getMonthAndEvents(monthSlug: string) {
  const month = fromSlug(monthSlug, EVENT_MONTHS)
  if (!month) return { month: null, matching: [] as EventSummary[] }
  const events = await client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => [])
  return { month, matching: events.filter(e => matchesMonth(e, month)) }
}

export async function generateStaticParams() {
  const events = await client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => [])
  return EVENT_MONTHS.filter(m => events.some(e => matchesMonth(e, m))).map(m => ({ month: toSlug(m) }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ month: string }> }
): Promise<Metadata> {
  const { month: monthSlug } = await params
  const { month, matching } = await getMonthAndEvents(monthSlug)
  if (!month || matching.length === 0) return {}

  const title = `African Festivals in ${month} – MyAfroWaka`
  const description = `Verified African festivals and dated events happening in ${month} — checked against an official source before they go live.`
  return {
    title, description,
    alternates: { canonical: `https://myafrowaka.com/events/month/${monthSlug}` },
    openGraph: { title, description, url: `https://myafrowaka.com/events/month/${monthSlug}` },
  }
}

export default async function EventsByMonthPage(
  { params }: { params: Promise<{ month: string }> }
) {
  const { month: monthSlug } = await params
  const { month, matching } = await getMonthAndEvents(monthSlug)
  if (!month || matching.length === 0) notFound()

  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-6 flex gap-1">
          <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
          <span>/</span>
          <Link href="/events" className="hover:text-crimson transition-colors">Events</Link>
          <span>/</span>
          <span className="text-charcoal dark-flip-text">{month}</span>
        </nav>

        <h1 className="font-display font-bold text-charcoal dark-flip-text mb-3"
          style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}>
          African Festivals in {month}
        </h1>
        <p className="font-sans text-[15px] text-charcoal/60 dark-flip-muted mb-10">
          {matching.length} verified event{matching.length !== 1 ? 's' : ''}. Includes events whose date isn&rsquo;t fixed but is honestly expected around this month. <Link href="/events" className="text-crimson hover:text-crimson/70 underline underline-offset-2 transition-colors">Browse all events →</Link>
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matching.map(e => <EventCard key={e.slug} event={e} />)}
        </div>
      </div>
    </div>
  )
}
