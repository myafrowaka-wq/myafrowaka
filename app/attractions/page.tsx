import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_ATTRACTIONS_QUERY } from '@/sanity/lib/queries'
import { AttractionSearch } from '@/components/AttractionSearch'

export const metadata: Metadata = {
  title: 'Africa Travel Guides – MyAfroWaka',
  description: 'Discover verified travel guides to extraordinary destinations across Africa. Explore by country, type, or experience.',
  openGraph: {
    title: 'Africa Travel Guides – MyAfroWaka',
    description: 'Discover verified travel guides to extraordinary destinations across Africa.',
    images: ['https://picsum.photos/seed/attractions-hero/1200/630'],
  },
}

interface AttractionSummary {
  name: string
  slug: string
  type?: string[]
  editorialSummary?: string
  country?: { name: string; slug: string; flagEmoji?: string }
  city?: { name: string }
}

const FALLBACK_ATTRACTIONS: AttractionSummary[] = [
  { name: 'Pyramids of Giza',                 slug: 'pyramids-of-giza',                  type: ['UNESCO World Heritage Site'],  country: { name: 'Egypt',        slug: 'egypt',        flagEmoji: '\u{1F1EA}\u{1F1EC}' }, city: { name: 'Cairo' },          editorialSummary: 'Three structures built over four thousand years ago that remain among the most astonishing on earth.' },
  { name: 'Serengeti National Park',           slug: 'serengeti-national-park',           type: ['National Park'],               country: { name: 'Tanzania',     slug: 'tanzania',     flagEmoji: '\u{1F1F9}\u{1F1FF}' }, city: { name: 'Arusha Region' },  editorialSummary: 'The annual wildebeest migration through the Serengeti is the largest mammal movement on earth.' },
  { name: 'Victoria Falls',                    slug: 'victoria-falls',                    type: ['Natural Wonder'],              country: { name: 'Zimbabwe',     slug: 'zimbabwe',     flagEmoji: '\u{1F1FF}\u{1F1FC}' }, city: { name: 'Victoria Falls' }, editorialSummary: 'One of the largest curtains of falling water on earth, audible from two kilometres away.' },
  { name: 'Bwindi Impenetrable National Park', slug: 'bwindi-impenetrable-national-park', type: ['National Park'],               country: { name: 'Uganda',       slug: 'uganda',       flagEmoji: '\u{1F1FA}\u{1F1EC}' }, city: { name: 'Kigezi Region' },  editorialSummary: "Home to roughly half the world's remaining mountain gorilla population." },
  { name: 'Djemaa el-Fna',                    slug: 'djemaa-el-fna-marrakech',           type: ['Cultural Site', 'UNESCO'],     country: { name: 'Morocco',      slug: 'morocco',      flagEmoji: '\u{1F1F2}\u{1F1E6}' }, city: { name: 'Marrakech' },      editorialSummary: 'A square that transforms from morning market to night festival, recognised by UNESCO for its intangible heritage.' },
  { name: 'Sossusvlei Dunes',                 slug: 'sossusvlei-namib-desert',           type: ['Natural Wonder'],              country: { name: 'Namibia',      slug: 'namibia',      flagEmoji: '\u{1F1F3}\u{1F1E6}' }, city: { name: 'Namib-Naukluft' }, editorialSummary: 'The tallest dunes in the world change colour across a spectrum that has no adequate name in English.' },
  { name: 'Volcanoes National Park',           slug: 'volcanoes-national-park-rwanda',    type: ['National Park'],               country: { name: 'Rwanda',       slug: 'rwanda',       flagEmoji: '\u{1F1F7}\u{1F1FC}' }, city: { name: 'Musanze' },        editorialSummary: "Trekking through Virunga forest to find mountain gorilla families is one of Africa's defining wildlife experiences." },
  { name: 'Cape Point',                        slug: 'cape-point-south-africa',           type: ['Nature Reserve'],              country: { name: 'South Africa', slug: 'south-africa', flagEmoji: '\u{1F1FF}\u{1F1E6}' }, city: { name: 'Cape Town' },      editorialSummary: 'Where the Atlantic and the cliffs of the Cape Peninsula come together at the southwestern tip of the continent.' },
  { name: 'Lalibela Rock-Hewn Churches',       slug: 'lalibela-rock-hewn-churches',       type: ['UNESCO World Heritage Site'],  country: { name: 'Ethiopia',     slug: 'ethiopia',     flagEmoji: '\u{1F1EA}\u{1F1F9}' }, city: { name: 'Lalibela' },       editorialSummary: 'Eleven monolithic churches carved directly from the rock in the twelfth century and still used for active worship.' },
  { name: 'Maasai Mara National Reserve',     slug: 'maasai-mara-national-reserve',      type: ['National Reserve'],            country: { name: 'Kenya',        slug: 'kenya',        flagEmoji: '\u{1F1F0}\u{1F1EA}' }, city: { name: 'Narok County' },   editorialSummary: 'The Kenyan portion of the Serengeti ecosystem and the site of the annual Mara River crossing.' },
  { name: 'Stone Town',                       slug: 'stone-town-zanzibar',               type: ['UNESCO World Heritage Site'],  country: { name: 'Tanzania',     slug: 'tanzania',     flagEmoji: '\u{1F1F9}\u{1F1FF}' }, city: { name: 'Zanzibar' },       editorialSummary: 'Six centuries of Swahili, Arab, Indian, and British influence compressed into one navigable old town.' },
  { name: 'Ngorongoro Crater',                slug: 'ngorongoro-conservation-area',      type: ['UNESCO World Heritage Site'],  country: { name: 'Tanzania',     slug: 'tanzania',     flagEmoji: '\u{1F1F9}\u{1F1FF}' }, city: { name: 'Ngorongoro' },     editorialSummary: "The world's largest intact volcanic caldera contains one of the densest concentrations of wildlife in Africa." },
]

const ITEMS_PER_PAGE = 12

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const { page: pageParam, q } = await searchParams
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10))

  let attractions: AttractionSummary[] = []
  try {
    const data = await client.fetch<AttractionSummary[]>(ALL_ATTRACTIONS_QUERY)
    if (data && data.length > 0) attractions = data
    else attractions = FALLBACK_ATTRACTIONS
  } catch {
    attractions = FALLBACK_ATTRACTIONS
  }

  const filtered = q
    ? attractions.filter(a =>
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        a.country?.name.toLowerCase().includes(q.toLowerCase()) ||
        a.city?.name.toLowerCase().includes(q.toLowerCase())
      )
    : attractions

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(currentPage, totalPages)
  const start      = (safePage - 1) * ITEMS_PER_PAGE
  const page       = filtered.slice(start, start + ITEMS_PER_PAGE)

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden min-h-[480px] flex items-end">
        <Image
          src="https://picsum.photos/seed/attractions-landing-hero/1920/900"
          alt="Explore Africa" fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/65 to-ink/97"/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-14 pt-28">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-400/75 mb-4">Destination Guides</p>
          <h1
            className="font-display font-extrabold text-cream mb-5"
            style={{ fontSize: 'clamp(30px, 6vw, 68px)', lineHeight: '0.93', letterSpacing: '-0.03em' }}
          >
            Explore Africa.<br className="sm:hidden"/> One Place at a Time.
          </h1>
          <p className="font-sans text-cream/60 leading-relaxed mb-8 max-w-xl"
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

          {q && (
            <div className="mb-8 flex items-center gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-charcoal/45 dark-flip-muted">
                Results for &ldquo;{q}&rdquo;
              </p>
              <Link href="/attractions"
                className="font-mono text-[10px] uppercase tracking-[0.14em] text-crimson/70 hover:text-crimson transition-colors">
                Clear
              </Link>
            </div>
          )}

          {page.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-charcoal/30 dark-flip-muted mb-3">No results</p>
              <p className="font-sans text-sm text-charcoal/45 dark-flip-muted">Try a different search term or browse all guides.</p>
              <Link href="/attractions" className="mt-6 inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-crimson">Browse All Guides</Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {page.map(a => {
                const seed      = a.slug.split('').reduce((n: number, c: string) => n + c.charCodeAt(0), 0)
                const typeLabel = (a.type?.[0] ?? '').replace('UNESCO World Heritage Site | ', '')
                return (
                  <Link key={a.slug} href={`/attractions/${a.slug}`}
                    className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 overflow-hidden bg-sand">
                      <Image
                        src={`https://picsum.photos/seed/${seed}/800/500`}
                        alt={a.name} fill
                        sizes="(max-width:640px)100vw,(max-width:1024px)50vw,(max-width:1280px)33vw,25vw"
                        className="object-cover img-editorial img-inner"
                      />
                      {typeLabel && (
                        <span className="absolute top-3 left-3 bg-ink/75 backdrop-blur font-mono text-[8px] uppercase tracking-[0.13em] text-cream/80 px-2 py-0.5 rounded-full">
                          {typeLabel}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      {a.country && (
                        <div className="flex items-center gap-1.5 mb-2">
                          {a.country.flagEmoji && <span className="text-xs">{a.country.flagEmoji}</span>}
                          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-crimson">{a.country.name}</span>
                          {a.city && (
                            <>
                              <span className="text-charcoal/20 dark-flip-muted text-[8px]">·</span>
                              <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted">{a.city.name}</span>
                            </>
                          )}
                        </div>
                      )}
                      <h2 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2"
                        style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', letterSpacing: '-0.012em' }}>
                        {a.name}
                      </h2>
                      {a.editorialSummary && (
                        <p className="font-sans text-[12px] text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2">
                          {a.editorialSummary}
                        </p>
                      )}
                      <div className="mt-4 pt-3 border-t border-line dark-flip-border">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors">
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
                <Link href={`/attractions?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${safePage - 1}`}
                  className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/45 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link key={p} href={`/attractions?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${p}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-[11px] transition-all
                    ${p === safePage ? 'bg-crimson text-cream border border-crimson' : 'border border-line dark-flip-border text-charcoal/55 dark-flip-muted hover:border-crimson hover:text-crimson'}`}>
                  {p}
                </Link>
              ))}
              {safePage < totalPages && (
                <Link href={`/attractions?${q ? `q=${encodeURIComponent(q)}&` : ''}page=${safePage + 1}`}
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
