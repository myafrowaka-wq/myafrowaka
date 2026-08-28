import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_EVENTS_QUERY } from '@/sanity/lib/queries'
import { EventCard, type EventSummary } from '@/components/EventCard'
import { EVENT_CATEGORIES, matchesCategory, toSlug, fromSlug } from '@/lib/eventFilters'

// Session 3.4 — "African Music Festivals," one of the six discovery doors.

async function getCategoryAndEvents(categorySlug: string) {
  const category = fromSlug(categorySlug, EVENT_CATEGORIES)
  if (!category) return { category: null, matching: [] as EventSummary[] }
  const events = await client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => [])
  return { category, matching: events.filter(e => matchesCategory(e, category)) }
}

export async function generateStaticParams() {
  const events = await client.fetch<EventSummary[]>(ALL_EVENTS_QUERY).catch(() => [])
  const categoriesWithEvents = new Set(events.map(e => e.category).filter(Boolean))
  return EVENT_CATEGORIES.filter(c => categoriesWithEvents.has(c)).map(c => ({ category: toSlug(c) }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category: categorySlug } = await params
  const { category, matching } = await getCategoryAndEvents(categorySlug)
  if (!category || matching.length === 0) return {}

  const title = `African ${category} Festivals – MyAfroWaka`
  const description = `Verified ${category.toLowerCase()} events across Africa — checked against an official source before they go live.`
  return {
    title, description,
    alternates: { canonical: `https://myafrowaka.com/events/category/${categorySlug}` },
    openGraph: { title, description, url: `https://myafrowaka.com/events/category/${categorySlug}` },
  }
}

export default async function EventsByCategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category: categorySlug } = await params
  const { category, matching } = await getCategoryAndEvents(categorySlug)
  if (!category || matching.length === 0) notFound()

  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-6 flex gap-1">
          <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
          <span>/</span>
          <Link href="/events" className="hover:text-crimson transition-colors">Events</Link>
          <span>/</span>
          <span className="text-charcoal dark-flip-text">{category}</span>
        </nav>

        <h1 className="font-display font-bold text-charcoal dark-flip-text mb-3"
          style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}>
          African {category} Festivals
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
