import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { COUNTRY_BY_SLUG_QUERY, ALL_COUNTRY_SLUGS_QUERY } from '@/sanity/lib/queries'

interface Attraction {
  name: string
  slug: string
  type?: string[]
  editorialSummary?: string
  city?: { name: string }
  continentRegion?: string
}

interface Country {
  name: string
  slug: { current: string }
  continentRegion?: string
  overview?: string
  flagEmoji?: string
  attractions: Attraction[]
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_COUNTRY_SLUGS_QUERY)
  return slugs.map(s => ({ slug: s.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const country = await client.fetch<Country | null>(COUNTRY_BY_SLUG_QUERY, { slug })
  if (!country) return {}
  return {
    title: `${country.name} Travel Guide – MyAfroWaka`,
    description:
      country.overview ||
      `Discover the best attractions in ${country.name}. Verified travel guides from MyAfroWaka.`,
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

export default async function CountryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug }  = await params
  const country   = await client.fetch<Country | null>(COUNTRY_BY_SLUG_QUERY, { slug })
  if (!country) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',        item: 'https://myafrowaka.com' },
      { '@type': 'ListItem', position: 2, name: country.name,  item: `https://myafrowaka.com/countries/${slug}` },
    ],
  }

  const accentColor = country.continentRegion
    ? (REGION_COLOR[country.continentRegion] || '#B55D39')
    : '#B55D39'

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero band */}
      <div className="bg-sand border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <nav className="font-mono text-[10px] uppercase tracking-[0.12em] text-charcoal/40 mb-5 flex gap-1 items-center">
            <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-charcoal">{country.name}</span>
          </nav>

          {country.flagEmoji && (
            <span className="text-5xl mb-4 block">{country.flagEmoji}</span>
          )}

          {country.continentRegion && (
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-2"
              style={{ color: accentColor }}
            >
              {country.continentRegion}
            </p>
          )}

          <h1 className="font-display text-4xl md:text-6xl text-charcoal mb-3 leading-tight">
            {country.name}
          </h1>

          {country.overview && (
            <p className="font-sans text-lg text-charcoal/65 leading-relaxed max-w-2xl">
              {country.overview}
            </p>
          )}
        </div>
      </div>

      {/* Attractions list */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-display text-2xl md:text-3xl text-charcoal">
            Attractions in {country.name}
          </h2>
          {country.attractions.length > 0 && (
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-charcoal/35">
              {country.attractions.length} published
            </span>
          )}
        </div>

        {country.attractions.length === 0 ? (
          <div className="bg-sand rounded-2xl p-12 text-center border border-line">
            <p className="font-mono text-[11px] text-charcoal/40 uppercase tracking-[0.14em]">
              Attraction guides coming soon
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {country.attractions.map(attraction => {
              const borderColor = REGION_COLOR[attraction.continentRegion || ''] || accentColor
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
                    <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors mb-1">
                      {attraction.name}
                    </h3>
                    {attraction.city && (
                      <p className="font-mono text-[10px] text-charcoal/40 uppercase tracking-[0.1em] mb-2">
                        {attraction.city.name}
                      </p>
                    )}
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
