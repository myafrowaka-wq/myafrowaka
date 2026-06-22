import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { CITY_BY_SLUG_QUERY, ALL_CITY_SLUGS_QUERY } from '@/sanity/lib/queries'

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
  country?: { name: string; slug: string }
  attractions: Attraction[]
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
  return {
    title: `${city.name} Attractions – MyAfroWaka`,
    description:
      city.overview ||
      `Explore the best attractions in ${city.name}${city.country ? `, ${city.country.name}` : ''}. Verified travel guides from MyAfroWaka.`,
  }
}

const REGION_COLOR: Record<string, string> = {
  'East Africa':          '#3F6A3D',
  'West Africa':          '#B55D39',
  'Southern Africa':      '#29251A',
  'North Africa':         '#A22E29',
  'Central Africa':       '#D5A942',
  'Indian Ocean Islands': '#3B403E',
}

export default async function CityPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const city = await client.fetch<City | null>(CITY_BY_SLUG_QUERY, { slug })
  if (!city) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myafrowaka.com' },
      ...(city.country ? [{
        '@type': 'ListItem',
        position: 2,
        name: city.country.name,
        item: `https://myafrowaka.com/countries/${city.country.slug}`,
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
      <div className="bg-sand border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <nav className="font-mono text-[10px] uppercase tracking-[0.12em] text-charcoal/40 mb-5 flex flex-wrap gap-1 items-center">
            <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
            {city.country && (
              <>
                <span>/</span>
                <Link href={`/countries/${city.country.slug}`} className="hover:text-ochre-600 transition-colors">
                  {city.country.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-charcoal">{city.name}</span>
          </nav>

          {city.country && (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ochre-600 mb-2">
              {city.country.name}
            </p>
          )}

          <h1 className="font-display text-4xl md:text-6xl text-charcoal mb-3 leading-tight">
            {city.name}
          </h1>

          {city.overview && (
            <p className="font-sans text-lg text-charcoal/65 leading-relaxed max-w-2xl">
              {city.overview}
            </p>
          )}
        </div>
      </div>

      {/* Attractions */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-display text-2xl md:text-3xl text-charcoal">
            Attractions near {city.name}
          </h2>
          {city.attractions.length > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-charcoal/35">
              {city.attractions.length} published
            </span>
          )}
        </div>

        {city.attractions.length === 0 ? (
          <div className="bg-sand rounded-2xl p-12 text-center border border-line">
            <p className="font-mono text-[11px] text-charcoal/40 uppercase tracking-[0.14em]">
              Attraction guides coming soon
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {city.attractions.map(attraction => {
              const borderColor = REGION_COLOR[attraction.continentRegion || ''] || '#B55D39'
              const typeLabel   = attraction.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || ''
              return (
                <Link
                  key={attraction.slug}
                  href={`/attractions/${attraction.slug}`}
                  className="group block bg-white border border-line hover:border-ochre-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="h-[3px]" style={{ backgroundColor: borderColor }} />
                  <div className="p-5">
                    {typeLabel && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 block mb-2">
                        {typeLabel}
                      </span>
                    )}
                    <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors mb-2">
                      {attraction.name}
                    </h3>
                    {attraction.editorialSummary && (
                      <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2">
                        {attraction.editorialSummary}
                      </p>
                    )}
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 group-hover:text-ochre-700 transition-colors">
                      Read guide &rarr;
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
