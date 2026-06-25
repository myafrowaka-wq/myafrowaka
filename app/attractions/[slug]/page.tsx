import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PortableText } from 'next-sanity'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ATTRACTION_BY_SLUG_QUERY, ALL_PUBLISHED_SLUGS_QUERY } from '@/sanity/lib/queries'
import { Badge } from '@/components/Badge'
import { FaqAccordion } from '@/components/FaqAccordion'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Attraction {
  _id: string
  attractionId?: string
  name: string
  slug: { current: string }
  subRegionProvince?: string
  continentRegion?: string
  latitude?: number
  longitude?: number
  type?: string[]
  unescoStatus?: string
  heritageEra?: string[]
  suitableFor?: string[]
  difficultyAccessLevel?: string
  entryFeeInternational?: number
  entryFeeLocal?: number
  entryFeeDisplayText?: string
  bestTimeToVisit?: string
  timeNeeded?: number
  gettingThere?: string
  nearestAirportIATA?: string
  nearestAirportDistanceKm?: number
  primaryBrandPillar?: string
  secondaryPillar?: string
  experienceTags?: string[]
  metaTitle?: string
  metaDescription?: string
  focusKeyword?: string
  secondaryKeywords?: string
  editorialSummary?: string
  googleMapsPlaceId?: string
  addressDirections?: string
  contentStatus: string
  lastVerifiedDate?: string
  articleBody?: unknown[]
  country?: { name: string; slug: string }
  city?: { name: string; slug: string }
  nearbyCities?: { name: string; slug: string }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVerifiedDate(raw: string): string {
  const d = new Date(raw + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_PUBLISHED_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const a = await client.fetch<Attraction | null>(ATTRACTION_BY_SLUG_QUERY, { slug })
  if (!a) return {}
  const title = a.metaTitle || `${a.name} – MyAfroWaka`
  const description = a.metaDescription || a.editorialSummary || ''
  return {
    title,
    description,
    openGraph: {
      title: a.metaTitle || a.name,
      description,
      type: 'article',
      images: [`https://picsum.photos/seed/${slug}-hero-v1/1200/630`],
    },
    twitter: {
      card: 'summary_large_image',
      title: a.metaTitle || a.name,
      description,
    },
  }
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(a: Attraction) {
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myafrowaka.com' },
    ...(a.country ? [{ '@type': 'ListItem', position: 2, name: a.country.name, item: `https://myafrowaka.com/countries/${a.country.slug}` }] : []),
    ...(a.city    ? [{ '@type': 'ListItem', position: 3, name: a.city.name,    item: `https://myafrowaka.com/cities/${a.city.slug}`    }] : []),
    {
      '@type': 'ListItem',
      position: (a.country ? 1 : 0) + (a.city ? 1 : 0) + 2,
      name: a.name,
      item: `https://myafrowaka.com/attractions/${a.slug.current}`,
    },
  ]

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TouristAttraction',
      name: a.name,
      description: a.editorialSummary || '',
      url: `https://myafrowaka.com/attractions/${a.slug.current}`,
      ...(a.latitude && a.longitude ? {
        geo: { '@type': 'GeoCoordinates', latitude: a.latitude, longitude: a.longitude },
      } : {}),
      ...(a.addressDirections ? {
        address: { '@type': 'PostalAddress', streetAddress: a.addressDirections },
      } : {}),
      ...(a.country ? { containedInPlace: { '@type': 'Country', name: a.country.name } } : {}),
      ...(a.unescoStatus ? {
        additionalProperty: { '@type': 'PropertyValue', name: 'UNESCO Status', value: a.unescoStatus },
      } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs,
    },
  ]
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AttractionPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const a = await client.fetch<Attraction | null>(ATTRACTION_BY_SLUG_QUERY, { slug })
  if (!a) notFound()

  const jsonLd = buildJsonLd(a)
  const locationParts = [a.city?.name, a.subRegionProvince, a.country?.name].filter(Boolean)

  const secondaryKws = a.secondaryKeywords
    ? a.secondaryKeywords.split('|').map(s => s.trim()).filter(Boolean)
    : []

  const faqItems = secondaryKws.slice(0, 6).map(kw => ({
    question: kw.charAt(0).toUpperCase() + kw.slice(1) + '?',
    answer: 'A detailed answer about this topic is being prepared for publication. For urgent queries, contact us at info@myafrowaka.com.',
  }))

  const hasContent = Array.isArray(a.articleBody) && a.articleBody.length > 0

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[480px] flex items-end">
        <Image
          src={`https://picsum.photos/seed/${slug}-hero-v1/1920/800`}
          alt={a.name}
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/65 to-ink/97"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">

          {/* Breadcrumb */}
          <nav className="flex flex-wrap gap-1 items-center font-mono text-[9px] uppercase tracking-[0.14em] text-cream/45 mb-6">
            <Link href="/" className="hover:text-cream/80 transition-colors">Home</Link>
            {a.country && (
              <>
                <span className="text-cream/25">/</span>
                <Link href={`/countries/${a.country.slug}`} className="hover:text-cream/80 transition-colors">
                  {a.country.name}
                </Link>
              </>
            )}
            {a.city && (
              <>
                <span className="text-cream/25">/</span>
                <Link href={`/cities/${a.city.slug}`} className="hover:text-cream/80 transition-colors">
                  {a.city.name}
                </Link>
              </>
            )}
            <span className="text-cream/25">/</span>
            <span className="text-cream/70">{a.name}</span>
          </nav>

          {/* Badges */}
          {(a.unescoStatus || (a.type && a.type.length > 0)) && (
            <div className="flex flex-wrap gap-2 mb-5">
              {a.unescoStatus && <Badge variant="unesco">UNESCO</Badge>}
              {a.type?.slice(0, 3).map(t => (
                <Badge key={t} variant="tag">{t.replace('UNESCO World Heritage Site | ', '')}</Badge>
              ))}
            </div>
          )}

          {/* H1 */}
          <h1
            className="font-display font-extrabold text-cream mb-4 max-w-3xl"
            style={{ fontSize: 'clamp(28px, 5vw, 64px)', lineHeight: '0.95', letterSpacing: '-0.025em' }}
          >
            {a.name}
          </h1>

          {/* Location */}
          {locationParts.length > 0 && (
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-400 mb-4">
              {locationParts.join(' · ')}
            </p>
          )}

          {/* Summary */}
          {a.editorialSummary && (
            <p className="font-sans text-cream/70 leading-relaxed max-w-2xl border-l-2 border-gold-400/50 pl-4"
              style={{ fontSize: 'clamp(14px, 1.4vw, 17px)' }}>
              {a.editorialSummary}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">

            {/* ── Main content (2/3) ──────────────────────────────────── */}
            <div className="lg:col-span-2 min-w-0">

              {hasContent ? (
                <div className="prose prose-lg max-w-none
                  prose-headings:font-display prose-headings:text-charcoal prose-headings:tracking-tight prose-headings:leading-tight
                  prose-h2:text-3xl prose-h2:mt-12 prose-h2:pb-3 prose-h2:border-b prose-h2:border-line
                  prose-h3:text-xl prose-h3:text-crimson
                  prose-p:text-charcoal/75 prose-p:leading-relaxed prose-p:font-sans
                  prose-a:text-crimson prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-charcoal prose-strong:font-semibold
                  prose-ul:text-charcoal/75 prose-li:leading-relaxed
                  prose-blockquote:border-l-4 prose-blockquote:border-gold-400
                  prose-blockquote:italic prose-blockquote:text-charcoal/60 prose-blockquote:not-italic">
                  <PortableText value={a.articleBody as Parameters<typeof PortableText>[0]['value']} />
                </div>
              ) : (
                <div className="space-y-10">

                  {a.gettingThere && (
                    <section>
                      <div className="w-8 h-px bg-gold-400 mb-5 opacity-60"/>
                      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-4"
                        style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', letterSpacing: '-0.015em' }}>
                        How to Get There
                      </h2>
                      <p className="font-sans text-[15px] text-charcoal/70 dark-flip-muted leading-relaxed whitespace-pre-line">
                        {a.gettingThere}
                      </p>
                      {a.addressDirections && (
                        <div className="mt-5 bg-sand dark-flip-surf rounded-2xl p-5 border border-line dark-flip-border">
                          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/35 dark-flip-muted mb-2">Address</p>
                          <p className="font-sans text-[14px] text-charcoal/75 dark-flip-muted">{a.addressDirections}</p>
                        </div>
                      )}
                    </section>
                  )}

                  {(a.entryFeeDisplayText || a.entryFeeInternational != null) && (
                    <section>
                      <div className="w-8 h-px bg-gold-400 mb-5 opacity-60"/>
                      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-4"
                        style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', letterSpacing: '-0.015em' }}>
                        Entry Fees
                      </h2>
                      {a.entryFeeDisplayText ? (
                        <p className="font-sans text-[15px] text-charcoal/70 dark-flip-muted leading-relaxed whitespace-pre-line">
                          {a.entryFeeDisplayText}
                        </p>
                      ) : (
                        <div className="flex gap-8">
                          {a.entryFeeInternational != null && (
                            <div>
                              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/35 dark-flip-muted mb-1">International</p>
                              <p className="font-display font-bold text-4xl text-charcoal dark-flip-text" style={{ letterSpacing: '-0.02em' }}>
                                {a.entryFeeInternational === 0 ? 'Free' : `$${a.entryFeeInternational}`}
                              </p>
                            </div>
                          )}
                          {a.entryFeeLocal != null && (
                            <div>
                              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/35 dark-flip-muted mb-1">Local / Resident</p>
                              <p className="font-display font-bold text-4xl text-charcoal dark-flip-text" style={{ letterSpacing: '-0.02em' }}>
                                {a.entryFeeLocal === 0 ? 'Free' : `$${a.entryFeeLocal}`}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                  {a.bestTimeToVisit && (
                    <section>
                      <div className="w-8 h-px bg-gold-400 mb-5 opacity-60"/>
                      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-4"
                        style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', letterSpacing: '-0.015em' }}>
                        Best Time to Visit
                      </h2>
                      <p className="font-sans text-[15px] text-charcoal/70 dark-flip-muted leading-relaxed whitespace-pre-line">
                        {a.bestTimeToVisit}
                      </p>
                    </section>
                  )}

                  {a.nearbyCities && a.nearbyCities.length > 0 && (
                    <section>
                      <div className="w-8 h-px bg-gold-400 mb-5 opacity-60"/>
                      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-4"
                        style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', letterSpacing: '-0.015em' }}>
                        Nearby Cities
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {a.nearbyCities.map(city => (
                          <Link
                            key={city.slug}
                            href={`/cities/${city.slug}`}
                            className="bg-sand dark-flip-surf hover:bg-gold-50 text-charcoal/70 dark-flip-muted text-[13px] font-sans px-4 py-2 rounded-full border border-line dark-flip-border hover:border-gold-300 transition-colors"
                          >
                            {city.name}
                          </Link>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* FAQ accordion */}
              {faqItems.length > 0 && (
                <section className="mt-12">
                  <div className="w-8 h-px bg-gold-400 mb-5 opacity-60"/>
                  <h2 className="font-display font-bold text-charcoal dark-flip-text mb-6"
                    style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', letterSpacing: '-0.015em' }}>
                    Frequently Asked Questions
                  </h2>
                  <FaqAccordion items={faqItems} />
                </section>
              )}

              {/* Experience tags */}
              {a.experienceTags && a.experienceTags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-line dark-flip-border">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-4">Tagged</p>
                  <div className="flex flex-wrap gap-2">
                    {a.experienceTags.map(tag => (
                      <span
                        key={tag}
                        className="bg-sand dark-flip-surf text-charcoal/60 dark-flip-muted text-[11px] font-mono px-3 py-1.5 rounded-full border border-line dark-flip-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {a.lastVerifiedDate && (
                <p className="mt-10 font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/25 dark-flip-muted">
                  Information last verified: {formatVerifiedDate(a.lastVerifiedDate)}
                </p>
              )}
            </div>

            {/* ── Sidebar (1/3) ────────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* At a Glance */}
              <div className="bg-ink rounded-3xl p-6 text-cream">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400 mb-5">At a Glance</p>
                <div className="space-y-0">
                  {a.country && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/35 mt-0.5 shrink-0">Country</span>
                      <span className="font-sans text-[13px] text-cream/80 text-right">{a.country.name}</span>
                    </div>
                  )}
                  {a.continentRegion && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/35 mt-0.5 shrink-0">Region</span>
                      <span className="font-sans text-[13px] text-cream/80 text-right">{a.continentRegion}</span>
                    </div>
                  )}
                  {(a.entryFeeDisplayText || a.entryFeeInternational != null) && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/35 mt-0.5 shrink-0">Entry</span>
                      <span className="font-sans text-[13px] text-cream/80 text-right">
                        {a.entryFeeDisplayText
                          ? a.entryFeeDisplayText.split('\n')[0]
                          : a.entryFeeInternational === 0
                            ? 'Free'
                            : `From $${a.entryFeeInternational} USD`}
                      </span>
                    </div>
                  )}
                  {a.bestTimeToVisit && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/35 mt-0.5 shrink-0">Best Time</span>
                      <span className="font-sans text-[13px] text-cream/80 text-right">{a.bestTimeToVisit}</span>
                    </div>
                  )}
                  {a.timeNeeded != null && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/35 mt-0.5 shrink-0">Time Needed</span>
                      <span className="font-sans text-[13px] text-cream/80 text-right">
                        {a.timeNeeded} hr{a.timeNeeded !== 1 ? 's' : ''} min
                      </span>
                    </div>
                  )}
                  {a.difficultyAccessLevel && (
                    <div className="flex items-start justify-between gap-3 py-3 border-b border-cream/10">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/35 mt-0.5 shrink-0">Access</span>
                      <span className="font-sans text-[13px] text-cream/80 text-right">{a.difficultyAccessLevel}</span>
                    </div>
                  )}
                  {a.unescoStatus && (
                    <div className="flex items-start justify-between gap-3 pt-3">
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/35 mt-0.5 shrink-0">UNESCO</span>
                      <span className="font-sans text-[12px] text-gold-300 text-right leading-snug">{a.unescoStatus}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Getting There */}
              {(a.nearestAirportIATA || a.addressDirections || a.googleMapsPlaceId) && (
                <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-5">Getting There</p>
                  <div className="space-y-4">
                    {a.nearestAirportIATA && (
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5 shrink-0">✈</span>
                        <div>
                          <p className="font-display font-semibold text-[13px] text-charcoal dark-flip-text">
                            {a.nearestAirportIATA}
                          </p>
                          {a.nearestAirportDistanceKm && (
                            <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted mt-0.5">
                              {a.nearestAirportDistanceKm} km away
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {a.addressDirections && (
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5 shrink-0">📍</span>
                        <p className="font-sans text-[12px] text-charcoal/60 dark-flip-muted leading-relaxed">
                          {a.addressDirections}
                        </p>
                      </div>
                    )}
                    {a.googleMapsPlaceId && (
                      <a
                        href={`https://www.google.com/maps/place/?q=place_id:${a.googleMapsPlaceId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors mt-1"
                      >
                        View on Google Maps
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Save to Trip */}
              <div className="border border-line dark-flip-border rounded-3xl p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-3">Plan Your Visit</p>
                <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text mb-5" style={{ letterSpacing: '-0.012em' }}>
                  Save this attraction to your trip planner.
                </p>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full bg-crimson hover:bg-crimson/90 text-cream font-display font-bold text-[12px] uppercase tracking-[0.1em] py-3.5 rounded-xl transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  Save Attraction
                </Link>
              </div>

              {/* Suitable For */}
              {a.suitableFor && a.suitableFor.length > 0 && (
                <div className="border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-4">Suitable For</p>
                  <div className="flex flex-wrap gap-2">
                    {a.suitableFor.map(s => (
                      <span key={s} className="bg-sand dark-flip-surf text-charcoal/65 dark-flip-muted font-sans text-[12px] px-3.5 py-1.5 rounded-full border border-line dark-flip-border">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Country link */}
              {a.country && (
                <Link
                  href={`/countries/${a.country.slug}`}
                  className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all"
                >
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-1">Explore more</p>
                    <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                      All attractions in {a.country.name}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-charcoal/25 group-hover:text-crimson transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </Link>
              )}

              {/* Report correction */}
              <a
                href={`mailto:info@myafrowaka.com?subject=Attraction Correction: ${encodeURIComponent(a.name)}`}
                className="flex items-center gap-2 justify-center font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/28 dark-flip-muted hover:text-charcoal/55 transition-colors py-2"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Report a correction
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
