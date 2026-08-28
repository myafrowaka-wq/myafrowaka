import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PortableText } from '@portabletext/react'
import imageUrlBuilder from '@sanity/image-url'
import { client } from '@/sanity/lib/client'
import { EVENT_BY_SLUG_QUERY, ALL_EVENT_SLUGS_QUERY } from '@/sanity/lib/queries'
import { Flag } from '@/components/Flag'
import { NotifyMeForm } from '@/components/NotifyMeForm'
import { VerificationBadge } from '@/components/EventCard'
import { eventDateDisplay } from '@/lib/eventDateDisplay'
import { hasConfirmedDate, buildGoogleCalendarUrl, buildICSDataUrl } from '@/lib/eventCalendar'
import { overallExperienceScore, SCORE_DIMENSIONS } from '@/lib/experienceScore'
import { EVENT_CATEGORY_COLOR, EVENT_CATEGORY_COLOR_FALLBACK } from '@/lib/regionColors'
import { stockImage } from '@/lib/stockImageCredits'
import { toSlug } from '@/lib/eventFilters'

const builder = imageUrlBuilder(client)
type SanityImage = Parameters<typeof builder.image>[0]

// ── Types ─────────────────────────────────────────────────────────────────────

interface NearbyAttraction {
  name: string; slug: string; editorialSummary?: string; type?: string[]; city?: { name: string }
}

interface NearbyEvent {
  name: string; slug: string; category?: string; heroImage?: { image?: SanityImage; alt?: string } | null
  dateType?: string; startDate?: string; endDate?: string; estimatedTiming?: string; verificationStatus?: string
  country?: { name: string; slug: string; countryCode?: string } | null
  city?: { name: string } | null
}

interface Event {
  _id: string
  eventId?: string
  name: string
  localName?: string
  heroImage?: { image?: SanityImage; alt?: string; photographerName?: string } | null
  shortDescription?: string
  fullDescription?: unknown[]
  category?: string
  experienceTags?: string[]
  dateType?: string
  startDate?: string
  endDate?: string
  estimatedTiming?: string
  isAnnual?: boolean
  verificationStatus?: string
  verifiedBy?: string
  verificationSourceUrl?: string
  verificationDate?: string
  cancelledNote?: string
  venue?: string
  addressDirections?: string
  latitude?: number
  longitude?: number
  scoreCulturalDepth?: number
  scoreInternationalAppeal?: number
  scoreMusic?: number
  scoreFood?: number
  scoreFamilySuitability?: number
  scoreAccessibility?: number
  scorePhotography?: number
  scoreTravelInfrastructure?: number
  scoringNotes?: string
  whatToExpect?: string
  safetyInfo?: string
  whatToWear?: string
  suggestedItinerary?: unknown[]
  gettingThere?: string
  whereToStay?: string
  costEstimate?: string
  nearestAirportIATA?: string
  suitableFor?: string[]
  culturalEtiquette?: string
  organizerName?: string
  organizerUrl?: string
  officialEventUrl?: string
  metaTitle?: string
  metaDescription?: string
  country?: { name: string; slug: string; countryCode?: string } | null
  city?: { name: string; slug: string } | null
  nearbyAttractions?: NearbyAttraction[]
  nearbyEvents?: NearbyEvent[]
}

// ── PortableText rendering ──────────────────────────────────────────────────

const ptComponents = {
  block: {
    normal: ({ children }: { children?: React.ReactNode }) => (
      <p className="font-sans text-[15px] text-charcoal/78 dark-flip-muted leading-[1.8] mb-5">{children}</p>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-display font-bold text-charcoal dark-flip-text mt-6 mb-3"
        style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', letterSpacing: '-0.012em' }}>{children}</h3>
    ),
  },
  marks: {
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-charcoal dark-flip-text">{children}</strong>
    ),
  },
  list: {
    bullet: ({ children }: { children?: React.ReactNode }) => (
      <ul className="font-sans text-[14px] text-charcoal/70 dark-flip-muted leading-relaxed space-y-1.5 mb-5 pl-5 list-disc">{children}</ul>
    ),
    number: ({ children }: { children?: React.ReactNode }) => (
      <ol className="font-sans text-[14px] text-charcoal/70 dark-flip-muted leading-relaxed space-y-1.5 mb-5 pl-5 list-decimal">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
    number: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  },
}

// ── Small building blocks ───────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-8 border-b border-line dark-flip-border last:border-none">
      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-4"
        style={{ fontSize: 'clamp(18px, 2vw, 24px)', letterSpacing: '-0.015em' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_EVENT_SLUGS_QUERY).catch(() => [])
  return slugs
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const event = await client.fetch<Event | null>(EVENT_BY_SLUG_QUERY, { slug }).catch(() => null)
  if (!event) return {}

  const title = event.metaTitle || `${event.name} – MyAfroWaka`
  const description = event.metaDescription || event.shortDescription || `${event.name}, verified by MyAfroWaka.`
  const canonicalUrl = `https://myafrowaka.com/events/${slug}`
  const ogImage = event.heroImage?.image
    ? builder.image(event.heroImage.image).width(1200).height(630).fit('crop').url()
    : stockImage('1531872036218-4e8a6828e339')

  return {
    title, description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, type: 'article', url: canonicalUrl, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  }
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(event: Event, slug: string) {
  const url = `https://myafrowaka.com/events/${slug}`
  const confirmed = hasConfirmedDate(event)
  const location = event.venue || event.city?.name || event.country?.name
    ? {
        '@type': 'Place',
        name: event.venue || `${event.city?.name ?? ''}${event.city?.name && event.country?.name ? ', ' : ''}${event.country?.name ?? ''}`,
        address: event.country?.name ? { '@type': 'PostalAddress', addressCountry: event.country.name } : undefined,
      }
    : undefined

  // GROQ returns explicit `null` for a missing optional field, not
  // `undefined` — so any of these spread directly into the object would
  // serialize as a literal "field": null in the JSON-LD rather than being
  // omitted the way an absent field should be. Every optional value below
  // is gated on truthiness before it's included, not just presence.
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    ...(event.shortDescription ? { description: event.shortDescription } : {}),
    url,
    // Structured data honesty rule, same as the visible page: never assert
    // a startDate/endDate unless it's actually Fixed + Verified. A search
    // engine reading eventStatus without a startDate is a smaller, honest
    // claim; a fabricated ISO date would be a bigger one.
    ...(confirmed ? { startDate: event.startDate, ...(event.endDate ? { endDate: event.endDate } : {}) } : {}),
    eventStatus: event.verificationStatus === 'Cancelled or postponed'
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    ...(location ? { location } : {}),
    ...(event.heroImage?.image ? { image: [builder.image(event.heroImage.image).width(1200).height(630).fit('crop').url()] } : {}),
    ...(event.organizerName
      ? { organizer: { '@type': 'Organization', name: event.organizerName, ...(event.organizerUrl ? { url: event.organizerUrl } : {}) } }
      : {}),
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function EventPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const event = await client.fetch<Event | null>(EVENT_BY_SLUG_QUERY, { slug }).catch(() => null)
  if (!event) notFound()

  const { text: dateText, isConfirmedFact } = eventDateDisplay(event)
  const accent = event.category ? (EVENT_CATEGORY_COLOR[event.category] ?? EVENT_CATEGORY_COLOR_FALLBACK) : EVENT_CATEGORY_COLOR_FALLBACK
  const overallScore = overallExperienceScore(event)
  const confirmed = hasConfirmedDate(event)
  const calendarFields = {
    name: event.name,
    dateType: event.dateType,
    startDate: event.startDate,
    endDate: event.endDate,
    verificationStatus: event.verificationStatus,
    venue: event.venue,
    city: event.city?.name,
    country: event.country?.name,
    shortDescription: event.shortDescription,
    officialEventUrl: event.officialEventUrl,
  }
  const googleCalUrl = buildGoogleCalendarUrl(calendarFields)
  const icsDataUrl = buildICSDataUrl(calendarFields)
  const heroImgSrc = event.heroImage?.image
    ? builder.image(event.heroImage.image).width(1920).height(900).fit('crop').url()
    : null

  // Session 4.2 — the real trip planner reads `eventSlug` directly (it
  // already has the full event list loaded, so it looks up the country
  // and everything else itself) rather than a redundant, less precise
  // `destination` name string this page would have to derive by hand.
  const planTripParams = new URLSearchParams({
    eventSlug: slug,
    ...(event.country?.slug ? { country: event.country.slug } : {}),
  })

  const jsonLd = buildJsonLd(event, slug)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[440px] flex items-end">
        {heroImgSrc ? (
          <Image src={heroImgSrc} alt={event.heroImage?.alt ?? event.name} fill priority className="object-cover object-center" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: accent }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/50 to-ink/10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 w-full pb-10 pt-24">
          <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-cream/55 mb-4 flex gap-1">
            <Link href="/" className="hover:text-gold-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/events" className="hover:text-gold-300 transition-colors">Events</Link>
            <span>/</span>
            <span className="text-cream/80">{event.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {event.category && (
              <Link href={`/events/category/${toSlug(event.category)}`}
                className="font-sans text-[14px] uppercase tracking-[0.12em] text-cream px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity"
                style={{ backgroundColor: accent + 'ee' }}>
                {event.category}
              </Link>
            )}
            <VerificationBadge status={event.verificationStatus} />
          </div>
          <h1 className="font-display font-extrabold text-cream mb-3"
            style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', lineHeight: '1.0', letterSpacing: '-0.02em' }}>
            {event.name}
          </h1>
          {event.localName && (
            <p className="font-sans text-cream/50 italic text-[15px] mb-3">{event.localName}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {event.country && (
              <Link href={`/events/country/${event.country.slug}`}
                className="inline-flex items-center gap-1.5 font-sans text-[15px] text-cream/85 hover:text-gold-300 transition-colors">
                <Flag code={event.country.countryCode} />
                {[event.city?.name, event.country.name].filter(Boolean).join(', ')}
              </Link>
            )}
            <span className={`font-sans text-[15px] ${isConfirmedFact ? 'text-cream/85' : 'text-cream/55 italic'}`}>{dateText}</span>
          </div>
        </div>
      </div>

      <div className="bg-cream dark-flip-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 py-10">

            {/* ── Main column ──────────────────────────────────────── */}
            <div className="lg:col-span-2 min-w-0">

              {(event.shortDescription || event.fullDescription) && (
                <Section title="What It Is and Why It Matters">
                  {event.shortDescription && (
                    <p className="font-sans text-[16px] text-charcoal/80 dark-flip-muted leading-relaxed mb-4 font-medium">
                      {event.shortDescription}
                    </p>
                  )}
                  {event.fullDescription && event.fullDescription.length > 0 && (
                    <PortableText value={event.fullDescription as never} components={ptComponents} />
                  )}
                </Section>
              )}

              <Section title="When It Happens">
                <p className={`font-sans text-[16px] mb-3 ${isConfirmedFact ? 'text-charcoal/80 dark-flip-muted font-medium' : 'text-charcoal/55 dark-flip-muted italic'}`}>
                  {dateText}
                </p>
                {event.verificationStatus === 'Cancelled or postponed' && event.cancelledNote && (
                  <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed mb-3">{event.cancelledNote}</p>
                )}
                {event.verificationStatus === 'Verified' && (
                  <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted">
                    Verified{event.verifiedBy ? ` by ${event.verifiedBy}` : ''}
                    {event.verificationDate ? ` on ${new Date(event.verificationDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                    {event.verificationSourceUrl && (
                      <> — <a href={event.verificationSourceUrl} target="_blank" rel="noopener noreferrer" className="text-crimson underline underline-offset-2 hover:text-crimson/70">official source</a></>
                    )}
                  </p>
                )}
                {event.verificationStatus !== 'Verified' && event.verificationStatus !== 'Cancelled or postponed' && (
                  <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted">
                    We have not yet confirmed an exact date against an official source. We would rather tell you that honestly than guess.
                  </p>
                )}
              </Section>

              {overallScore !== null && (
                <Section title="Why Travel for This">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="font-display font-extrabold text-crimson" style={{ fontSize: '44px', lineHeight: 1 }}>{overallScore}</span>
                      <span className="font-sans text-charcoal/40 dark-flip-muted text-lg">/5</span>
                    </div>
                    <div>
                      <p className="font-display font-bold text-charcoal dark-flip-text text-[15px]">MyAfroWaka Experience Score</p>
                      <Link href="/events/experience-score" className="font-sans text-[14px] text-crimson hover:text-crimson/70 underline underline-offset-2 transition-colors">
                        How we score this &rarr;
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {SCORE_DIMENSIONS.map(d => (
                      <div key={d.key} className="bg-white dark-flip-card border border-line dark-flip-border rounded-xl px-3 py-2.5">
                        <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted uppercase tracking-[0.06em] mb-0.5 leading-tight">{d.label}</p>
                        <p className="font-display font-bold text-charcoal dark-flip-text">{event[d.key]}<span className="text-charcoal/30 font-normal text-[14px]">/5</span></p>
                      </div>
                    ))}
                  </div>
                  {event.scoringNotes && (
                    <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted leading-relaxed mt-4 italic">{event.scoringNotes}</p>
                  )}
                </Section>
              )}

              {event.whatToExpect && (
                <Section title="What to Expect">
                  <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed whitespace-pre-line">{event.whatToExpect}</p>
                </Section>
              )}

              {event.gettingThere && (
                <Section title="Getting There">
                  <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed whitespace-pre-line">{event.gettingThere}</p>
                  {event.nearestAirportIATA && (
                    <p className="font-sans text-[14px] text-charcoal/50 dark-flip-muted mt-2">Nearest airport: {event.nearestAirportIATA}</p>
                  )}
                </Section>
              )}

              {event.whereToStay && (
                <Section title="Where to Stay">
                  <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed whitespace-pre-line">{event.whereToStay}</p>
                </Section>
              )}

              {event.costEstimate && (
                <Section title="What It Costs">
                  <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed whitespace-pre-line">{event.costEstimate}</p>
                </Section>
              )}

              {event.safetyInfo && (
                <Section title="Safety">
                  <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed whitespace-pre-line">{event.safetyInfo}</p>
                </Section>
              )}

              {event.whatToWear && (
                <Section title="What to Wear">
                  <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed whitespace-pre-line">{event.whatToWear}</p>
                </Section>
              )}

              {/* Cultural Etiquette — required at the schema level, so this
                  always renders for a published event. Deliberately never
                  wrapped in a conditional the way every other optional
                  section above is. */}
              <Section title="Cultural Etiquette">
                <div className="bg-gold-400/10 border border-gold-400/25 rounded-xl p-5">
                  <p className="font-sans text-[15px] text-charcoal/80 dark-flip-muted leading-relaxed whitespace-pre-line">{event.culturalEtiquette}</p>
                </div>
              </Section>

              {(event.nearbyAttractions?.length || event.nearbyEvents?.length) ? (
                <Section title="What Else Is Nearby">
                  {event.nearbyAttractions && event.nearbyAttractions.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      {event.nearbyAttractions.map(a => (
                        <Link key={a.slug} href={`/attractions/${a.slug}`}
                          className="block bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-xl p-4 transition-colors">
                          <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] mb-1">{a.name}</p>
                          {a.editorialSummary && <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2">{a.editorialSummary}</p>}
                        </Link>
                      ))}
                    </div>
                  )}
                  {event.nearbyEvents && event.nearbyEvents.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {event.nearbyEvents.map(e => (
                        <Link key={e.slug} href={`/events/${e.slug}`}
                          className="block bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-xl p-4 transition-colors">
                          <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] mb-1">{e.name}</p>
                          <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted">{eventDateDisplay(e).text}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </Section>
              ) : null}

              {event.suggestedItinerary && event.suggestedItinerary.length > 0 && (
                <Section title="A Suggested Itinerary">
                  <PortableText value={event.suggestedItinerary as never} components={ptComponents} />
                </Section>
              )}
            </div>

            {/* ── Sidebar ──────────────────────────────────────────── */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-5">

                {/* Calendar actions vs. Notify Me vs. neither — three
                    states, not two. Calendar actions need a real
                    confirmed date (same honesty rule as the date text
                    itself: a calendar invite is, if anything, a stronger
                    claim than a sentence of text). "Notify me when dates
                    are announced" only makes sense for an event that is
                    genuinely just awaiting a date — offering it on a
                    Cancelled/Postponed event would imply a return that
                    hasn't been confirmed either. */}
                {event.verificationStatus === 'Cancelled or postponed' ? null : (
                  <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-5">
                    {confirmed ? (
                      <>
                        <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] mb-3">Add to Your Calendar</p>
                        <div className="flex flex-col gap-2">
                          {googleCalUrl && (
                            <a href={googleCalUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 border border-line dark-flip-border rounded-xl py-2.5 font-sans text-[14px] text-charcoal dark-flip-text hover:border-crimson hover:text-crimson transition-colors">
                              Google Calendar
                            </a>
                          )}
                          {icsDataUrl && (
                            <a href={icsDataUrl} download={`${slug}.ics`}
                              className="inline-flex items-center justify-center gap-2 border border-line dark-flip-border rounded-xl py-2.5 font-sans text-[14px] text-charcoal dark-flip-text hover:border-crimson hover:text-crimson transition-colors">
                              Download .ics (Apple / Outlook)
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] mb-1">Notify Me When Dates Are Announced</p>
                        <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted mb-3">We only email you once — the day we&rsquo;ve verified a real date.</p>
                        <NotifyMeForm eventName={event.name} eventSlug={slug} />
                      </>
                    )}
                  </div>
                )}

                <Link href={`/plan-a-trip?${planTripParams.toString()}`}
                  className="block text-center bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] px-6 py-4 rounded-xl transition-colors">
                  Plan a Trip Around This Event
                </Link>

                {(event.organizerName || event.officialEventUrl) && (
                  <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-5">
                    <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] mb-2">Organizer</p>
                    {event.organizerName && <p className="font-sans text-[14px] text-charcoal/70 dark-flip-muted mb-1">{event.organizerName}</p>}
                    {event.officialEventUrl && (
                      <a href={event.officialEventUrl} target="_blank" rel="noopener noreferrer"
                        className="font-sans text-[14px] text-crimson underline underline-offset-2 hover:text-crimson/70 transition-colors">
                        Official event website &rarr;
                      </a>
                    )}
                  </div>
                )}

                {event.suitableFor && event.suitableFor.length > 0 && (
                  <div>
                    <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted mb-2">Suitable For</p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.suitableFor.map(s => (
                        <span key={s} className="font-sans text-[14px] text-charcoal/65 dark-flip-muted bg-sand dark-flip-surf border border-line dark-flip-border px-2.5 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
