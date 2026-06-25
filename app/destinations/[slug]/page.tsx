import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { DESTINATION_BY_SLUG_QUERY, ALL_COUNTRY_SLUGS_QUERY } from '@/sanity/lib/queries'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AttractionSummary {
  name: string
  slug: string
  type?: string[]
  editorialSummary?: string
  lastVerifiedDate?: string
  city?: { name: string }
}

interface Destination {
  name: string
  slug: { current: string }
  continentRegion?: string
  overview?: string
  quickFacts?: string
  flagEmoji?: string
  attractions: AttractionSummary[]
  relatedCountries?: { name: string; slug: string; flagEmoji?: string }[]
}

// ── Region colours ────────────────────────────────────────────────────────────

const REGION_COLOR: Record<string, string> = {
  'East Africa':          '#3F6A3D',
  'West Africa':          '#B55D39',
  'Southern Africa':      '#29251A',
  'North Africa':         '#A22E29',
  'Central Africa':       '#D5A942',
  'Indian Ocean Islands': '#3B403E',
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_COUNTRY_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const dest = await client.fetch<Destination | null>(DESTINATION_BY_SLUG_QUERY, { slug })
  if (!dest) return {}
  const title = `${dest.name} Travel Guide – MyAfroWaka`
  const description = dest.overview || `Discover attractions in ${dest.name}. Verified travel guides from MyAfroWaka.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [`https://picsum.photos/seed/${slug}-country-hero/1200/630`],
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DestinationPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const dest = await client.fetch<Destination | null>(DESTINATION_BY_SLUG_QUERY, { slug })
  if (!dest) notFound()

  const accentColor = dest.continentRegion ? (REGION_COLOR[dest.continentRegion] ?? '#B55D39') : '#B55D39'

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://myafrowaka.com'                          },
        { '@type': 'ListItem', position: 2, name: dest.name,     item: `https://myafrowaka.com/destinations/${slug}`      },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'TouristDestination',
      name: dest.name,
      description: dest.overview ?? '',
      url: `https://myafrowaka.com/destinations/${slug}`,
      ...(dest.continentRegion ? { containedInPlace: { '@type': 'Place', name: dest.continentRegion } } : {}),
    },
  ]

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[440px] flex items-end">
        <Image
          src={`https://picsum.photos/seed/${slug}-country-hero/1920/800`}
          alt={dest.name}
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/60 to-ink/95"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">
          <div className="flex items-end gap-5 flex-wrap mb-4">
            {dest.flagEmoji && (
              <span className="text-5xl leading-none shrink-0">{dest.flagEmoji}</span>
            )}
            <div>
              {dest.continentRegion && (
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] mb-2"
                  style={{ color: '#D4A853' }}>
                  {dest.continentRegion}
                </p>
              )}
              <h1
                className="font-display font-extrabold text-cream"
                style={{ fontSize: 'clamp(32px, 6vw, 72px)', lineHeight: '0.92', letterSpacing: '-0.03em' }}
              >
                {dest.name}
              </h1>
            </div>
          </div>

          {dest.overview && (
            <p className="font-sans text-cream/65 leading-relaxed max-w-2xl border-l-2 pl-4"
              style={{ fontSize: 'clamp(14px, 1.4vw, 17px)', borderColor: accentColor + '99' }}>
              {dest.overview}
            </p>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">

            {/* ── Attractions (2/3) ────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="flex items-baseline gap-3 mb-7">
                <h2 className="font-display font-bold text-charcoal dark-flip-text"
                  style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', letterSpacing: '-0.018em' }}>
                  Attractions in {dest.name}
                </h2>
                {dest.attractions.length > 0 && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted shrink-0">
                    {dest.attractions.length} published
                  </span>
                )}
              </div>

              {dest.attractions.length === 0 ? (
                <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-12 text-center">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/35 dark-flip-muted mb-2">
                    Coming soon
                  </p>
                  <p className="font-sans text-sm text-charcoal/40 dark-flip-muted">
                    Attraction guides for {dest.name} are being prepared for publication.
                  </p>
                  <Link href="/search" className="inline-flex items-center gap-2 mt-6 font-mono text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
                    Browse all Africa attractions
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {dest.attractions.map(a => {
                    const typeLabel = a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') ?? ''
                    return (
                      <Link
                        key={a.slug}
                        href={`/attractions/${a.slug}`}
                        className="group relative block bg-cream dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl overflow-hidden transition-all hover:shadow-[var(--shadow-soft)]"
                      >
                        <div className="h-[3px] transition-all" style={{ backgroundColor: accentColor }}/>
                        <div className="p-5">
                          {typeLabel && (
                            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted mb-2 truncate">
                              {typeLabel}
                            </p>
                          )}
                          <h3 className="font-display font-bold text-[16px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-1.5"
                            style={{ letterSpacing: '-0.012em' }}>
                            {a.name}
                          </h3>
                          {a.city && (
                            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/35 dark-flip-muted mb-2">
                              {a.city.name}
                            </p>
                          )}
                          {a.editorialSummary && (
                            <p className="font-sans text-[12px] text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2">
                              {a.editorialSummary}
                            </p>
                          )}
                          <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors">
                            Read guide
                            <span className="ml-1">&#8594;</span>
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* ── Sidebar (1/3) ────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* Quick facts */}
              {dest.quickFacts && (
                <div className="bg-ink rounded-3xl p-6 text-cream">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400 mb-4">Quick Facts</p>
                  <p className="font-sans text-[13px] text-cream/65 leading-relaxed whitespace-pre-line">
                    {dest.quickFacts}
                  </p>
                </div>
              )}

              {/* Region */}
              {dest.continentRegion && (
                <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-3">Region</p>
                  <Link href={`/search?region=${encodeURIComponent(dest.continentRegion)}`}
                    className="flex items-center justify-between group">
                    <span className="font-display font-bold text-[15px] text-charcoal dark-flip-text group-hover:text-crimson transition-colors"
                      style={{ letterSpacing: '-0.01em' }}>
                      {dest.continentRegion}
                    </span>
                    <svg className="w-4 h-4 text-charcoal/25 group-hover:text-crimson transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>
                  </Link>
                </div>
              )}

              {/* Browse all */}
              <Link href={`/search?q=${encodeURIComponent(dest.name)}`}
                className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-1">Search</p>
                  <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                    All {dest.name} results
                  </p>
                </div>
                <svg className="w-5 h-5 text-charcoal/25 group-hover:text-crimson transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>

              {/* Related countries */}
              {dest.relatedCountries && dest.relatedCountries.length > 0 && (
                <div className="border border-line dark-flip-border rounded-3xl p-6">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-4">
                    Also in {dest.continentRegion}
                  </p>
                  <div className="space-y-2">
                    {dest.relatedCountries.map(c => (
                      <Link key={c.slug} href={`/destinations/${c.slug}`}
                        className="flex items-center gap-3 py-1.5 group">
                        {c.flagEmoji && <span className="text-base shrink-0">{c.flagEmoji}</span>}
                        <span className="font-sans text-[13px] text-charcoal/65 dark-flip-muted group-hover:text-crimson transition-colors">
                          {c.name}
                        </span>
                        <svg className="w-3 h-3 text-charcoal/20 group-hover:text-crimson transition-colors ml-auto shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Correction link */}
              <a href={`mailto:info@myafrowaka.com?subject=Country Page Feedback: ${encodeURIComponent(dest.name)}`}
                className="flex items-center gap-2 justify-center font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/28 dark-flip-muted hover:text-charcoal/55 transition-colors py-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Suggest a correction
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
