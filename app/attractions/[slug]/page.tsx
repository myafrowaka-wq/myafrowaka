import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from 'next-sanity'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ATTRACTION_BY_SLUG_QUERY, ALL_PUBLISHED_SLUGS_QUERY } from '@/sanity/lib/queries'
import Badge from '@/components/Badge'

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
  const attraction = await client.fetch<Attraction | null>(ATTRACTION_BY_SLUG_QUERY, { slug })
  if (!attraction) return {}
  return {
    title: attraction.metaTitle || `${attraction.name} – MyAfroWaka`,
    description: attraction.metaDescription || attraction.editorialSummary || '',
    openGraph: {
      title: attraction.metaTitle || attraction.name,
      description: attraction.metaDescription || attraction.editorialSummary || '',
      type: 'article',
    },
  }
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(a: Attraction) {
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myafrowaka.com' },
    ...(a.country ? [{ '@type': 'ListItem', position: 2, name: a.country.name, item: `https://myafrowaka.com/countries/${a.country.slug}` }] : []),
    ...(a.city ? [{ '@type': 'ListItem', position: 3, name: a.city.name, item: `https://myafrowaka.com/cities/${a.city.slug}` }] : []),
    { '@type': 'ListItem', position: (a.country ? 1 : 0) + (a.city ? 1 : 0) + 2, name: a.name, item: `https://myafrowaka.com/attractions/${a.slug.current}` },
  ]

  const schemas: unknown[] = [
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
      ...(a.unescoStatus ? { additionalProperty: { '@type': 'PropertyValue', name: 'UNESCO Status', value: a.unescoStatus } } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs,
    },
  ]

  return schemas
}

// ── Helper components ─────────────────────────────────────────────────────────

function QuickFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-sand">
      <td className="py-3 pr-4 font-mono text-xs uppercase tracking-wider text-ochre-600 w-40 align-top">{label}</td>
      <td className="py-3 text-sm text-charcoal">{value}</td>
    </tr>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-4 mt-10 pb-2 border-b-2 border-ochre-200">
      {children}
    </h2>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AttractionPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const a = await client.fetch<Attraction | null>(ATTRACTION_BY_SLUG_QUERY, { slug })
  if (!a) notFound()

  const jsonLd = buildJsonLd(a)
  const secondaryKws = a.secondaryKeywords
    ? a.secondaryKeywords.split('|').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <>
      {/* JSON-LD */}
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="font-mono text-xs uppercase tracking-wider text-charcoal/50 mb-6 flex flex-wrap gap-1 items-center">
          <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
          {a.country && (
            <>
              <span>/</span>
              <Link href={`/countries/${a.country.slug}`} className="hover:text-ochre-600 transition-colors">{a.country.name}</Link>
            </>
          )}
          {a.city && (
            <>
              <span>/</span>
              <Link href={`/cities/${a.city.slug}`} className="hover:text-ochre-600 transition-colors">{a.city.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-charcoal">{a.name}</span>
        </nav>

        {/* Hero */}
        <header className="mb-8">
          {/* Type badges */}
          {a.type && a.type.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {a.unescoStatus && <Badge variant="unesco">UNESCO</Badge>}
              {a.type.map(t => (
                <Badge key={t} variant="tag">{t.replace('UNESCO World Heritage Site | ', '')}</Badge>
              ))}
            </div>
          )}

          {/* H1 */}
          <h1 className="font-display text-4xl md:text-5xl text-charcoal leading-tight mb-3">
            {a.name}
          </h1>

          {/* Location line */}
          {(a.city || a.country) && (
            <p className="font-mono text-sm text-ochre-600 uppercase tracking-widest mb-4">
              {[a.city?.name, a.subRegionProvince, a.country?.name].filter(Boolean).join(' · ')}
            </p>
          )}

          {/* Editorial summary */}
          {a.editorialSummary && (
            <p className="text-lg text-charcoal/80 leading-relaxed border-l-4 border-ochre-400 pl-4 italic">
              {a.editorialSummary}
            </p>
          )}
        </header>

        {/* Quick Overview Table */}
        <section className="bg-sand rounded-xl p-6 mb-8">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ochre-600 mb-4">Quick Overview</h2>
          <table className="w-full">
            <tbody>
              {a.country && <QuickFact label="Country" value={a.country.name} />}
              {a.continentRegion && <QuickFact label="Region" value={a.continentRegion} />}
              {a.type && a.type.length > 0 && (
                <QuickFact label="Type" value={
                  <span className="flex flex-wrap gap-1">
                    {a.type.map(t => <span key={t} className="bg-ochre-100 text-ochre-800 text-xs px-2 py-0.5 rounded">{t}</span>)}
                  </span>
                } />
              )}
              {a.unescoStatus && <QuickFact label="UNESCO" value={a.unescoStatus} />}
              {a.suitableFor && a.suitableFor.length > 0 && (
                <QuickFact label="Suitable For" value={a.suitableFor.join(' · ')} />
              )}
              {a.difficultyAccessLevel && <QuickFact label="Difficulty" value={a.difficultyAccessLevel} />}
              {(a.entryFeeDisplayText || a.entryFeeInternational !== undefined) && (
                <QuickFact label="Entry Fee" value={
                  a.entryFeeDisplayText || (
                    a.entryFeeInternational === 0
                      ? 'Free'
                      : `From $${a.entryFeeInternational} USD (international)`
                  )
                } />
              )}
              {a.bestTimeToVisit && <QuickFact label="Best Time" value={a.bestTimeToVisit} />}
              {a.timeNeeded !== undefined && <QuickFact label="Time Needed" value={`${a.timeNeeded} hours minimum`} />}
              {a.nearestAirportIATA && (
                <QuickFact label="Nearest Airport" value={
                  `${a.nearestAirportIATA}${a.nearestAirportDistanceKm ? ` · ${a.nearestAirportDistanceKm} km away` : ''}`
                } />
              )}
            </tbody>
          </table>
        </section>

        {/* Article Body (rich text from Sanity) */}
        {a.articleBody && a.articleBody.length > 0 ? (
          <div className="prose prose-lg max-w-none
            prose-headings:font-display prose-headings:text-charcoal
            prose-h2:text-3xl prose-h2:mt-10 prose-h2:pb-2 prose-h2:border-b-2 prose-h2:border-ochre-200
            prose-h3:text-xl prose-h3:text-ochre-800
            prose-p:text-charcoal/85 prose-p:leading-relaxed
            prose-a:text-ochre-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-charcoal prose-strong:font-semibold
            prose-ul:text-charcoal/85 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-ochre-400 prose-blockquote:italic prose-blockquote:text-charcoal/70">
            <PortableText value={a.articleBody as Parameters<typeof PortableText>[0]['value']} />
          </div>
        ) : (
          /* Fallback sections when no article body yet */
          <div className="space-y-2">

            {/* Section 4: How to Get There */}
            {a.gettingThere && (
              <section>
                <SectionHeading>How to Get There</SectionHeading>
                <p className="text-charcoal/85 leading-relaxed whitespace-pre-line">{a.gettingThere}</p>
                {a.addressDirections && (
                  <div className="mt-4 bg-sand rounded-lg p-4 font-mono text-sm text-charcoal/70">
                    <span className="text-ochre-600 uppercase text-xs tracking-wider block mb-1">Address</span>
                    {a.addressDirections}
                  </div>
                )}
              </section>
            )}

            {/* Section 5: Entry Fees */}
            {(a.entryFeeDisplayText || a.entryFeeInternational !== undefined) && (
              <section>
                <SectionHeading>Entry Fees and Opening Hours</SectionHeading>
                {a.entryFeeDisplayText ? (
                  <p className="text-charcoal/85 leading-relaxed whitespace-pre-line">{a.entryFeeDisplayText}</p>
                ) : (
                  <div className="flex gap-6">
                    {a.entryFeeInternational !== undefined && (
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-ochre-600 block">International</span>
                        <span className="text-2xl font-display text-charcoal">
                          {a.entryFeeInternational === 0 ? 'Free' : `$${a.entryFeeInternational}`}
                        </span>
                      </div>
                    )}
                    {a.entryFeeLocal !== undefined && (
                      <div>
                        <span className="font-mono text-xs uppercase tracking-wider text-ochre-600 block">Local / Resident</span>
                        <span className="text-2xl font-display text-charcoal">
                          {a.entryFeeLocal === 0 ? 'Free' : `$${a.entryFeeLocal}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Section 6: Best Time to Visit */}
            {a.bestTimeToVisit && (
              <section>
                <SectionHeading>Best Time to Visit</SectionHeading>
                <p className="text-charcoal/85 leading-relaxed whitespace-pre-line">{a.bestTimeToVisit}</p>
              </section>
            )}

            {/* Section 9: Nearby Attractions */}
            {a.nearbyCities && a.nearbyCities.length > 0 && (
              <section>
                <SectionHeading>Nearby Cities</SectionHeading>
                <div className="flex flex-wrap gap-3">
                  {a.nearbyCities.map(city => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="bg-sand hover:bg-ochre-100 text-charcoal text-sm px-4 py-2 rounded-full border border-ochre-200 transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Section 13: FAQ (from secondary keywords) */}
            {secondaryKws.length > 0 && (
              <section>
                <SectionHeading>Frequently Asked Questions</SectionHeading>
                <div className="space-y-4">
                  {secondaryKws.slice(0, 6).map((kw, i) => (
                    <details key={i} className="border border-ochre-200 rounded-lg group">
                      <summary className="px-5 py-4 cursor-pointer font-semibold text-charcoal list-none flex justify-between items-center">
                        <span>{kw.charAt(0).toUpperCase() + kw.slice(1)}?</span>
                        <span className="text-ochre-400 group-open:rotate-180 transition-transform">▾</span>
                      </summary>
                      <div className="px-5 pb-4 text-charcoal/70 text-sm">
                        Full answer coming soon. This attraction is being prepared for publication.
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Experience tags */}
        {a.experienceTags && a.experienceTags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-sand">
            <span className="font-mono text-xs uppercase tracking-widest text-charcoal/40 mr-3">Experiences</span>
            {a.experienceTags.map(tag => (
              <span key={tag} className="inline-block bg-moss-100 text-moss-800 text-xs font-mono px-3 py-1 rounded-full mr-2 mb-2">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Last verified */}
        {a.lastVerifiedDate && (
          <p className="mt-8 font-mono text-xs text-charcoal/30 uppercase tracking-wider">
            Last verified: {a.lastVerifiedDate}
          </p>
        )}
      </div>
    </>
  )
}
