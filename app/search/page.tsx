'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: 'k2ysdc2b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

interface Attraction {
  name: string
  slug: string
  type?: string[]
  continentRegion?: string
  editorialSummary?: string
  country?: { name: string; slug: string }
  city?: { name: string }
}

const REGIONS = ['North Africa', 'West Africa', 'East Africa', 'Southern Africa', 'Central Africa', 'Indian Ocean Islands']

function SearchInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [all, setAll] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)

  const query = searchParams.get('q') || ''
  const region = searchParams.get('region') || ''

  useEffect(() => {
    client.fetch<Attraction[]>(`
      *[_type == "attraction" && contentStatus == "Published"] | order(name asc){
        name, "slug": slug.current, type, continentRegion, editorialSummary,
        "country": country->{ name, "slug": slug.current },
        "city": city->{ name }
      }
    `).then(data => { setAll(data); setLoading(false) })
  }, [])

  const filtered = all.filter(a => {
    const matchesRegion = !region || a.continentRegion === region
    const matchesQuery = !query || [
      a.name, a.editorialSummary, a.country?.name, a.city?.name,
      ...(a.type || []),
    ].some(v => v?.toLowerCase().includes(query.toLowerCase()))
    return matchesRegion && matchesQuery
  })

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/search?${params.toString()}`)
  }, [searchParams, router])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-charcoal mb-6">Search Attractions</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <input
          type="search"
          value={query}
          onChange={e => setParam('q', e.target.value)}
          placeholder="Search by name, country, type…"
          className="flex-1 border border-sand rounded-full px-5 py-3 text-sm font-sans text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400"
        />
        <select
          value={region}
          onChange={e => setParam('region', e.target.value)}
          className="border border-sand rounded-full px-5 py-3 text-sm font-sans text-charcoal bg-cream focus:outline-none focus:border-ochre-400"
        >
          <option value="">All Regions</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <p className="font-mono text-xs uppercase tracking-wider text-charcoal/40 mb-6">
        {loading ? 'Loading…' : `${filtered.length} attraction${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-sand rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-2xl text-charcoal/40 mb-2">No attractions found</p>
          <p className="text-charcoal/30 text-sm">Try a different search term or region</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <Link
              key={a.slug}
              href={`/attractions/${a.slug}`}
              className="group block bg-white border border-sand hover:border-ochre-300 rounded-xl p-5 transition-all hover:shadow-md"
            >
              {a.type && a.type[0] && (
                <span className="font-mono text-xs uppercase tracking-wider text-ochre-600 block mb-1">
                  {a.type[0].replace('UNESCO World Heritage Site | ', '')}
                </span>
              )}
              <h3 className="font-display text-lg text-charcoal group-hover:text-ochre-600 transition-colors mb-1">
                {a.name}
              </h3>
              <p className="font-mono text-xs text-charcoal/40 uppercase tracking-wider mb-2">
                {[a.city?.name, a.country?.name].filter(Boolean).join(' · ')}
              </p>
              {a.editorialSummary && (
                <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-2">
                  {a.editorialSummary}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-10 bg-sand rounded-xl w-48 mb-6 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-sand rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <SearchInner />
    </Suspense>
  )
}
