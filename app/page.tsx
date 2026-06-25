import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { EditorialSlider } from '@/components/EditorialSlider'
import { TypewriterHero } from '@/components/TypewriterHero'
import { HeroBackground } from '@/components/HeroBackground'
import { PlanTripCard } from '@/components/PlanTripCard'
import { DestinationsGrid } from '@/components/DestinationsGrid'
import { PopularPills } from '@/components/PopularPills'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyAfroWaka – Discover Africa Beyond the Stereotype',
  description:
    'Verified travel guides across Africa written by people who live here. Explore destinations, experiences, and insider knowledge from every corner of the continent.',
}

const FEATURED_QUERY = `
  *[_type == "attraction" && contentStatus == "Published"] | order(_updatedAt desc)[0..7]{
    name, "slug": slug.current, type, continentRegion, editorialSummary,
    "country": country->{ name, "slug": slug.current }
  }
`
const GUIDES_QUERY = `
  *[_type == "attraction" && contentStatus == "Published" && defined(articleBody) && length(articleBody) > 0]
  | order(_updatedAt desc)[0..3]{
    name, "slug": slug.current, editorialSummary, continentRegion, type, _updatedAt,
    "country": country->{ name, "slug": slug.current }
  }
`
const POPULAR_QUERY = `*[_type == "attraction" && contentStatus == "Published"][0..29]{ name, "slug": slug.current }`

type GuideItem = {
  name: string; slug: string; continentRegion: string
  editorialSummary: string; image: string; country: string
}
type AttrItem = { slug: string; name: string; editorialSummary?: string; continentRegion?: string; country?: { name: string } }

const EXPERIENCES = [
  { label: 'Safari',    slug: 'safari',  desc: 'The Big Five and beyond',               image: 'https://picsum.photos/seed/exp-safari-rnd/600/800'    },
  { label: 'Culture',   slug: 'culture', desc: 'Living traditions across the continent', image: 'https://picsum.photos/seed/exp-culture-rnd/600/800'   },
  { label: 'Beach',     slug: 'beach',   desc: 'Indian Ocean and Atlantic shores',       image: 'https://picsum.photos/seed/exp-beach-rnd/600/800'     },
  { label: 'History',   slug: 'history', desc: 'Ancient kingdoms and World Heritage',    image: 'https://picsum.photos/seed/exp-history-rnd/600/800'   },
  { label: 'Hiking',    slug: 'hiking',  desc: 'Trails from Simien to Table Mountain',   image: 'https://picsum.photos/seed/exp-hiking-rnd/600/800'    },
  { label: 'Food',      slug: 'food',    desc: 'Tagines, jollof, nyama choma',           image: 'https://picsum.photos/seed/exp-food-rnd/600/800'      },
]

const FALLBACK_GUIDES: GuideItem[] = [
  {
    name: 'Pyramids of Giza: The Complete Travel Guide',
    slug: 'pyramids-of-giza', continentRegion: 'North Africa', country: 'Egypt',
    editorialSummary: 'The last surviving Wonder of the Ancient World, standing on the Giza Plateau outside Cairo. Everything you need to know before you visit.',
    image: 'https://picsum.photos/seed/giza-guide-v2/900/1100',
  },
  {
    name: 'Bwindi Impenetrable Forest: Mountain Gorilla Encounter',
    slug: 'bwindi-impenetrable-national-park', continentRegion: 'East Africa', country: 'Uganda',
    editorialSummary: 'Home to half the world mountain gorilla population, Bwindi covers 321 square kilometres of southwestern Uganda.',
    image: 'https://picsum.photos/seed/bwindi-guide-v2/900/1100',
  },
  {
    name: 'Table Mountain: Everything You Need to Know',
    slug: 'table-mountain', continentRegion: 'Southern Africa', country: 'South Africa',
    editorialSummary: 'Cape Town iconic flat-topped summit rises 1,085 metres above sea level and harbours more plant species than the entire United Kingdom.',
    image: 'https://picsum.photos/seed/table-mtn-v2/900/1100',
  },
  {
    name: 'Serengeti National Park: The Migration Guide',
    slug: 'serengeti-national-park', continentRegion: 'East Africa', country: 'Tanzania',
    editorialSummary: 'The Great Migration moves 1.5 million wildebeest and 250,000 zebras in a continuous annual circuit across Tanzania and Kenya.',
    image: 'https://picsum.photos/seed/serengeti-v2/900/1100',
  },
]

const GALLERY_SEEDS = ['gallery-af-1', 'gallery-af-2', 'gallery-af-3', 'gallery-af-4', 'gallery-af-5', 'gallery-af-6']

export default async function HomePage() {
  const [featured, guides, popularRaw] = await Promise.all([
    client.fetch(FEATURED_QUERY).catch(() => []),
    client.fetch(GUIDES_QUERY).catch(() => []),
    client.fetch<{ name: string; slug: string }[]>(POPULAR_QUERY).catch(() => []),
  ])

  const popularAttractions = popularRaw.map((a: { name: string; slug: string }) => ({ label: a.name, slug: a.slug }))

  const displayGuides: GuideItem[] = guides.length > 0
    ? guides.slice(0, 4).map(
        (g: { name: string; slug: string; continentRegion: string; editorialSummary: string; country?: { name: string } }, i: number): GuideItem => ({
          name: g.name, slug: g.slug, continentRegion: g.continentRegion, editorialSummary: g.editorialSummary,
          image: FALLBACK_GUIDES[i % 4].image, country: g.country?.name ?? 'Africa',
        })
      )
    : FALLBACK_GUIDES

  return (
    <>
      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden">
        <HeroBackground src="https://picsum.photos/seed/africa-historical-landmark-hero/1920/1080" alt="African landmark at golden hour"/>
        <div className="absolute inset-0 bg-gradient-to-r from-[#070F09]/96 via-[#0A1A0C]/88 to-[#0E2010]/55"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#070F09]/60 via-transparent to-[#070F09]/15"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 lg:py-28">
          <div className="grid lg:grid-cols-7 gap-10 lg:gap-16 items-center">

            <div className="lg:col-span-4">
              {/* Headline — 2 lines on desktop AND mobile */}
              <h1
                className="font-display font-extrabold text-cream mb-7 tracking-hero"
                style={{ fontSize: 'clamp(46px, 4.2vw, 64px)', lineHeight: '0.94' }}
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

              {/* Sub-headline */}
              <p className="font-display font-medium text-cream/75 mb-10 max-w-lg leading-relaxed"
                style={{ fontSize: 'clamp(13px, 1.5vw, 16px)' }}>
                Discover hidden gems. Plan your dream trips.
                Get insider travel tips from explorers who live and breathe Africa.
              </p>

              {/* Search */}
              <form action="/search" method="GET" className="relative max-w-lg mb-6">
                <div className="flex bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.55)]">
                  <div className="flex items-center pl-5 pr-3 text-charcoal/35 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input name="q" type="search" placeholder="Egypt, safari, Zanzibar..."
                    className="flex-1 py-4 pr-4 text-sm font-sans text-charcoal placeholder-charcoal/35 bg-transparent focus:outline-none"/>
                  <button type="submit"
                    className="m-1.5 bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[11px] uppercase tracking-[0.10em] px-5 py-3 rounded-xl transition-all btn-magnetic">
                    Search
                  </button>
                </div>
              </form>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-cream/30 mb-3">Popular searches:</p>
                <PopularPills attractions={popularAttractions} />
              </div>
            </div>

            {/* PlanTripCard — desktop only */}
            <div className="hidden lg:block lg:col-span-3">
              <PlanTripCard />
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-cream">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-cream to-transparent"/>
        </div>
      </section>

      {/* ══ DESTINATIONS — 6 random countries, 1 row desktop, 2 col mobile ════ */}
      <section className="py-24 lg:py-32 bg-cream dark-flip-bg" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial mb-12"
            style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
            Where Will You Go Next?
          </h2>

          {/* Client component handles random selection on each load */}
          <DestinationsGrid />

          <div className="mt-10 flex justify-center">
            <Link href="/search"
              className="inline-flex items-center gap-2.5 bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all btn-magnetic shadow-[0_4px_24px_rgba(180,30,30,0.28)] hover:shadow-[0_8px_36px_rgba(180,30,30,0.38)]">
              All Destinations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ EDITORIAL SPOTLIGHT ════════════════════════════════════════════════ */}
      <EditorialSlider />

      {/* ══ FEATURED ATTRACTIONS (was: Latest Travel Guides) ══════════════════ */}
      <section className="py-24 lg:py-32 bg-sand dark-flip-surf" id="guides" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-end justify-between mb-12">
            <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
              style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
              Featured Attractions
            </h2>
            <Link href="/search"
              className="inline-link link-arrow hidden sm:inline-flex font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/40 dark-flip-muted hover:text-crimson transition-colors">
              All attractions
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">

            {/* Card 1: Tall photo-first */}
            <Link href={`/attractions/${displayGuides[0].slug}`}
              className="card-zoom group relative rounded-3xl overflow-hidden lg:row-span-2 min-h-[400px] lg:min-h-[580px] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 flex flex-col">
              <Image src={displayGuides[0].image} alt={displayGuides[0].name} fill
                sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                className="object-cover img-editorial img-inner"/>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/97 via-ink/50 to-transparent"/>
              <div className="relative mt-auto p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-display font-bold text-[11px] uppercase tracking-[0.12em] text-gold-400">{displayGuides[0].country}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-cream group-hover:text-gold-300 transition-colors leading-snug mb-3"
                  style={{ letterSpacing: '-0.018em' }}>
                  {displayGuides[0].name}
                </h3>
                <p className="font-sans text-[15px] text-cream/68 leading-relaxed line-clamp-2 mb-5">
                  {displayGuides[0].editorialSummary}
                </p>
                <span className="link-arrow inline-link font-mono text-[10px] uppercase tracking-[0.14em] text-gold-400 group-hover:text-gold-300">
                  Read guide
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </span>
              </div>
            </Link>

            {/* Cards 2 and 3 */}
            {[displayGuides[1], displayGuides[2]].map((g) => (
              <Link key={g.slug} href={`/attractions/${g.slug}`}
                className="card-zoom group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-48 shrink-0 overflow-hidden">
                  <Image src={g.image} alt={g.name} fill sizes="(max-width:640px) 100vw,50vw"
                    className="object-cover img-editorial img-inner"/>
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/92 backdrop-blur font-mono text-[8px] uppercase tracking-[0.14em] text-charcoal/60 px-2.5 py-1 rounded-full">
                      {g.continentRegion}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="font-display font-bold text-[11px] uppercase tracking-[0.12em] text-crimson">{g.country}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2 flex-1"
                    style={{ letterSpacing: '-0.015em' }}>
                    {g.name}
                  </h3>
                  <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
                    {g.editorialSummary}
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t border-line dark-flip-border">
                    <span className="link-arrow inline-link font-mono text-[10px] text-crimson">
                      Read
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Card 4: Wide horizontal */}
            <Link href={`/attractions/${displayGuides[3].slug}`}
              className="card-zoom group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 lg:col-span-2 flex flex-col sm:flex-row">
              <div className="relative h-52 sm:h-auto sm:w-72 lg:w-96 shrink-0 overflow-hidden">
                <Image src={displayGuides[3].image} alt={displayGuides[3].name} fill sizes="(max-width:640px) 100vw,384px"
                  className="object-cover img-editorial img-inner"/>
                <div className="absolute top-3 left-3">
                  <span className="bg-white/92 backdrop-blur font-mono text-[8px] uppercase tracking-[0.14em] text-charcoal/60 px-2.5 py-1 rounded-full">
                    {displayGuides[3].continentRegion}
                  </span>
                </div>
              </div>
              <div className="p-7 lg:p-8 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-display font-bold text-[11px] uppercase tracking-[0.12em] text-crimson">{displayGuides[3].country}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-3"
                  style={{ letterSpacing: '-0.018em' }}>
                  {displayGuides[3].name}
                </h3>
                <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-3 mb-5">
                  {displayGuides[3].editorialSummary}
                </p>
                <div className="flex items-center justify-end pt-4 border-t border-line dark-flip-border">
                  <span className="link-arrow inline-link font-mono text-[10px] text-crimson">
                    Read the guide
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* View all — prominent solid button */}
          <div className="mt-12 flex justify-center">
            <Link href="/search"
              className="inline-flex items-center gap-2.5 bg-ink hover:bg-charcoal text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all btn-magnetic shadow-[0_4px_24px_rgba(26,24,19,0.22)] hover:shadow-[0_8px_36px_rgba(26,24,19,0.32)]">
              View All Attractions
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ EXPLORE BY EXPERIENCE — 1 row 6 cols desktop, 2 col mobile ════════ */}
      <section className="py-24 lg:py-32 bg-cream dark-flip-bg" id="experiences" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-end justify-between mb-12">
            <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
              style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
              Explore by Experience
            </h2>
          </div>

          {/* 2 col mobile, 6 col desktop — all cards uniform */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
            {EXPERIENCES.map((e) => (
              <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.slug)}`}
                className="card-zoom group relative rounded-2xl overflow-hidden aspect-[3/4] lg:aspect-[2/3] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500">
                <Image src={e.image} alt={e.label} fill
                  sizes="(max-width:1024px) 50vw, 17vw"
                  className="object-cover img-editorial img-inner"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="font-display font-bold text-sm lg:text-[13px] text-cream group-hover:text-gold-300 transition-colors leading-tight"
                    style={{ letterSpacing: '-0.01em' }}>
                    {e.label}
                  </h3>
                  <p className="font-sans text-[10px] text-cream/55 mt-1 leading-tight hidden lg:block">{e.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LATEST TRAVEL ATTRACTIONS (was: Featured Attractions) ════════════════ */}
      {(featured as AttrItem[]).length > 0 && (
        <section className="py-24 lg:py-32 bg-sand dark-flip-surf" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            <div className="flex items-end justify-between mb-12">
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
                Latest Travel Attractions
              </h2>
              <Link href="/search"
                className="inline-link link-arrow hidden sm:inline-flex font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/40 dark-flip-muted hover:text-crimson transition-colors">
                Browse all
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {(featured as AttrItem[]).slice(0, 8).map((a) => (
                <Link key={a.slug} href={`/attractions/${a.slug}`}
                  className="card-zoom group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500">
                  <Image
                    src={`https://picsum.photos/seed/${a.slug}/700/900`}
                    alt={a.name} fill
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                    className="object-cover img-editorial img-inner"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/97 via-ink/35 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-gold-400 mb-1">{a.continentRegion}</p>
                    <h3 className="font-display font-bold text-base text-cream group-hover:text-gold-300 transition-colors leading-tight mb-1"
                      style={{ letterSpacing: '-0.015em' }}>
                      {a.name}
                    </h3>
                    {a.editorialSummary && (
                      <p className="font-sans text-[11px] text-cream/60 leading-snug line-clamp-2 mt-1">{a.editorialSummary}</p>
                    )}
                    {a.country?.name && (
                      <p className="font-mono text-[9px] text-cream/40 mt-2">{a.country.name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
              <button disabled aria-label="Previous page"
                className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/30 disabled:opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              {[1, 2, 3, 4, 5].map(n => (
                <Link key={n} href={n === 1 ? '/search' : `/search?page=${n}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-[13px] transition-all
                    ${n === 1 ? 'bg-ink text-cream shadow-[var(--shadow-soft)]' : 'border border-line dark-flip-border text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson'}`}>
                  {n}
                </Link>
              ))}
              <span className="font-mono text-[11px] text-charcoal/30 px-1">...</span>
              <Link href="/search?page=9"
                className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center font-display font-semibold text-[13px] text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                9
              </Link>
              <Link href="/search?page=2" aria-label="Next page"
                className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/50 dark-flip-muted hover:text-crimson hover:border-crimson transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ INSTAGRAM GALLERY ══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-cream dark-flip-bg" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-crimson mb-2">@myafrowaka_</p>
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(20px, 2.5vw, 34px)' }}>
                Follow Our Journey
              </h2>
            </div>
            <a href="https://instagram.com/myafrowaka_" target="_blank" rel="noopener noreferrer"
              className="inline-link link-arrow hidden sm:inline-flex font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/40 dark-flip-muted hover:text-crimson transition-colors">
              Instagram
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {GALLERY_SEEDS.map(seed => (
              <a key={seed} href="https://instagram.com/myafrowaka_" target="_blank" rel="noopener noreferrer"
                className="card-zoom group relative aspect-square rounded-xl overflow-hidden bg-sand dark-flip-surf">
                <Image src={`https://picsum.photos/seed/${seed}/600/600`} alt="MyAfroWaka on Instagram" fill sizes="(max-width:640px) 33vw,17vw"
                  className="object-cover img-editorial img-inner"/>
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cream opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═════════════════════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 overflow-hidden" data-reveal>
        <Image src="https://picsum.photos/seed/cta-v2/1920/700" alt="" fill className="object-cover img-editorial"/>
        <div className="absolute inset-0 bg-ink/88"/>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display font-extrabold text-cream mb-6 tracking-hero"
            style={{ fontSize: 'clamp(40px, 4.5vw, 64px)', lineHeight: '0.94' }}>
            Your African Adventure Starts Here.
          </h2>
          <p className="font-sans text-cream/68 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            From ancient wonders to rooftop bars. From gorilla forests to Sahara sand dunes.
            Every journey across this continent starts with knowing where to go.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search"
              className="inline-flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all btn-magnetic">
              Explore Destinations
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <Link href="/about"
              className="inline-flex items-center justify-center border border-white/25 hover:border-white/55 text-cream/75 hover:text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-colors">
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
