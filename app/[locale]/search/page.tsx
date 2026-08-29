'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { REGION_COLOR, REGION_COLOR_FALLBACK } from '@/lib/regionColors'
import Image from 'next/image'
import { createClient } from 'next-sanity'
import { attractionStockImage } from '@/lib/stockImageCredits'

const client = createClient({
  projectId: 'k2ysdc2b',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const attractionImageUrl = attractionStockImage

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

const EXPERIENCES = [
  'Safari',
  'Wildlife',
  'Historical Sites',
  'Beach',
  'Hiking',
  'Culture',
  'Food',
  'City',
]

/* Sidebar accordion section */
function AccordionSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line dark-flip-border last:border-none">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-display font-semibold text-[14px] text-charcoal dark-flip-text">{title}</span>
        <svg
          className={`w-4 h-4 text-charcoal/35 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

function SearchInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ts = useTranslations('search')
  const [all, setAll]           = useState<Attraction[]>([])
  const [loading, setLoading]   = useState(true)
  const [inputVal, setInputVal] = useState('')
  const debounceRef             = useRef<ReturnType<typeof setTimeout> | null>(null)

  const query  = searchParams.get('q')      || ''
  const region = searchParams.get('region') || ''
  const exp    = searchParams.get('exp')    || ''

  // Keep input field in sync with URL param (e.g. when arriving from the nav search bar)
  useEffect(() => { setInputVal(query) }, [query])

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
    const matchesExp    = !exp    || (a.type || []).some(t => t.toLowerCase().includes(exp.toLowerCase()))
    const matchesQuery  = !query  || [
      a.name, a.editorialSummary, a.country?.name, a.city?.name,
      ...(a.type || []),
    ].some(v => v?.toLowerCase().includes(query.toLowerCase()))
    return matchesRegion && matchesExp && matchesQuery
  })

  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/search?${params.toString()}`)
  }, [searchParams, router])

  const clearAll = () => router.push('/search')

  const hasFilters = region || exp

  return (
    <div className="bg-cream dark-flip-bg min-h-screen">

      {/* Top search bar */}
      <div className="bg-sand dark-flip-surf border-b border-line dark-flip-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-4 flex gap-1">
            <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
            <span>/</span>
            <span className="text-charcoal dark-flip-text">Search</span>
          </nav>

          <h1 className="font-display font-bold text-charcoal dark-flip-text mb-5"
            style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.018em' }}>
            {region ? `${region} Attractions` : 'Search All Attractions'}
          </h1>

          <div className="relative max-w-2xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="search"
              value={inputVal}
              onChange={e => {
                const v = e.target.value
                setInputVal(v)
                if (debounceRef.current) clearTimeout(debounceRef.current)
                debounceRef.current = setTimeout(() => setParam('q', v), 300)
              }}
              placeholder={ts('placeholder')}
              className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl pl-10 pr-4 py-3.5 text-sm font-sans text-charcoal dark-flip-text placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              <span className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted">{ts('filters')}:</span>
              {region && (
                <button onClick={() => setParam('region', '')}
                  className="flex items-center gap-1.5 bg-crimson/10 text-crimson font-sans text-[14px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-crimson/20 hover:bg-crimson/20 transition-colors">
                  {region}
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
              {exp && (
                <button onClick={() => setParam('exp', '')}
                  className="flex items-center gap-1.5 bg-gold-400/10 text-gold-600 font-sans text-[14px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-gold-400/20 hover:bg-gold-400/20 transition-colors">
                  {exp}
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              )}
              <button onClick={clearAll}
                className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/55 hover:text-crimson transition-colors underline underline-offset-2">
                {ts('clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body: sidebar + results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Sidebar accordion ── */}
          <aside className="hidden md:block w-60 lg:w-64 shrink-0 sticky top-24">
            <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl overflow-hidden">

              <div className="px-5 py-4 border-b border-line dark-flip-border">
                <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/55 dark-flip-muted">{ts('filterResults')}</p>
              </div>

              <div className="px-5">

                <AccordionSection title={ts('byRegion')} defaultOpen={true}>
                  <div className="space-y-1">
                    {REGIONS.map(r => (
                      <button key={r} onClick={() => setParam('region', region === r ? '' : r)}
                        className={`w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-left transition-colors
                          ${region === r ? 'bg-crimson/8 text-crimson' : 'text-charcoal/65 dark-flip-muted hover:bg-sand dark-flip-surf'}`}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: REGION_COLOR[r] }}/>
                        <span className="font-sans text-[14px]">{r}</span>
                        {region === r && (
                          <svg className="w-3 h-3 ml-auto text-crimson" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </AccordionSection>

                <AccordionSection title={ts('byExperience')}>
                  <div className="space-y-1">
                    {EXPERIENCES.map(e => (
                      <button key={e} onClick={() => setParam('exp', exp === e ? '' : e)}
                        className={`w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-left transition-colors
                          ${exp === e ? 'bg-gold-400/10 text-gold-600' : 'text-charcoal/65 dark-flip-muted hover:bg-sand dark-flip-surf'}`}>
                        <span className="font-sans text-[14px]">{e}</span>
                        {exp === e && (
                          <svg className="w-3 h-3 ml-auto text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </AccordionSection>

              </div>
            </div>
          </aside>

          {/* ── Results ── */}
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-6">
              {loading ? 'Loading...' : `${filtered.length} attraction${filtered.length !== 1 ? 's' : ''} found`}
            </p>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-44 bg-sand dark-flip-surf"/>
                    <div className="p-5 space-y-2">
                      <div className="h-4 bg-sand dark-flip-surf rounded w-3/4"/>
                      <div className="h-3 bg-sand dark-flip-surf rounded w-1/2"/>
                      <div className="h-3 bg-sand dark-flip-surf rounded w-full"/>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display font-bold text-3xl text-charcoal/20 dark-flip-muted mb-3">{ts('noResults')}</p>
                <p className="font-sans text-sm text-charcoal/35 dark-flip-muted mb-6">{ts('tryDifferent')}</p>
                <button onClick={clearAll}
                  className="inline-flex items-center gap-2 border border-line dark-flip-border text-charcoal/50 dark-flip-muted hover:text-crimson hover:border-crimson font-sans text-[14px] uppercase tracking-[0.12em] px-6 py-3 rounded-full transition-colors">
                  {ts('clearAllFilters')}
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(a => {
                  const accentColor = REGION_COLOR[a.continentRegion || ''] || REGION_COLOR_FALLBACK
                  const typeLabel   = a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || ''
                  return (
                    <Link key={a.slug} href={`/attractions/${a.slug}`}
                      className="group block bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5">
                      <div className="relative h-44 overflow-hidden bg-sand">
                        <Image
                          src={attractionImageUrl(a.slug)}
                          alt={a.name}
                          fill
                          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
                          className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        />
                        {typeLabel && (
                          <span className="absolute top-3 left-3 bg-ink/75 backdrop-blur font-sans text-[14px] uppercase tracking-[0.12em] text-cream/90 px-2.5 py-0.5 rounded-full">
                            {typeLabel}
                          </span>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: accentColor }}/>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-bold text-base text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-1.5"
                          style={{ letterSpacing: '-0.012em' }}>
                          {a.name}
                        </h3>
                        <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted uppercase tracking-[0.1em] mb-3">
                          {[a.city?.name, a.country?.name].filter(Boolean).join(' · ')}
                        </p>
                        {a.editorialSummary && (
                          <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2">
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
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="h-10 bg-sand rounded-xl w-64 mb-6 animate-pulse"/>
        <div className="flex gap-8">
          <div className="hidden md:block w-64 h-96 bg-sand rounded-2xl animate-pulse shrink-0"/>
          <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-sand rounded-2xl h-44 animate-pulse"/>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchInner />
    </Suspense>
  )
}
