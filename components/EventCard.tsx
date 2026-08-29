import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/lib/client'
import { Flag } from '@/components/Flag'
import { EVENT_CATEGORY_COLOR, EVENT_CATEGORY_COLOR_FALLBACK, VERIFICATION_STATUS_COLOR } from '@/lib/regionColors'
import { eventDateDisplay } from '@/lib/eventDateDisplay'

// Session 3.4 — extracted out of components/EventsExplorer.tsx (Session
// 3.2) so the card rendered on /events, and the one rendered on the five
// new /events/country|region|month|category|collections discovery pages
// (plus the "nearby events" list on the event template itself), are
// provably the same component, not five independent copies that could
// each start looking slightly different from the others.

const builder = imageUrlBuilder(client)
type SanityImage = Parameters<typeof builder.image>[0]

export interface EventSummary {
  name: string
  slug: string
  heroImage?: { image?: SanityImage; alt?: string } | null
  shortDescription?: string
  category?: string
  experienceTags?: string[]
  suitableFor?: string[]
  dateType?: string
  startDate?: string
  endDate?: string
  estimatedTiming?: string
  verificationStatus?: string
  country?: { name: string; slug: string; countryCode?: string; continentRegion?: string } | null
  city?: { name: string } | null
}

export function VerificationBadge({ status }: { status?: string }) {
  const label = status || 'Date to be confirmed'
  const color = VERIFICATION_STATUS_COLOR[label] ?? VERIFICATION_STATUS_COLOR['Date to be confirmed']
  return (
    <span
      className="inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full text-cream"
      style={{ backgroundColor: color }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cream/80"/>
      {label}
    </span>
  )
}

export function EventCard({ event }: { event: EventSummary }) {
  const accent = event.category ? (EVENT_CATEGORY_COLOR[event.category] ?? EVENT_CATEGORY_COLOR_FALLBACK) : EVENT_CATEGORY_COLOR_FALLBACK
  const { text: dateText, isConfirmedFact } = eventDateDisplay(event)
  const imgSrc = event.heroImage?.image ? builder.image(event.heroImage.image).width(600).height(400).fit('crop').url() : null

  return (
    <Link href={`/events/${event.slug}`}
      className="group block bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5">
      <div className="relative h-44 overflow-hidden bg-sand dark-flip-surf">
        {imgSrc ? (
          <Image src={imgSrc} alt={event.heroImage?.alt ?? event.name} fill
            sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: accent + '22' }}>
            <span className="font-display font-bold text-[14px] uppercase tracking-[0.14em]" style={{ color: accent }}>
              {event.category ?? 'Event'}
            </span>
          </div>
        )}
        {event.category && (
          <span className="absolute top-3 left-3 font-sans text-[14px] uppercase tracking-[0.12em] text-cream px-2.5 py-0.5 rounded-full"
            style={{ backgroundColor: accent + 'ee' }}>
            {event.category}
          </span>
        )}
      </div>
      <div className="p-5">
        {event.country && (
          <div className="flex items-center gap-1.5 mb-2">
            <Flag code={event.country.countryCode} />
            <span className="font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/55 dark-flip-muted">
              {[event.city?.name, event.country.name].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}
        <h3 className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2"
          style={{ letterSpacing: '-0.012em' }}>
          {event.name}
        </h3>
        <p className={`font-sans text-[14px] mb-3 ${isConfirmedFact ? 'text-charcoal/70 dark-flip-muted' : 'text-charcoal/45 dark-flip-muted italic'}`}>
          {dateText}
        </p>
        <VerificationBadge status={event.verificationStatus} />
      </div>
    </Link>
  )
}
