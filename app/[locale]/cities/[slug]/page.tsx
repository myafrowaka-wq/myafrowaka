import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { CITY_BY_SLUG_QUERY, ALL_CITY_SLUGS_QUERY } from '@/sanity/lib/queries'
import { REGION_COLOR, REGION_COLOR_FALLBACK } from '@/lib/regionColors'
import { hreflangAlternates } from '@/lib/hreflang'
import { twitterCard } from '@/lib/twitterCard'

interface Attraction {
  name: string
  slug: string
  type?: string[]
  editorialSummary?: string
  continentRegion?: string
}

interface City {
  name: string
  slug: { current: string }
  overview?: string
  country?: { name: string; slug: string; countryCode?: string }
  attractions: Attraction[]
  upcomingEvents?: { name: string; slug: string; category?: string }[]
  eventsScope?: 'city' | 'country'
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_CITY_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const city = await client.fetch<City | null>(CITY_BY_SLUG_QUERY, { slug })
  if (!city) return {}
  const canonicalUrl = `https://myafrowaka.com/cities/${slug}`
  const description = city.overview ||
    `Explore the best attractions in ${city.name}${city.country ? `, ${city.country.name}` : ''}. Verified travel guides from MyAfroWaka.`
  return {
    // Session 6.2 — see app/[locale]/login/page.tsx's comment: `absolute`
    // stops the parent title.template from double-appending "– MyAfroWaka".
    // openGraph's own title below is untouched — never templated.
    title: { absolute: `${city.name} Attractions – MyAfroWaka` },
    description,
    alternates: { canonical: canonicalUrl, languages: hreflangAlternates(canonicalUrl) },
    openGraph: {
      title: `${city.name} Attractions – MyAfroWaka`,
      description,
      type: 'website',
      url: canonicalUrl,
    },
    // Session 6.3 (WDOS SEO gate) — see lib/twitterCard.ts: without this,
    // Twitter cards silently fell back to the layout's generic default.
    twitter: twitterCard({
      title: `${city.name} Attractions – MyAfroWaka`,
      description,
    }),
  }
}

export default async function CityPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const city = await client.fetch<City | null>(CITY_BY_SLUG_QUERY, { slug })
  if (!city) notFound()
  // A city record with no published attractions and no overview has nothing
  // for a visitor or a crawler to use — serve 404 rather than an empty page.
  if (city.attractions.length === 0 && !city.overview) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myafrowaka.com' },
      ...(city.country ? [{
        '@type': 'ListItem',
        position: 2,
        name: city.country.name,
        item: `https://myafrowaka.com/destinations/${city.country.slug}`,
      }] : []),
      {
        '@type': 'ListItem',
        position: city.country ? 3 : 2,
        name: city.name,
        item: `https://myafrowaka.com/cities/${slug}`,
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero band */}
      <div className="bg-sand dark-flip-surf border-b border-line dark-flip-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          {city.country && (
            <Link href={`/destinations/${city.country.slug}`}
              className="inline-block font-sans text-[14px] uppercase tracking-[0.16em] text-ochre-600 dark:text-ochre-400 hover:text-ochre-700 dark:hover:text-ochre-300 transition-colors mb-2">
              {city.country.name}
            </Link>
          )}

          <h1 className="font-display text-4xl md:text-6xl text-charcoal dark-flip-text mb-3 leading-tight">
            {city.name}
          </h1>

          {city.overview && (
            <p className="font-sans text-lg text-charcoal/65 dark-flip-muted leading-relaxed max-w-2xl">
              {city.overview}
            </p>
          )}
        </div>
      </div>

      {/* Attractions */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-display text-2xl md:text-3xl text-charcoal dark-flip-text">
            Attractions near {city.name}
          </h2>
          {city.attractions.length > 0 && (
            <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/65 dark-flip-muted">
              {city.attractions.length} published
            </span>
          )}
        </div>

        {city.attractions.length === 0 ? (
          <div className="bg-sand dark-flip-surf rounded-2xl p-12 text-center border border-line dark-flip-border">
            <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted uppercase tracking-[0.14em]">
              Attraction guides coming soon
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {city.attractions.map(attraction => {
              const borderColor = REGION_COLOR[attraction.continentRegion || ''] || REGION_COLOR_FALLBACK
              const typeLabel   = attraction.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || ''
              return (
                <Link
                  key={attraction.slug}
                  href={`/attractions/${attraction.slug}`}
                  className="group block bg-white dark-flip-card border border-line dark-flip-border hover:border-ochre-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="h-[3px]" style={{ backgroundColor: borderColor }} />
                  <div className="p-5">
                    {typeLabel && (
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-ochre-600 dark:text-ochre-400 block mb-2">
                        {typeLabel}
                      </span>
                    )}
                    <h3 className="font-display text-xl text-charcoal dark-flip-text group-hover:text-ochre-600 dark:group-hover:text-ochre-400 transition-colors mb-2">
                      {attraction.name}
                    </h3>
                    {attraction.editorialSummary && (
                      <p className="text-sm text-charcoal/60 dark-flip-muted leading-relaxed line-clamp-2">
                        {attraction.editorialSummary}
                      </p>
                    )}
                    <p className="mt-3 font-sans text-[14px] uppercase tracking-[0.12em] text-ochre-600 dark:text-ochre-400 group-hover:text-ochre-700 dark:group-hover:text-ochre-300 transition-colors">
                      Read guide &rarr;
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Events — city-first, country fallback, not hand-curated (Session 5.2) */}
        {city.upcomingEvents && city.upcomingEvents.length > 0 && (
          <div className="mt-12 pt-10 border-t border-line dark-flip-border">
            <h2 className="font-display text-2xl text-charcoal dark-flip-text mb-5">
              Events {city.eventsScope === 'city' ? `in ${city.name}` : city.country ? `in ${city.country.name}` : 'Nearby'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {city.upcomingEvents.map(ev => (
                <Link key={ev.slug} href={`/events/${ev.slug}`}
                  className="flex items-center gap-3 bg-white dark-flip-card border border-line dark-flip-border hover:border-ochre-300 rounded-xl p-4 transition-colors">
                  <svg className="w-4 h-4 text-crimson shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span className="font-sans text-sm text-charcoal dark-flip-text group-hover:text-ochre-600 dark:group-hover:text-ochre-400">{ev.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
