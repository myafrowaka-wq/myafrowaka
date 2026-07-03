import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { DESTINATION_BY_SLUG_QUERY, ALL_COUNTRY_SLUGS_QUERY } from '@/sanity/lib/queries'
import { DestinationSearch } from '@/components/DestinationSearch'
import { TypewriterHero } from '@/components/TypewriterHero'
import { ParallaxHero } from '@/components/ParallaxHero'
import { PopularPills } from '@/components/PopularPills'

interface AttractionSummary {
  name: string; slug: string; type?: string[]; editorialSummary?: string
  lastVerifiedDate?: string; city?: { name: string }
}

interface Destination {
  name: string; slug: { current: string }; continentRegion?: string
  overview?: string; quickFacts?: string; flagEmoji?: string
  attractions: AttractionSummary[]
  relatedCountries?: { name: string; slug: string; flagEmoji?: string }[]
}

const REGION_COLOR: Record<string, string> = {
  'East Africa':          '#3F6A3D',
  'West Africa':          '#B55D39',
  'Southern Africa':      '#29251A',
  'North Africa':         '#A22E29',
  'Central Africa':       '#D5A942',
  'Indian Ocean Islands': '#3B403E',
}

const ITEMS_PER_PAGE = 12

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_COUNTRY_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const dest = await client.fetch<Destination | null>(DESTINATION_BY_SLUG_QUERY, { slug })
  if (!dest) return {}
  const title = `${dest.flagEmoji ? dest.flagEmoji + ' ' : ''}${dest.name} Travel Guide – MyAfroWaka`
  const description = dest.overview || `Discover attractions in ${dest.name}. Verified travel guides from MyAfroWaka.`
  const canonicalUrl = `https://myafrowaka.com/destinations/${slug}`
  return {
    title, description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title, description, type: 'website',
      url: canonicalUrl,
      images: [`https://picsum.photos/seed/${slug}-country-hero/1200/630`],
    },
  }
}

export default async function DestinationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { slug }               = await params
  const { page: pageParam, q } = await searchParams
  const currentPage            = Math.max(1, parseInt(pageParam ?? '1', 10))
  const dest = await client.fetch<Destination | null>(DESTINATION_BY_SLUG_QUERY, { slug })
  if (!dest) notFound()

  const filtered = q
    ? dest.attractions.filter(a =>
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.city?.name.toLowerCase().includes(q.toLowerCase())
      )
    : dest.attractions

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(currentPage, totalPages)
  const start      = (safePage - 1) * ITEMS_PER_PAGE
  const pageItems  = filtered.slice(start, start + ITEMS_PER_PAGE)
  const popularPills = dest.attractions.slice(0, 12).map(a => ({ label: a.name, slug: a.slug }))

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',    item: 'https://myafrowaka.com' },
        { '@type': 'ListItem', position: 2, name: dest.name, item: `https://myafrowaka.com/destinations/${slug}` },
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

      {/* Hero — matches homepage hero style */}
      <div className="relative min-h-[94vh] flex items-center overflow-hidden">
        <ParallaxHero>
        <Image
          src={`https://picsum.photos/seed/${slug}-country-hero/1920/1080`}
          alt={dest.name} fill priority
          className="object-cover object-center scale-110"
        />
        </ParallaxHero>
        <div className="absolute inset-0 bg-gradient-to-r from-[#070F09]/96 via-[#0A1A0C]/88 to-[#0E2010]/55"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#070F09]/60 via-transparent to-[#070F09]/15"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 lg:py-28">
          {dest.continentRegion && (
            <p className="font-inter text-[9px] uppercase tracking-[0.22em] mb-4" style={{ color: '#D4A853' }}>
              {dest.flagEmoji && <span className="mr-2">{dest.flagEmoji}</span>}
              {dest.continentRegion}
            </p>
          )}

          <h1
            className="font-display font-extrabold text-cream mb-6 tracking-hero"
            style={{ fontSize: 'clamp(46px, 4.2vw, 64px)', lineHeight: '0.94', letterSpacing: '-0.025em' }}
          >
            <TypewriterHero
              speed={28}
              lines={[
                { text: `Explore `, noBreakAfter: true },
                { text: `${dest.name},`, className: 'text-crimson' },
                { text: ' One Adventure at a Time.' },
              ]}
            />
          </h1>

          {dest.overview && (
            <p className="font-display font-medium text-cream/75 mb-8 max-w-lg leading-relaxed"
              style={{ fontSize: 'clamp(13px, 1.5vw, 16px)' }}>
              {dest.overview}
            </p>
          )}

          <div className="max-w-lg mb-6">
            <DestinationSearch slug={slug} initialQ={q} />
          </div>

          {popularPills.length > 0 && (
            <div>
              <p className="font-inter text-[9px] uppercase tracking-[0.15em] text-cream/30 mb-3">Popular in {dest.name}:</p>
              <PopularPills attractions={popularPills} />
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-inter text-[8px] uppercase tracking-[0.2em] text-cream">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-cream to-transparent"/>
        </div>
      </div>

      {/* Attractions Grid */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-18">

          <div className="flex items-baseline justify-between mb-8 gap-4 flex-wrap">
            <h2 className="font-display font-bold text-charcoal dark-flip-text"
              style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', letterSpacing: '-0.018em' }}>
              {q ? `Results in ${dest.name}` : `Attractions in ${dest.name}`}
            </h2>
            {q && (
              <Link href={`/destinations/${slug}`}
                className="font-inter text-[10px] uppercase tracking-[0.14em] text-crimson/70 hover:text-crimson transition-colors">
                Clear search
              </Link>
            )}
          </div>

          {pageItems.length === 0 ? (
            <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-16 text-center">
              <p className="font-inter text-[9px] uppercase tracking-[0.16em] text-charcoal/35 dark-flip-muted mb-2">
                {q ? 'No results' : 'Coming soon'}
              </p>
              <p className="font-sans text-sm text-charcoal/40 dark-flip-muted">
                {q
                  ? `No attractions in ${dest.name} matched that search.`
                  : `Attraction guides for ${dest.name} are being prepared.`}
              </p>
              <Link href="/attractions"
                className="inline-flex items-center gap-2 mt-6 font-inter text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
                Browse all guides
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {pageItems.map(a => {
                const seed      = a.slug.split('').reduce((n: number, c: string) => n + c.charCodeAt(0), 0)
                const typeLabel = (a.type?.[0] ?? '').replace('UNESCO World Heritage Site | ', '')
                return (
                  <Link key={a.slug} href={`/attractions/${a.slug}`}
                    className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 overflow-hidden bg-sand">
                      <Image
                        src={`https://picsum.photos/seed/${seed}/800/500`}
                        alt={a.name} fill
                        sizes="(max-width:640px)100vw,(max-width:1024px)50vw,(max-width:1280px)33vw,25vw"
                        className="object-cover img-editorial img-inner"
                      />
                      {typeLabel && (
                        <span className="absolute top-3 left-3 bg-ink/75 backdrop-blur font-inter text-[8px] uppercase tracking-[0.13em] text-cream/80 px-2 py-0.5 rounded-full">
                          {typeLabel}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      {a.city && (
                        <p className="font-inter text-[9px] uppercase tracking-[0.14em] text-crimson mb-2">{a.city.name}</p>
                      )}
                      <h3 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2"
                        style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', letterSpacing: '-0.012em' }}>
                        {a.name}
                      </h3>
                      {a.editorialSummary && (
                        <p className="font-sans text-[12px] text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2">
                          {a.editorialSummary}
                        </p>
                      )}
                      <div className="mt-4 pt-3 border-t border-line dark-flip-border">
                        <span className="font-inter text-[10px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors">
                          Read the guide &#8594;
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-2">
              {safePage > 1 && (
                <Link href={`/destinations/${slug}?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${safePage - 1}`}
                  className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/45 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link key={p} href={`/destinations/${slug}?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${p}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-inter text-[11px] transition-all
                    ${p === safePage ? 'bg-crimson text-cream border border-crimson' : 'border border-line dark-flip-border text-charcoal/55 dark-flip-muted hover:border-crimson hover:text-crimson'}`}>
                  {p}
                </Link>
              ))}
              {safePage < totalPages && (
                <Link href={`/destinations/${slug}?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${safePage + 1}`}
                  className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/45 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              )}
            </div>
          )}

          {/* Also in region */}
          {dest.relatedCountries && dest.relatedCountries.length > 0 && (
            <div className="mt-16 pt-12 border-t border-line dark-flip-border">
              <p className="font-inter text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-6">
                Also in {dest.continentRegion}
              </p>
              <div className="flex flex-wrap gap-3">
                {dest.relatedCountries.map(c => (
                  <Link key={c.slug} href={`/destinations/${c.slug}`}
                    className="flex items-center gap-2 bg-sand dark-flip-surf border border-line dark-flip-border hover:border-crimson px-4 py-2.5 rounded-full group transition-all">
                    {c.flagEmoji && <span className="text-sm">{c.flagEmoji}</span>}
                    <span className="font-sans text-[13px] text-charcoal/65 dark-flip-muted group-hover:text-crimson transition-colors">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
