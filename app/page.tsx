import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { Badge } from '@/components/Badge'

const FEATURED_QUERY = `*[_type == "attraction" && contentStatus == "Published"] | order(_createdAt desc)[0..8]{
  name, "slug": slug.current, type, continentRegion, editorialSummary,
  "country": country->{ name, "slug": slug.current }
}`

const REGIONS = [
  { name: 'East Africa', emoji: '🦁', desc: 'Safari, mountains, and the Rift Valley' },
  { name: 'West Africa', emoji: '🥁', desc: 'History, culture, and vibrant cities' },
  { name: 'Southern Africa', emoji: '🌊', desc: 'Wildlife parks, coastlines, and heritage' },
  { name: 'North Africa', emoji: '🏛️', desc: 'Ancient civilisations and desert landscapes' },
  { name: 'Central Africa', emoji: '🌿', desc: 'Rainforests, gorillas, and rivers' },
  { name: 'Indian Ocean Islands', emoji: '🏝️', desc: 'Beaches, coral reefs, and island life' },
]

interface Attraction {
  name: string
  slug: string
  type?: string[]
  continentRegion?: string
  editorialSummary?: string
  country?: { name: string; slug: string }
}

export default async function HomePage() {
  const featured = await client.fetch<Attraction[]>(FEATURED_QUERY)

  return (
    <>
      {/* Hero */}
      <section className="bg-charcoal text-cream py-20 md:py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-ochre-400 mb-4">
            Africa Explained by Africans
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight mb-6">
            Discover Africa&apos;s Greatest Attractions
          </h1>
          <p className="text-lg md:text-xl text-cream/70 leading-relaxed max-w-2xl mx-auto mb-10">
            Verified travel guides for 557 attractions across 47 African countries. Written by people who know the continent.
          </p>

          {/* Search bar */}
          <Link
            href="/search"
            className="inline-flex items-center gap-3 bg-cream text-charcoal rounded-full px-6 py-4 w-full max-w-xl mx-auto hover:bg-sand transition-colors group"
          >
            <svg className="w-5 h-5 text-charcoal/40 group-hover:text-ochre-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-charcoal/50 font-sans text-base">Search destinations, countries, attractions…</span>
          </Link>
        </div>
      </section>

      {/* Featured attractions */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl text-charcoal">Featured Guides</h2>
            <Link href="/search" className="font-mono text-xs uppercase tracking-widest text-ochre-600 hover:text-ochre-700 transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map(attraction => (
              <Link
                key={attraction.slug}
                href={`/attractions/${attraction.slug}`}
                className="group block bg-white border border-sand hover:border-ochre-300 rounded-xl p-6 transition-all hover:shadow-md"
              >
                {/* Type */}
                {attraction.type && attraction.type[0] && (
                  <span className="font-mono text-xs uppercase tracking-wider text-ochre-600 block mb-2">
                    {attraction.type[0].replace('UNESCO World Heritage Site | ', '')}
                  </span>
                )}

                <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors mb-1">
                  {attraction.name}
                </h3>

                {attraction.country && (
                  <p className="font-mono text-xs text-charcoal/40 uppercase tracking-wider mb-3">
                    {attraction.country.name}
                  </p>
                )}

                {attraction.editorialSummary && (
                  <p className="text-sm text-charcoal/65 leading-relaxed line-clamp-3">
                    {attraction.editorialSummary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Browse by region */}
      <section className="bg-sand py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl text-charcoal mb-2">Browse by Region</h2>
          <p className="text-charcoal/60 mb-8">47 countries. 557 verified attractions.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {REGIONS.map(region => (
              <Link
                key={region.name}
                href={`/search?region=${encodeURIComponent(region.name)}`}
                className="group bg-cream hover:bg-white border border-ochre-100 hover:border-ochre-300 rounded-xl p-5 transition-all hover:shadow-md"
              >
                <span className="text-3xl block mb-2">{region.emoji}</span>
                <h3 className="font-display text-lg text-charcoal group-hover:text-ochre-600 transition-colors mb-1">
                  {region.name}
                </h3>
                <p className="text-xs text-charcoal/50 leading-relaxed">{region.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-display text-3xl text-charcoal mb-3">Get Africa in Your Inbox</h2>
        <p className="text-charcoal/60 mb-6">New destination guides, travel tips, and hidden gems. No spam. Unsubscribe any time.</p>
        <form className="flex gap-2 max-w-md mx-auto" action="#">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 border border-sand rounded-full px-4 py-3 text-sm font-sans text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400"
          />
          <button
            type="submit"
            className="bg-ochre-600 hover:bg-ochre-700 text-cream text-xs font-mono uppercase tracking-widest px-5 py-3 rounded-full transition-colors whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
        <p className="font-mono text-xs text-charcoal/30 uppercase tracking-wider mt-4">
          Newsletter setup coming soon
        </p>
      </section>
    </>
  )
}
