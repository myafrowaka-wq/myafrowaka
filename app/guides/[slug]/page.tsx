import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { GUIDE_BY_SLUG_QUERY, ALL_GUIDE_SLUGS_QUERY } from '@/sanity/lib/queries'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GuideAttraction {
  _id: string
  name: string
  slug: string
  type?: string[]
  editorialSummary?: string
  continentRegion?: string
  lastVerifiedDate?: string
  country?: { name: string; slug: string }
  city?: { name: string }
}

interface GuideItem {
  framingText?: string
  attraction: GuideAttraction
}

interface Guide {
  title: string
  slug: string
  focusKeyword?: string
  metaTitle?: string
  metaDescription?: string
  items: GuideItem[]
}

// ── Region accent colours ─────────────────────────────────────────────────────

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
  const slugs = await client.fetch<{ slug: string }[]>(ALL_GUIDE_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const guide = await client.fetch<Guide | null>(GUIDE_BY_SLUG_QUERY, { slug })
  if (!guide) return {}

  const title       = guide.metaTitle       ?? `${guide.title} – MyAfroWaka`
  const description = guide.metaDescription ?? `A curated guide to ${guide.title}. Verified travel information from MyAfroWaka.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      images: [`https://picsum.photos/seed/${slug}-guide-hero/1200/630`],
    },
    twitter: {
      card:   'summary_large_image',
      title,
      description,
      images: [`https://picsum.photos/seed/${slug}-guide-hero/1200/630`],
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GuidePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const guide = await client.fetch<Guide | null>(GUIDE_BY_SLUG_QUERY, { slug })
  if (!guide) notFound()

  const validItems = (guide.items ?? []).filter(item => item.attraction)

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home',   item: 'https://myafrowaka.com'                   },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://myafrowaka.com/guides'            },
        { '@type': 'ListItem', position: 3, name: guide.title, item: `https://myafrowaka.com/guides/${slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: guide.title,
      description: guide.metaDescription ?? '',
      url: `https://myafrowaka.com/guides/${slug}`,
      numberOfItems: validItems.length,
      itemListElement: validItems.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.attraction.name,
        url: `https://myafrowaka.com/attractions/${item.attraction.slug}`,
      })),
    },
  ]

  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[380px] flex items-end">
        <Image
          src={`https://picsum.photos/seed/${slug}-guide-hero/1920/720`}
          alt={guide.title}
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/20 via-ink/55 to-ink/97"/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-12 pt-24">
          {guide.focusKeyword && (
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-400 mb-3">
              {guide.focusKeyword}
            </p>
          )}

          <h1
            className="font-display font-extrabold text-cream"
            style={{ fontSize: 'clamp(26px, 4.5vw, 58px)', lineHeight: '1.0', letterSpacing: '-0.025em' }}
          >
            {guide.title}
          </h1>

          {validItems.length > 0 && (
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-cream/35 mt-4">
              {validItems.length} {validItems.length === 1 ? 'attraction' : 'attractions'} in this guide
            </p>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid lg:grid-cols-3 gap-10 lg:gap-14 items-start">

            {/* ── Item list (2/3) ──────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {validItems.length === 0 ? (
                <p className="font-sans text-sm text-charcoal/40 dark-flip-muted italic">
                  Attractions for this guide are being added.
                </p>
              ) : (
                validItems.map((item, i) => {
                  const a = item.attraction
                  const accent = a.continentRegion ? (REGION_COLOR[a.continentRegion] ?? '#B55D39') : '#B55D39'
                  const typeLabel = a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') ?? ''
                  const num = String(i + 1).padStart(2, '0')
                  return (
                    <div key={a._id}
                      className="group bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl overflow-hidden hover:border-gold-300 hover:shadow-[var(--shadow-soft)] transition-all">
                      <div className="h-[3px]" style={{ backgroundColor: accent }}/>
                      <div className="p-6 sm:p-7 flex gap-5 sm:gap-7 items-start">

                        {/* Number */}
                        <span
                          className="font-mono font-bold text-[28px] sm:text-[36px] leading-none shrink-0 mt-0.5"
                          style={{ color: accent + '55' }}
                          aria-label={`Number ${i + 1}`}>
                          {num}
                        </span>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            {typeLabel && (
                              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-charcoal/38 dark-flip-muted">
                                {typeLabel}
                              </span>
                            )}
                            {a.country && (
                              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-charcoal/28 dark-flip-muted">
                                {a.city ? `${a.city.name}, ` : ''}{a.country.name}
                              </span>
                            )}
                          </div>

                          <h2 className="font-display font-bold text-charcoal dark-flip-text mb-3"
                            style={{ fontSize: 'clamp(17px, 2vw, 22px)', letterSpacing: '-0.015em', lineHeight: '1.15' }}>
                            {a.name}
                          </h2>

                          {item.framingText && (
                            <p className="font-sans text-[13px] text-charcoal/60 dark-flip-muted leading-relaxed mb-4">
                              {item.framingText}
                            </p>
                          )}

                          {a.editorialSummary && !item.framingText && (
                            <p className="font-sans text-[13px] text-charcoal/55 dark-flip-muted leading-relaxed mb-4 line-clamp-2">
                              {a.editorialSummary}
                            </p>
                          )}

                          <Link href={`/attractions/${a.slug}`}
                            className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
                            Read the full guide
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* ── Sidebar (1/3) ────────────────────────────────────── */}
            <div className="lg:sticky lg:top-24 space-y-5">

              {/* About this guide */}
              <div className="bg-ink rounded-3xl p-6 text-cream">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400/70 mb-3">About this guide</p>
                {guide.focusKeyword && (
                  <p className="font-sans text-[13px] text-cream/55 leading-relaxed mb-3">
                    This guide targets searches for <span className="text-cream/80 font-medium">{guide.focusKeyword}</span>.
                  </p>
                )}
                {guide.metaDescription && (
                  <p className="font-sans text-[13px] text-cream/50 leading-relaxed">
                    {guide.metaDescription}
                  </p>
                )}
                {!guide.focusKeyword && !guide.metaDescription && (
                  <p className="font-sans text-[13px] text-cream/45 leading-relaxed">
                    A curated selection of attractions verified by the MyAfroWaka editorial team.
                  </p>
                )}
              </div>

              {/* Item count */}
              <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-3xl p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/30 dark-flip-muted mb-3">In this guide</p>
                <p className="font-display font-bold text-charcoal dark-flip-text"
                  style={{ fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-0.02em' }}>
                  {validItems.length}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted mt-1">
                  verified attractions
                </p>
              </div>

              {/* Browse all guides */}
              <Link href="/guides"
                className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-1">More</p>
                  <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                    All travel guides
                  </p>
                </div>
                <svg className="w-5 h-5 text-charcoal/25 group-hover:text-crimson transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>

              {/* Browse attractions */}
              <Link href="/search"
                className="flex items-center justify-between bg-cream dark-flip-card border border-line dark-flip-border hover:border-crimson rounded-3xl p-6 group transition-all">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-1">Explore</p>
                  <p className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                    Browse all attractions
                  </p>
                </div>
                <svg className="w-5 h-5 text-charcoal/25 group-hover:text-crimson transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
