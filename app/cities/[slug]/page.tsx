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
    description: city.overview || `Explore the best attractions in ${city.name}${city.country ? `, ${city.country.name}` : ''}. Travel guides from MyAfroWaka.`,
  }
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
      ...(city.country ? [{ '@type': 'ListItem', position: 2, name: city.country.name, item: `https://myafrowaka.com/countries/${city.country.slug}` }] : []),
      { '@type': 'ListItem', position: city.country ? 3 : 2, name: city.name, item: `https://myafrowaka.com/cities/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="font-mono text-xs uppercase tracking-wider text-charcoal/50 mb-6 flex flex-wrap gap-1 items-center">
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

        {/* Header */}
        <header className="mb-10">
          {city.country && (
            <p className="font-mono text-xs uppercase tracking-widest text-ochre-600 mb-2">
              {city.country.name}
            </p>
          )}
          <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-3">{city.name}</h1>
          {city.overview && (
            <p className="text-lg text-charcoal/75 leading-relaxed max-w-2xl">{city.overview}</p>
          )}
        </header>

        {/* Attractions */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl text-charcoal">
              Attractions near {city.name}
            </h2>
            {city.attractions.length > 0 && (
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal/40">
                {city.attractions.length} published
              </span>
            )}
          </div>

          {city.attractions.length === 0 ? (
            <div className="bg-sand rounded-xl p-10 text-center">
              <p className="font-mono text-sm text-charcoal/40 uppercase tracking-wider">
                Attraction guides coming soon
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {city.attractions.map(attraction => (
                <Link
                  key={attraction.slug}
                  href={`/attractions/${attraction.slug}`}
                  className="group block bg-white border border-sand hover:border-ochre-300 rounded-xl p-5 transition-all hover:shadow-md"
                >
                  {attraction.type && attraction.type[0] && (
                    <span className="font-mono text-xs uppercase tracking-wider text-ochre-600 block mb-2">
                      {attraction.type[0].replace('UNESCO World Heritage Site | ', '')}
                    </span>
                  )}
                  <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors mb-2">
                    {attraction.name}
                  </h3>
                  {attraction.editorialSummary && (
                    <p className="text-sm text-charcoal/65 leading-relaxed line-clamp-2">
                      {attraction.editorialSummary}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
