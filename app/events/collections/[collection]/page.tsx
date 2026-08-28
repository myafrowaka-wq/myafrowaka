import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { EVENT_COLLECTION_BY_SLUG_QUERY, ALL_EVENT_COLLECTION_SLUGS_QUERY } from '@/sanity/lib/queries'
import { EVENT_CATEGORY_COLOR, EVENT_CATEGORY_COLOR_FALLBACK } from '@/lib/regionColors'
import { eventDateDisplay } from '@/lib/eventDateDisplay'
import { VerificationBadge, type EventSummary } from '@/components/EventCard'
import { Flag } from '@/components/Flag'

// Session 3.4 — "editorial picks," the one discovery door that isn't a
// filter. Mirrors app/guides/[slug]/page.tsx's numbered-list-with-framing
// pattern (the same job on attractions) rather than reusing the plain
// EventCard grid — a collection's whole point is the original framing text
// per item, which a grid of cards has no room for.

interface CollectionItem {
  framingText?: string
  event: EventSummary
}

interface Collection {
  title: string
  slug: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  items: CollectionItem[]
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_EVENT_COLLECTION_SLUGS_QUERY).catch(() => [])
  return slugs
}

export async function generateMetadata(
  { params }: { params: Promise<{ collection: string }> }
): Promise<Metadata> {
  const { collection: slug } = await params
  const collection = await client.fetch<Collection | null>(EVENT_COLLECTION_BY_SLUG_QUERY, { slug }).catch(() => null)
  if (!collection) return {}

  const title = collection.metaTitle || `${collection.title} – MyAfroWaka`
  const description = collection.metaDescription || collection.description || `A curated collection of African events from MyAfroWaka.`
  return {
    title, description,
    alternates: { canonical: `https://myafrowaka.com/events/collections/${slug}` },
    openGraph: { title, description, url: `https://myafrowaka.com/events/collections/${slug}` },
  }
}

export default async function EventCollectionPage(
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection: slug } = await params
  const collection = await client.fetch<Collection | null>(EVENT_COLLECTION_BY_SLUG_QUERY, { slug }).catch(() => null)
  if (!collection) notFound()

  const validItems = (collection.items ?? []).filter(item => item.event)

  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-6 flex gap-1">
          <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
          <span>/</span>
          <Link href="/events" className="hover:text-crimson transition-colors">Events</Link>
          <span>/</span>
          <span className="text-charcoal dark-flip-text">{collection.title}</span>
        </nav>

        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-3">Editorial Pick</p>
        <h1 className="font-display font-bold text-charcoal dark-flip-text mb-4"
          style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', letterSpacing: '-0.02em' }}>
          {collection.title}
        </h1>
        {collection.description && (
          <p className="font-sans text-[16px] text-charcoal/70 dark-flip-muted leading-relaxed mb-10 max-w-2xl">
            {collection.description}
          </p>
        )}

        {validItems.length === 0 ? (
          <p className="font-sans text-sm text-charcoal/40 dark-flip-muted italic">Events for this collection are being added.</p>
        ) : (
          <div className="space-y-5">
            {validItems.map((item, i) => {
              const e = item.event
              const accent = e.category ? (EVENT_CATEGORY_COLOR[e.category] ?? EVENT_CATEGORY_COLOR_FALLBACK) : EVENT_CATEGORY_COLOR_FALLBACK
              const { text: dateText, isConfirmedFact } = eventDateDisplay(e)
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={e.slug}
                  className="group bg-white dark-flip-card border border-line dark-flip-border rounded-3xl overflow-hidden hover:border-gold-300 hover:shadow-[var(--shadow-soft)] transition-all">
                  <div className="h-[3px]" style={{ backgroundColor: accent }}/>
                  <div className="p-6 sm:p-7 flex gap-5 sm:gap-7 items-start">
                    <span className="font-sans font-bold text-[28px] sm:text-[36px] leading-none shrink-0 mt-0.5"
                      style={{ color: accent + '55' }} aria-label={`Number ${i + 1}`}>
                      {num}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        {e.category && (
                          <span className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/38 dark-flip-muted">{e.category}</span>
                        )}
                        {e.country && (
                          <span className="inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/28 dark-flip-muted">
                            <Flag code={e.country.countryCode} />
                            {e.city?.name ? `${e.city.name}, ` : ''}{e.country.name}
                          </span>
                        )}
                        <VerificationBadge status={e.verificationStatus} />
                      </div>
                      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-1"
                        style={{ fontSize: 'clamp(17px, 2vw, 22px)', letterSpacing: '-0.015em', lineHeight: '1.15' }}>
                        {e.name}
                      </h2>
                      <p className={`font-sans text-[14px] mb-3 ${isConfirmedFact ? 'text-charcoal/60 dark-flip-muted' : 'text-charcoal/40 dark-flip-muted italic'}`}>{dateText}</p>
                      {item.framingText && (
                        <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed mb-4">{item.framingText}</p>
                      )}
                      {!item.framingText && e.shortDescription && (
                        <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted leading-relaxed mb-4 line-clamp-2">{e.shortDescription}</p>
                      )}
                      <Link href={`/events/${e.slug}`}
                        className="inline-flex items-center gap-2 font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
                        View this event
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
