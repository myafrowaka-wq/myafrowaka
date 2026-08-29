import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_ATTRACTIONS_QUERY } from '@/sanity/lib/queries'
import { AttractionSearch } from '@/components/AttractionSearch'
import { AttractionsFilter } from '@/components/AttractionsFilter'
import { TypewriterHero } from '@/components/TypewriterHero'
import { Flag } from '@/components/Flag'
import { stockImage, attractionStockImage } from '@/lib/stockImageCredits'
import { hreflangAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: { absolute: 'Africa Travel Guides – MyAfroWaka' }, // Session 6.2 — see app/[locale]/login/page.tsx's comment: opts out of the parent title.template so this doesn't render doubled.
  description: 'Verified travel guides to extraordinary destinations across Africa. Explore by country, type, or experience.',
  alternates: { canonical: 'https://myafrowaka.com/attractions', languages: hreflangAlternates('https://myafrowaka.com/attractions') },
  openGraph: {
    title: 'Africa Travel Guides – MyAfroWaka',
    description: 'Verified travel guides to extraordinary destinations across Africa.',
    url: 'https://myafrowaka.com/attractions',
    images: [`https://myafrowaka.com${stockImage('1577948000111-9c970dfe3743')}`],
  },
}

interface AttractionSummary {
  name: string
  slug: string
  type?: string[]
  editorialSummary?: string
  country?: { name: string; slug: string; countryCode?: string }
  city?: { name: string }
}

const attractionImageUrl = attractionStockImage

const FALLBACK_ATTRACTIONS: AttractionSummary[] = [
  { name: 'Pyramids of Giza',                 slug: 'pyramids-of-giza',                  type: ['UNESCO World Heritage Site'],  country: { name: 'Egypt', slug: 'egypt', countryCode: 'eg' }, city: { name: 'Cairo' },          editorialSummary: 'Three structures built over four thousand years ago that remain among the most astonishing on earth.' },
  { name: 'Serengeti National Park',           slug: 'serengeti-national-park',           type: ['National Park'],               country: { name: 'Tanzania', slug: 'tanzania', countryCode: 'tz' }, city: { name: 'Arusha Region' },  editorialSummary: 'The annual wildebeest migration through the Serengeti is the largest mammal movement on earth.' },
  { name: 'Victoria Falls',                    slug: 'victoria-falls',                    type: ['Natural Wonder'],              country: { name: 'Zimbabwe', slug: 'zimbabwe', countryCode: 'zw' }, city: { name: 'Victoria Falls' }, editorialSummary: 'One of the largest curtains of falling water on earth, audible from two kilometres away.' },
  { name: 'Bwindi Impenetrable National Park', slug: 'bwindi-impenetrable-national-park', type: ['National Park'],               country: { name: 'Uganda', slug: 'uganda', countryCode: 'ug' }, city: { name: 'Kigezi Region' },  editorialSummary: "Home to roughly half the world's remaining mountain gorilla population." },
  { name: 'Djemaa el-Fna',                    slug: 'djemaa-el-fna-marrakech',           type: ['Cultural Site', 'UNESCO'],     country: { name: 'Morocco', slug: 'morocco', countryCode: 'ma' }, city: { name: 'Marrakech' },      editorialSummary: 'A square that transforms from morning market to night festival, recognised by UNESCO for its intangible heritage.' },
  { name: 'Sossusvlei Dunes',                 slug: 'sossusvlei-namib-desert',           type: ['Natural Wonder'],              country: { name: 'Namibia', slug: 'namibia', countryCode: 'na' }, city: { name: 'Namib-Naukluft' }, editorialSummary: 'The tallest dunes in the world change colour across a spectrum that has no adequate name in English.' },
  { name: 'Volcanoes National Park',           slug: 'volcanoes-national-park-rwanda',    type: ['National Park'],               country: { name: 'Rwanda', slug: 'rwanda', countryCode: 'rw' }, city: { name: 'Musanze' },        editorialSummary: "Trekking through Virunga forest to find mountain gorilla families is one of Africa's defining wildlife experiences." },
  { name: 'Cape Point',                        slug: 'cape-point-south-africa',           type: ['Nature Reserve'],              country: { name: 'South Africa', slug: 'south-africa', countryCode: 'za' }, city: { name: 'Cape Town' },      editorialSummary: 'Where the Atlantic and the cliffs of the Cape Peninsula come together at the southwestern tip of the continent.' },
  { name: 'Lalibela Rock-Hewn Churches',       slug: 'lalibela-rock-hewn-churches',       type: ['UNESCO World Heritage Site'],  country: { name: 'Ethiopia', slug: 'ethiopia', countryCode: 'et' }, city: { name: 'Lalibela' },       editorialSummary: 'Eleven monolithic churches carved directly from the rock in the twelfth century and still used for active worship.' },
  { name: 'Maasai Mara National Reserve',     slug: 'maasai-mara-national-reserve',      type: ['National Reserve'],            country: { name: 'Kenya', slug: 'kenya', countryCode: 'ke' }, city: { name: 'Narok County' },   editorialSummary: 'The Kenyan portion of the Serengeti ecosystem and the site of the annual Mara River crossing.' },
  { name: 'Stone Town',                       slug: 'stone-town-zanzibar',               type: ['UNESCO World Heritage Site'],  country: { name: 'Tanzania', slug: 'tanzania', countryCode: 'tz' }, city: { name: 'Zanzibar' },       editorialSummary: 'Six centuries of Swahili, Arab, Indian, and British influence compressed into one navigable old town.' },
  { name: 'Ngorongoro Crater',                slug: 'ngorongoro-conservation-area',      type: ['UNESCO World Heritage Site'],  country: { name: 'Tanzania', slug: 'tanzania', countryCode: 'tz' }, city: { name: 'Ngorongoro' },     editorialSummary: "The world's largest intact volcanic caldera contains one of the densest concentrations of wildlife in Africa." },
]

const ITEMS_PER_PAGE = 12

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; type?: string }>
}) {
  const { page: pageParam, q, type } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  let attractions: AttractionSummary[] = []
  try {
    const data = await client.fetch<AttractionSummary[]>(ALL_ATTRACTIONS_QUERY)
    if (data && data.length > 0) attractions = data
    else attractions = FALLBACK_ATTRACTIONS
  } catch {
    attractions = FALLBACK_ATTRACTIONS
  }

  const filtered = attractions.filter(a => {
    if (q && !(
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      a.country?.name.toLowerCase().includes(q.toLowerCase()) ||
      a.city?.name.toLowerCase().includes(q.toLowerCase())
    )) return false
    if (type && !a.type?.some(t => t.toLowerCase().includes(type.toLowerCase()))) return false
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(currentPage, totalPages)
  const start      = (safePage - 1) * ITEMS_PER_PAGE
  const pageItems  = filtered.slice(start, start + ITEMS_PER_PAGE)

  function buildUrl(overrides: { page?: number; type?: string | null; q?: string | null }) {
    const params = new URLSearchParams()
    const newQ    = overrides.q    !== undefined ? overrides.q    : (q ?? null)
    const newType = overrides.type !== undefined ? overrides.type : (type ?? null)
    const newPage = overrides.page !== undefined ? overrides.page : safePage
    if (newQ)              params.set('q', newQ)
    if (newType)           params.set('type', newType)
    if (newPage && newPage > 1) params.set('page', String(newPage))
    const qs = params.toString()
    return qs ? `/attractions?${qs}` : '/attractions'
  }

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden min-h-[520px] flex items-center">
        <Image
          src={stockImage('1577948000111-9c970dfe3743')}
          alt="Johannesburg city skyline, South Africa" fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/50"/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
          <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-gold-400/75 mb-5">Destination Guides</p>
          <h1
            className="font-display font-extrabold text-cream mb-6 tracking-hero"
            style={{ fontSize: 'clamp(38px, 4.2vw, 64px)', lineHeight: '0.94' }}
          >
            <TypewriterHero
              speed={32}
              lines={[
                { text: 'Explore ', noBreakAfter: true },
                { text: 'Africa,', className: 'text-crimson' },
                { text: ' One Adventure at a Time.' },
              ]}
            />
          </h1>
          <p className="font-sans text-cream/65 leading-relaxed mb-8 max-w-xl"
            style={{ fontSize: 'clamp(14px, 1.4vw, 17px)' }}>
            Verified guides written by people who live, work, and travel across the continent.
          </p>
          <Suspense>
            <AttractionSearch initialQ={q} />
          </Suspense>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-18">

          {/* Active filters */}
          {(q || type) && (
            <div className="mb-6 flex items-center gap-3 flex-wrap">
              {q && (
                <span className="inline-flex items-center gap-2 font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted bg-sand dark-flip-surf border border-line dark-flip-border px-3 py-1.5 rounded-full">
                  &ldquo;{q}&rdquo;
                  <Link href={buildUrl({ q: null })} className="text-crimson hover:text-crimson/70 transition-colors leading-none">&#x2715;</Link>
                </span>
              )}
              {type && (
                <span className="inline-flex items-center gap-2 font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted bg-sand dark-flip-surf border border-line dark-flip-border px-3 py-1.5 rounded-full">
                  {type}
                  <Link href={buildUrl({ type: null })} className="text-crimson hover:text-crimson/70 transition-colors leading-none">&#x2715;</Link>
                </span>
              )}
              <Link href="/attractions"
                className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson/60 hover:text-crimson transition-colors">
                Clear all
              </Link>
            </div>
          )}

          {/* Type filter pills */}
          <Suspense>
            <AttractionsFilter activeType={type} />
          </Suspense>

          {pageItems.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-3">No results</p>
              <p className="font-sans text-sm text-charcoal/45 dark-flip-muted">Try a different search term or filter.</p>
              <Link href="/attractions" className="mt-6 inline-flex font-sans text-[14px] uppercase tracking-[0.14em] text-crimson">Browse All Guides</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {pageItems.map(a => {
                const typeLabel = (a.type?.[0] ?? '').replace('UNESCO World Heritage Site | ', '')
                return (
                  <Link key={a.slug} href={`/attractions/${a.slug}`}
                    className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 overflow-hidden bg-sand">
                      <Image
                        src={attractionImageUrl(a.slug)}
                        alt={a.name} fill
                        sizes="(max-width:640px)100vw,(max-width:1024px)50vw,(max-width:1280px)33vw,25vw"
                        className="object-cover img-editorial img-inner"
                      />
                      {typeLabel && (
                        <span className="absolute top-3 left-3 bg-ink/75 backdrop-blur font-sans text-[14px] uppercase tracking-[0.13em] text-cream/80 px-2 py-0.5 rounded-full">
                          {typeLabel}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      {a.country && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Flag code={a.country.countryCode} />
                          <span className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson">{a.country.name}</span>
                          {a.city && (
                            <>
                              <span className="text-charcoal/20 dark-flip-muted text-[14px]">&middot;</span>
                              <span className="font-sans text-[14px] text-charcoal/35 dark-flip-muted">{a.city.name}</span>
                            </>
                          )}
                        </div>
                      )}
                      <h2 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2"
                        style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', letterSpacing: '-0.012em' }}>
                        {a.name}
                      </h2>
                      {a.editorialSummary && (
                        <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2">
                          {a.editorialSummary}
                        </p>
                      )}
                      <div className="mt-4 pt-3 border-t border-line dark-flip-border">
                        <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors">
                          Read the guide &#8594;
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-2">
              {safePage > 1 && (
                <Link href={buildUrl({ page: safePage - 1 })}
                  className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/45 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link key={p} href={buildUrl({ page: p })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-sans text-[14px] transition-all
                    ${p === safePage ? 'bg-crimson text-cream border border-crimson' : 'border border-line dark-flip-border text-charcoal/55 dark-flip-muted hover:border-crimson hover:text-crimson'}`}>
                  {p}
                </Link>
              ))}
              {safePage < totalPages && (
                <Link href={buildUrl({ page: safePage + 1 })}
                  className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/45 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
