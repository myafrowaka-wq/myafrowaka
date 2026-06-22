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
    description: country.overview || `Discover the best attractions in ${country.name}. Travel guides, tips and more from MyAfroWaka.`,
  }
}

export default async function CountryPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const country = await client.fetch<Country | null>(COUNTRY_BY_SLUG_QUERY, { slug })
  if (!country) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://myafrowaka.com' },
      { '@type': 'ListItem', position: 2, name: country.name, item: `https://myafrowaka.com/countries/${slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="font-mono text-xs uppercase tracking-wider text-charcoal/50 mb-6 flex gap-1 items-center">
          <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-charcoal">{country.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          {country.flagEmoji && (
            <span className="text-5xl mb-3 block">{country.flagEmoji}</span>
          )}
          <div className="flex items-start gap-4">
            <div>
              {country.continentRegion && (
                <p className="font-mono text-xs uppercase tracking-widest text-ochre-600 mb-2">{country.continentRegion}</p>
              )}
              <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-3">{country.name}</h1>
              {country.overview && (
                <p className="text-lg text-charcoal/75 leading-relaxed max-w-2xl">{country.overview}</p>
              )}
            </div>
          </div>
        </header>

        {/* Attractions */}
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-2xl text-charcoal">
              Attractions in {country.name}
            </h2>
            {country.attractions.length > 0 && (
              <span className="font-mono text-xs uppercase tracking-wider text-charcoal/40">
                {country.attractions.length} published
              </span>
            )}
          </div>

          {country.attractions.length === 0 ? (
            <div className="bg-sand rounded-xl p-10 text-center">
              <p className="font-mono text-sm text-charcoal/40 uppercase tracking-wider">
                Attraction guides coming soon
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {country.attractions.map(attraction => (
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
                  <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors mb-1">
                    {attraction.name}
                  </h3>
                  {attraction.city && (
                    <p className="font-mono text-xs text-charcoal/40 uppercase tracking-wider mb-2">
                      {attraction.city.name}
                    </p>
                  )}
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
