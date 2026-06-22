import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from 'next-sanity'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ATTRACTION_BY_SLUG_QUERY, ALL_PUBLISHED_SLUGS_QUERY } from '@/sanity/lib/queries'
import { Badge } from '@/components/Badge'

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

function QuickFact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="py-3 pr-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 w-40 align-top pt-3.5">
        {label}
      </td>
      <td className="py-3 text-[13px] text-charcoal/80 font-sans leading-relaxed">{value}</td>
    </tr>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-4 mt-12 pb-2 border-b border-line">
      {children}
    </h2>
  )
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
  return {
    title: a.metaTitle || `${a.name} – MyAfroWaka`,
    description: a.metaDescription || a.editorialSummary || '',
    openGraph: {
      title: a.metaTitle || a.name,
      description: a.metaDescription || a.editorialSummary || '',
      type: 'article',
    },
  }
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────

function buildJsonLd(a: Attraction) {
  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home',       item: 'https://myafrowaka.com' },
    ...(a.country ? [{ '@type': 'ListItem', position: 2, name: a.country.name, item: `https://myafrowaka.com/countries/${a.country.slug}` }] : []),
    ...(a.city    ? [{ '@type': 'ListItem', position: 3, name: a.city.name,    item: `https://myafrowaka.com/cities/${a.city.slug}` }]    : []),
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
  const secondaryKws = a.secondaryKeywords
    ? a.secondaryKeywords.split('|').map(s => s.trim()).filter(Boolean)
    : []

  const locationParts = [a.city?.name, a.subRegionProvince, a.country?.name].filter(Boolean)

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* ── Hero band ──────────────────────────────────────────────── */}
      <div className="bg-sand border-b border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-12">

          {/* Breadcrumb */}
          <nav className="font-mono text-[10px] uppercase tracking-[0.12em] text-charcoal/40 mb-5 flex flex-wrap gap-1 items-center">
            <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
            {a.country && (
              <>
                <span>/</span>
                <Link href={`/countries/${a.country.slug}`} className="hover:text-ochre-600 transition-colors">
                  {a.country.name}
                </Link>
              </>
            )}
            {a.city && (
              <>
                <span>/</span>
                <Link href={`/cities/${a.city.slug}`} className="hover:text-ochre-600 transition-colors">
                  {a.city.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-charcoal">{a.name}</span>
          </nav>

          {/* Type badges */}
          {(a.type && a.type.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {a.unescoStatus && <Badge variant="unesco">UNESCO</Badge>}
              {a.type.map(t => (
                <Badge key={t} variant="tag">{t.replace('UNESCO World Heritage Site | ', '')}</Badge>
              ))}
            </div>
          )}

          {/* H1 */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-charcoal leading-[1.05] tracking-tight mb-4">
            {a.name}
          </h1>

          {/* Location line */}
          {locationParts.length > 0 && (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ochre-600 mb-5">
              {locationParts.join(' · ')}
            </p>
          )}

          {/* Editorial summary */}
          {a.editorialSummary && (
            <p className="font-sans text-lg md:text-xl text-charcoal/70 leading-relaxed max-w-2xl border-l-2 border-ochre-300 pl-5">
              {a.editorialSummary}
            </p>
          )}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Quick Overview */}
        <section className="bg-white border border-line rounded-2xl p-6 mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-600 mb-4">Quick Overview</p>
          <table className="w-full">
            <tbody>
              {a.country && <QuickFact label="Country" value={a.country.name} />}
              {a.continentRegion && <QuickFact label="Region" value={a.continentRegion} />}
              {a.type && a.type.length > 0 && (
                <QuickFact label="Type" value={
                  <span className="flex flex-wrap gap-1.5">
                    {a.type.map(t => (
                      <span key={t} className="bg-ochre-50 text-ochre-700 text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-ochre-200">
                        {t}
                      </span>
                    ))}
                  </span>
                } />
              )}
              {a.unescoStatus && <QuickFact label="UNESCO" value={a.unescoStatus} />}
              {a.suitableFor && a.suitableFor.length > 0 && (
                <QuickFact label="Suitable For" value={a.suitableFor.join(' · ')} />
              )}
              {a.difficultyAccessLevel && <QuickFact label="Difficulty" value={a.difficultyAccessLevel} />}
              {(a.entryFeeDisplayText || a.entryFeeInternational != null) && (
                <QuickFact label="Entry Fee" value={
                  a.entryFeeDisplayText || (
                    a.entryFeeInternational === 0
                      ? 'Free admission'
                      : `From $${a.entryFeeInternational} USD (international)`
                  )
                } />
              )}
              {a.bestTimeToVisit && <QuickFact label="Best Time" value={a.bestTimeToVisit} />}
              {a.timeNeeded != null && (
                <QuickFact label="Time Needed" value={`${a.timeNeeded} hour${a.timeNeeded !== 1 ? 's' : ''} minimum`} />
              )}
              {a.nearestAirportIATA && (
                <QuickFact label="Airport" value={
                  `${a.nearestAirportIATA}${a.nearestAirportDistanceKm ? ` · ${a.nearestAirportDistanceKm} km away` : ''}`
                } />
              )}
            </tbody>
          </table>
        </section>

        {/* Article body or fallback */}
        {a.articleBody && a.articleBody.length > 0 ? (
          <div className="prose prose-lg max-w-none
            prose-headings:font-display prose-headings:text-charcoal prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:pb-2 prose-h2:border-b prose-h2:border-line
            prose-h3:text-xl prose-h3:text-ochre-700
            prose-p:text-charcoal/80 prose-p:leading-relaxed prose-p:font-sans
            prose-a:text-ochre-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-charcoal prose-strong:font-semibold
            prose-ul:text-charcoal/80 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-ochre-300
            prose-blockquote:italic prose-blockquote:text-charcoal/65 prose-blockquote:not-italic">
            <PortableText value={a.articleBody as Parameters<typeof PortableText>[0]['value']} />
          </div>
        ) : (
          <div className="space-y-2">

            {a.gettingThere && (
              <section>
                <SectionHeading>How to Get There</SectionHeading>
                <p className="font-sans text-charcoal/80 leading-relaxed whitespace-pre-line">{a.gettingThere}</p>
                {a.addressDirections && (
                  <div className="mt-4 bg-sand rounded-xl p-4 font-mono text-sm text-charcoal/70">
                    <span className="text-ochre-600 uppercase text-[10px] tracking-[0.14em] block mb-1">Address</span>
                    {a.addressDirections}
                  </div>
                )}
              </section>
            )}

            {(a.entryFeeDisplayText || a.entryFeeInternational != null) && (
              <section>
                <SectionHeading>Entry Fees and Opening Hours</SectionHeading>
                {a.entryFeeDisplayText ? (
                  <p className="font-sans text-charcoal/80 leading-relaxed whitespace-pre-line">{a.entryFeeDisplayText}</p>
                ) : (
                  <div className="flex gap-8">
                    {a.entryFeeInternational != null && (
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ochre-600 block mb-1">International</span>
                        <span className="font-display text-3xl text-charcoal">
                          {a.entryFeeInternational === 0 ? 'Free' : `$${a.entryFeeInternational}`}
                        </span>
                      </div>
                    )}
                    {a.entryFeeLocal != null && (
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ochre-600 block mb-1">Local / Resident</span>
                        <span className="font-display text-3xl text-charcoal">
                          {a.entryFeeLocal === 0 ? 'Free' : `$${a.entryFeeLocal}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {a.bestTimeToVisit && (
              <section>
                <SectionHeading>Best Time to Visit</SectionHeading>
                <p className="font-sans text-charcoal/80 leading-relaxed whitespace-pre-line">{a.bestTimeToVisit}</p>
              </section>
            )}

            {a.nearbyCities && a.nearbyCities.length > 0 && (
              <section>
                <SectionHeading>Nearby Cities</SectionHeading>
                <div className="flex flex-wrap gap-2">
                  {a.nearbyCities.map(city => (
                    <Link
                      key={city.slug}
                      href={`/cities/${city.slug}`}
                      className="bg-sand hover:bg-ochre-50 text-charcoal/80 text-sm font-sans px-4 py-2 rounded-full border border-line hover:border-ochre-200 transition-colors"
                    >
                      {city.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {secondaryKws.length > 0 && (
              <section>
                <SectionHeading>Frequently Asked Questions</SectionHeading>
                <div className="space-y-3">
                  {secondaryKws.slice(0, 6).map((kw, i) => (
                    <details
                      key={i}
                      className="border border-line rounded-xl group overflow-hidden"
                    >
                      <summary className="px-5 py-4 cursor-pointer font-semibold font-sans text-charcoal list-none flex justify-between items-center hover:bg-sand/40 transition-colors">
                        <span>{kw.charAt(0).toUpperCase() + kw.slice(1)}?</span>
                        <span className="text-ochre-400 group-open:rotate-180 transition-transform duration-200 text-lg leading-none ml-3">
                          &#x2304;
                        </span>
                      </summary>
                      <div className="px-5 pb-4 pt-1 text-sm text-charcoal/65 font-sans leading-relaxed border-t border-line">
                        Full answer coming soon. This attraction guide is being prepared for publication.
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
          <div className="mt-12 pt-6 border-t border-line">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-charcoal/35 mr-3">Tagged</span>
            {a.experienceTags.map(tag => (
              <span
                key={tag}
                className="inline-block bg-moss-50 text-moss-700 text-[11px] font-mono px-3 py-1 rounded-full mr-2 mb-2 border border-moss-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Last verified */}
        {a.lastVerifiedDate && (
          <p className="mt-8 font-mono text-[10px] text-charcoal/30 uppercase tracking-[0.14em]">
            Last verified: {a.lastVerifiedDate}
          </p>
        )}
      </div>
    </>
  )
}
