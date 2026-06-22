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

const REGIONS = [
  'North Africa',
  'West Africa',
  'East Africa',
  'Southern Africa',
  'Central Africa',
  'Indian Ocean Islands',
]

const REGION_COLOR: Record<string, string> = {
  'East Africa':          '#3F6A3D',
  'West Africa':          '#B55D39',
  'Southern Africa':      '#29251A',
  'North Africa':         '#A22E29',
  'Central Africa':       '#D5A942',
  'Indian Ocean Islands': '#3B403E',
}

function SearchInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [all, setAll]         = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)

  const query  = searchParams.get('q')      || ''
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
    const matchesQuery  = !query  || [
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
    <>
      {/* Header band */}
      <div className="bg-sand border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <nav className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 mb-5 flex gap-1">
            <Link href="/" className="hover:text-ochre-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-charcoal">Search</span>
          </nav>

          <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-6">
            {region ? `${region} Attractions` : 'Search All Attractions'}
          </h1>

          {/* Search + filter row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={e => setParam('q', e.target.value)}
                placeholder="Search by name, country, type&hellip;"
                className="w-full border border-line bg-white rounded-xl pl-10 pr-4 py-3 text-sm font-sans text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-ochre-400 transition-colors"
              />
            </div>
            <select
              value={region}
              onChange={e => setParam('region', e.target.value)}
              className="border border-line bg-white rounded-xl px-4 py-3 text-sm font-sans text-charcoal focus:outline-none focus:border-ochre-400 transition-colors md:w-56"
            >
              <option value="">All Regions</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Region chips */}
          {!region && (
            <div className="flex flex-wrap gap-2 mt-4">
              {REGIONS.map(r => (
                <button
                  key={r}
                  onClick={() => setParam('region', r)}
                  className="font-mono text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border border-line bg-white text-charcoal/60 hover:border-ochre-300 hover:text-ochre-600 transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 mb-6">
          {loading
            ? 'Loading…'
            : `${filtered.length} attraction${filtered.length !== 1 ? 's' : ''} found`
          }
          {region && !loading && (
            <button
              onClick={() => setParam('region', '')}
              className="ml-4 text-ochre-600 hover:text-ochre-700 normal-case tracking-normal"
              style={{ fontFamily: 'inherit', letterSpacing: 'inherit' }}
            >
              Clear filter &times;
            </button>
          )}
        </p>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-sand rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-3xl text-charcoal/30 mb-3">No attractions found</p>
            <p className="font-sans text-sm text-charcoal/30">Try a different search term or region</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(a => {
              const accentColor = REGION_COLOR[a.continentRegion || ''] || '#B55D39'
              const typeLabel   = a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || ''
              return (
                <Link
                  key={a.slug}
                  href={`/attractions/${a.slug}`}
                  className="group block bg-white border border-line hover:border-ochre-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="h-[3px]" style={{ backgroundColor: accentColor }} />
                  <div className="p-5">
                    {typeLabel && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 block mb-2">
                        {typeLabel}
                      </span>
                    )}
                    <h3 className="font-display text-lg text-charcoal group-hover:text-ochre-600 transition-colors leading-snug mb-1.5">
                      {a.name}
                    </h3>
                    <p className="font-mono text-[10px] text-charcoal/40 uppercase tracking-[0.1em] mb-3">
                      {[a.city?.name, a.country?.name].filter(Boolean).join(' · ')}
                    </p>
                    {a.editorialSummary && (
                      <p className="text-[13px] text-charcoal/60 leading-relaxed line-clamp-2">
                        {a.editorialSummary}
                      </p>
                    )}
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

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-10 bg-sand rounded-xl w-64 mb-6 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-sand rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <SearchInner />
    </Suspense>
  )
}
