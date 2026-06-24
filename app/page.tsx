import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { EditorialSlider } from '@/components/EditorialSlider'
import { TypewriterHero } from '@/components/TypewriterHero'
import { HeroBackground } from '@/components/HeroBackground'
import { PlanTripCard } from '@/components/PlanTripCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyAfroWaka – Discover Africa Beyond the Stereotype',
  description:
    'Verified travel guides to 557 destinations across 47 African countries. Written by Africans, fact-checked, zero fabrications. Explore by region, experience, or country.',
}

// ─── GROQ queries ──────────────────────────────────────────────────────────

const FEATURED_QUERY = `
  *[_type == "attraction" && contentStatus == "Published"] | order(_updatedAt desc)[0..7]{
    name, "slug": slug.current, type, continentRegion, editorialSummary,
    "country": country->{ name, "slug": slug.current }
  }
`
const TOP_COUNTRIES_QUERY = `
  *[_type == "country"]{
    name, "slug": slug.current, continentRegion, flagEmoji,
    "count": count(*[_type == "attraction" && contentStatus == "Published" && references(^._id)])
  } | order(count desc)[0..5]
`
const GUIDES_QUERY = `
  *[_type == "attraction" && contentStatus == "Published" && defined(articleBody) && length(articleBody) > 0]
  | order(_updatedAt desc)[0..3]{
    name, "slug": slug.current, editorialSummary, continentRegion, type, _updatedAt,
    "country": country->{ name, "slug": slug.current }
  }
`

// ─── types ────────────────────────────────────────────────────────────────

type GuideItem = {
  name: string; slug: string; continentRegion: string
  editorialSummary: string; image: string; readTime: number; country: string; date: string
}
type DestItem = { name: string; slug: string; region: string; flag: string; count: number; color: string; image: string }
type AttrItem = { slug: string; name: string; editorialSummary?: string; continentRegion?: string; country?: { name: string } }

// ─── static fallback data ─────────────────────────────────────────────────

const FALLBACK_DESTINATIONS: DestItem[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',    flag: '🇪🇬', count: 14, color: '#A22E29', image: 'https://picsum.photos/seed/egypt-dest/900/1200'    },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',     flag: '🇰🇪', count: 18, color: '#3F6A3D', image: 'https://picsum.photos/seed/kenya-dest/900/1200'    },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa', flag: '🇿🇦', count: 12, color: '#29251A', image: 'https://picsum.photos/seed/capetown-dest/900/1200' },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',     flag: '🇹🇿', count: 9,  color: '#B28E38', image: 'https://picsum.photos/seed/tanzania-dest/900/1200' },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',    flag: '🇲🇦', count: 22, color: '#8C4A28', image: 'https://picsum.photos/seed/morocco-dest/900/1200'  },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',     flag: '🇬🇭', count: 11, color: '#3B403E', image: 'https://picsum.photos/seed/ghana-dest/900/1200'    },
]

const EXPERIENCES = [
  { label: 'Safari',    slug: 'safari',  desc: 'The Big Five and beyond',              image: 'https://picsum.photos/seed/safari-exp-v2/600/800'   },
  { label: 'Culture',   slug: 'culture', desc: 'Living traditions across the continent', image: 'https://picsum.photos/seed/culture-exp-v2/600/800'  },
  { label: 'Beach',     slug: 'beach',   desc: 'Indian Ocean and Atlantic shores',      image: 'https://picsum.photos/seed/beach-exp-v2/600/800'    },
  { label: 'History',   slug: 'history', desc: 'Ancient kingdoms and World Heritage',   image: 'https://picsum.photos/seed/history-exp-v2/600/800'  },
  { label: 'Hiking',    slug: 'hiking',  desc: 'Trails from Simien to Table Mountain',  image: 'https://picsum.photos/seed/hiking-exp-v2/600/800'   },
  { label: 'Food',      slug: 'food',    desc: 'Tagines, jollof, nyama choma',          image: 'https://picsum.photos/seed/food-exp-v2/600/800'     },
]

const FALLBACK_GUIDES: GuideItem[] = [
  {
    name: 'Pyramids of Giza: The Complete Travel Guide',
    slug: 'pyramids-of-giza', continentRegion: 'North Africa', country: 'Egypt',
    editorialSummary: 'The last surviving Wonder of the Ancient World, standing on the Giza Plateau outside Cairo. Everything you need to know before you visit.',
    image: 'https://picsum.photos/seed/giza-guide-v2/900/1100', readTime: 12, date: '2026-06-01',
  },
  {
    name: 'Bwindi Impenetrable Forest: Mountain Gorilla Encounter',
    slug: 'bwindi-impenetrable-national-park', continentRegion: 'East Africa', country: 'Uganda',
    editorialSummary: 'Home to half the world mountain gorilla population, Bwindi covers 321 square kilometres of southwestern Uganda.',
    image: 'https://picsum.photos/seed/bwindi-guide-v2/900/1100', readTime: 10, date: '2026-05-15',
  },
  {
    name: 'Table Mountain: Everything You Need to Know',
    slug: 'table-mountain', continentRegion: 'Southern Africa', country: 'South Africa',
    editorialSummary: 'Cape Town iconic flat-topped summit rises 1,085 metres above sea level and harbours more plant species than the entire United Kingdom.',
    image: 'https://picsum.photos/seed/table-mtn-v2/900/1100', readTime: 9, date: '2026-05-01',
  },
  {
    name: 'Serengeti National Park: The Migration Guide',
    slug: 'serengeti-national-park', continentRegion: 'East Africa', country: 'Tanzania',
    editorialSummary: 'The Great Migration moves 1.5 million wildebeest and 250,000 zebras in a continuous annual circuit across Tanzania and Kenya.',
    image: 'https://picsum.photos/seed/serengeti-v2/900/1100', readTime: 14, date: '2026-04-20',
  },
]

const POPULAR_SEARCHES = ['Victoria Falls', 'Pyramids of Giza', 'Serengeti', 'Zanzibar', 'Gorilla Trek']
const GALLERY_SEEDS = ['gallery-af-1', 'gallery-af-2', 'gallery-af-3', 'gallery-af-4', 'gallery-af-5', 'gallery-af-6']

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── page ─────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featured, topCountries, guides] = await Promise.all([
    client.fetch(FEATURED_QUERY).catch(() => []),
    client.fetch(TOP_COUNTRIES_QUERY).catch(() => []),
    client.fetch(GUIDES_QUERY).catch(() => []),
  ])

  const destinations: DestItem[] = topCountries.filter((c: { count: number }) => c.count > 0).length > 0
    ? topCountries.filter((c: { count: number }) => c.count > 0).slice(0, 6).map(
        (c: { name: string; slug: string; continentRegion: string; flagEmoji: string; count: number }, i: number): DestItem => ({
          name: c.name, slug: c.slug, region: c.continentRegion, flag: c.flagEmoji || '🌍', count: c.count,
          color: FALLBACK_DESTINATIONS[i % 6].color, image: FALLBACK_DESTINATIONS[i % 6].image,
        })
      )
    : FALLBACK_DESTINATIONS

  const displayGuides: GuideItem[] = guides.length > 0
    ? guides.slice(0, 4).map(
        (g: { name: string; slug: string; continentRegion: string; editorialSummary: string; _updatedAt: string; country?: { name: string } }, i: number): GuideItem => ({
          name: g.name, slug: g.slug, continentRegion: g.continentRegion, editorialSummary: g.editorialSummary,
          image: FALLBACK_GUIDES[i % 4].image, readTime: FALLBACK_GUIDES[i % 4].readTime,
          country: g.country?.name ?? 'Africa', date: g._updatedAt ?? FALLBACK_GUIDES[i % 4].date,
        })
      )
    : FALLBACK_GUIDES

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO — full-commitment editorial layout
          $10K: Large headline dominates, nothing competes for attention
          on mobile; Plan a Trip card lives to the right on desktop.
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden">

        <HeroBackground
          src="https://picsum.photos/seed/myafrowaka-hero-v2/1920/1080"
          alt="African landscape at golden hour"
        />
        {/* Heavy left gradient so text always pops — editorial POV */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070F09]/96 via-[#0A1A0C]/88 to-[#0E2010]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070F09]/60 via-transparent to-[#070F09]/15" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20 lg:py-28">
          <div className="grid lg:grid-cols-7 gap-10 lg:gap-16 items-center">

            {/* Left col: spans 4/7 — headline dominates */}
            <div className="lg:col-span-4">
              {/* Editorial overline */}
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold-400 mb-6 flex items-center gap-3">
                <span className="inline-block w-8 h-px bg-gold-400 opacity-60"/>
                Africa Travel, Unfiltered
              </p>

              {/* Headline — dramatically large with tight tracking */}
              <h1
                className="font-display font-extrabold text-cream mb-7 tracking-hero"
                style={{ fontSize: 'clamp(52px, 7.5vw, 96px)', lineHeight: '0.9' }}
              >
                <TypewriterHero
                  speed={30}
                  lines={[
                    { text: 'Explore Africa' },
                    { text: ' One Adventure' },
                    { text: ' at a Time.' },
                  ]}
                />
              </h1>

              {/* Editorial sub-headline: larger, more distinct from body */}
              <p className="font-display font-medium text-cream/75 mb-10 max-w-lg leading-relaxed"
                style={{ fontSize: 'clamp(15px, 2vw, 19px)' }}>
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

              {/* Popular searches */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cream/30 mr-1">Popular:</span>
                {POPULAR_SEARCHES.map(q => (
                  <Link key={q} href={`/search?q=${encodeURIComponent(q)}`}
                    className="inline-link font-sans text-[12px] text-cream/55 border border-white/15 hover:border-white/35 hover:text-cream/85 rounded-full px-3 py-1 transition-colors">
                    {q}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right col: spans 3/7 — Plan a Trip, slightly smaller footprint */}
            <div className="lg:col-span-3">
              <PlanTripCard />
            </div>
          </div>
        </div>

        {/* Bottom: subtle scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-cream">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-cream to-transparent"/>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          EDITORIAL BRAND STRIP — restrained, signals commitment
          $10K: A thin strip that reads as intention, not decoration.
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-ink border-b border-white/6 py-4 overflow-hidden">
        <div className="marquee-wrap">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, rep) => (
              <div key={rep} className="flex items-center gap-12 px-8">
                {[
                  '557 Verified Guides',
                  '47 African Countries',
                  'Zero Fabrications',
                  'Written from Inside the Continent',
                  'Fact-Checked by Locals',
                  '50+ Published Articles',
                ].map(item => (
                  <span key={item} className="flex items-center gap-12 shrink-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream/45 whitespace-nowrap">{item}</span>
                    <span className="w-1 h-1 rounded-full bg-gold-400/40 shrink-0"/>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          DESTINATIONS — editorial photo grid
          $10K: Not a uniform 6-col grid. Lead with a featured card.
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-cream dark-flip-bg" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Section header with editorial number */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="section-num text-charcoal dark-flip-text block mb-3">01 / Destinations</span>
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: '1.0' }}>
                Where Will You<br className="hidden sm:block"/> Go Next?
              </h2>
            </div>
            <Link href="/search"
              className="inline-link link-arrow hidden sm:inline-flex font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/40 dark-flip-muted hover:text-crimson transition-colors">
              All 47 countries
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          {/* Editorial grid: one featured (tall 2-row) + 5 regular */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 lg:grid-rows-2 gap-3 sm:gap-4">

            {/* Featured: spans 2 cols + 2 rows on desktop */}
            <Link href={`/search?q=${encodeURIComponent(destinations[0].name)}`}
              className="card-zoom group relative rounded-2xl overflow-hidden col-span-2 sm:col-span-1 lg:col-span-2 lg:row-span-2 aspect-[4/3] sm:aspect-[3/4] lg:aspect-auto shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500">
              <div className="absolute inset-0" style={{ backgroundColor: destinations[0].color }}/>
              <Image src={destinations[0].image} alt={destinations[0].name} fill
                sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,34vw"
                className="object-cover img-editorial mix-blend-multiply opacity-60 img-inner"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/20 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-cream/60 mb-1">{destinations[0].flag} {destinations[0].region}</p>
                <h3 className="font-display font-bold text-xl sm:text-3xl lg:text-4xl text-cream group-hover:text-gold-300 transition-colors leading-tight"
                  style={{ letterSpacing: '-0.02em' }}>
                  {destinations[0].name}
                </h3>
                <p className="font-mono text-[9px] text-cream/45 mt-2">{destinations[0].count} guides</p>
              </div>
            </Link>

            {/* 5 regular cards */}
            {destinations.slice(1).map((d: DestItem) => (
              <Link key={d.name} href={`/search?q=${encodeURIComponent(d.name)}`}
                className="card-zoom group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500">
                <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
                <Image src={d.image} alt={d.name} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,17vw"
                  className="object-cover img-editorial mix-blend-multiply opacity-60 img-inner"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/10 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-cream/55 mb-1">{d.flag} {d.region.split(' ')[0]}</p>
                  <h3 className="font-display font-bold text-sm sm:text-base text-cream group-hover:text-gold-300 transition-colors leading-tight"
                    style={{ letterSpacing: '-0.015em' }}>
                    {d.name}
                  </h3>
                  <p className="font-mono text-[9px] text-cream/40 mt-1">{d.count} guides</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          EDITORIAL SPOTLIGHT — auto-advancing slider, full-bleed
      ══════════════════════════════════════════════════════════════ */}
      <EditorialSlider />

      {/* ══════════════════════════════════════════════════════════════
          LATEST TRAVEL GUIDES — masonry layout
          $10K: Guide body text larger, country/date bolder, breathing room.
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-sand dark-flip-surf" id="guides" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="section-num text-charcoal dark-flip-text block mb-3">02 / Guides</span>
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: '1.0' }}>
                Latest Travel<br className="hidden sm:block"/> Guides
              </h2>
            </div>
            <Link href="/search"
              className="inline-link link-arrow hidden sm:inline-flex font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/40 dark-flip-muted hover:text-crimson transition-colors">
              All guides
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">

            {/* Card 1: Tall (spans 2 rows) — photo-first overlay */}
            <Link href={`/attractions/${displayGuides[0].slug}`}
              className="card-zoom group relative rounded-3xl overflow-hidden lg:row-span-2 min-h-[400px] lg:min-h-[580px] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 flex flex-col">
              <Image src={displayGuides[0].image} alt={displayGuides[0].name} fill
                sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                className="object-cover img-editorial img-inner"/>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/97 via-ink/50 to-transparent"/>
              <div className="relative mt-auto p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-display font-bold text-[11px] uppercase tracking-[0.12em] text-gold-400">{displayGuides[0].country}</span>
                  <span className="w-1 h-1 rounded-full bg-white/25"/>
                  <span className="font-mono text-[10px] font-bold text-white/45">{fmt(displayGuides[0].date)}</span>
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

            {/* Cards 2 and 3: right column, stacked */}
            {[displayGuides[1], displayGuides[2]].map((g, idx) => (
              <Link key={g.slug} href={`/attractions/${g.slug}`}
                className="card-zoom group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-48 shrink-0 overflow-hidden">
                  <Image src={g.image} alt={g.name} fill sizes="(max-width:640px) 100vw,50vw"
                    className="object-cover img-editorial img-inner" data-delay={idx === 1 ? '100' : '0'}/>
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/92 backdrop-blur font-mono text-[8px] uppercase tracking-[0.14em] text-charcoal/60 px-2.5 py-1 rounded-full">
                      {g.continentRegion}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="font-display font-bold text-[11px] uppercase tracking-[0.12em] text-crimson">{g.country}</span>
                    <span className="w-1 h-1 rounded-full bg-charcoal/20 dark-flip-border"/>
                    <span className="font-mono text-[10px] font-bold text-charcoal/45 dark-flip-muted">{fmt(g.date)}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2 flex-1"
                    style={{ letterSpacing: '-0.015em' }}>
                    {g.name}
                  </h3>
                  <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
                    {g.editorialSummary}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-line dark-flip-border">
                    <span className="font-mono text-[10px] text-charcoal/40 dark-flip-muted">{g.readTime} min read</span>
                    <span className="link-arrow inline-link font-mono text-[10px] text-crimson">
                      Read
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Card 4: Wide horizontal (spans 2 cols) */}
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
                  <span className="w-1 h-1 rounded-full bg-charcoal/20"/>
                  <span className="font-mono text-[10px] font-bold text-charcoal/45 dark-flip-muted">{fmt(displayGuides[3].date)}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-3"
                  style={{ letterSpacing: '-0.018em' }}>
                  {displayGuides[3].name}
                </h3>
                <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-3 mb-5">
                  {displayGuides[3].editorialSummary}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-line dark-flip-border">
                  <span className="font-mono text-[10px] text-charcoal/40 dark-flip-muted">{displayGuides[3].readTime} min read</span>
                  <span className="link-arrow inline-link font-mono text-[10px] text-crimson">
                    Read the guide
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* View all — editorial link style */}
          <div className="mt-12 flex justify-center">
            <Link href="/search"
              className="inline-link link-arrow border border-charcoal/20 dark-flip-border hover:border-crimson text-charcoal/55 dark-flip-muted hover:text-crimson font-display font-semibold text-[13px] px-8 py-3.5 rounded-full transition-all hover:scale-[1.02]">
              View all travel guides
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          EDITORIAL PULL QUOTE — $10K: anchor point, creates hierarchy
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-ink overflow-hidden" data-reveal>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-8 h-px bg-gold-400 mx-auto mb-8 opacity-60"/>
          <blockquote
            className="font-display font-bold text-cream leading-tight mb-8 tracking-editorial"
            style={{ fontSize: 'clamp(22px, 3.5vw, 42px)', letterSpacing: '-0.02em' }}>
            "Africa is not a destination. It is a conversation that never ends. We are here to help you start it."
          </blockquote>
          <div className="w-8 h-px bg-gold-400 mx-auto mb-6 opacity-60"/>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-cream/35">MyAfroWaka Editorial Team</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          EXPERIENCES — photo grid
          $10K: Varied sizing breaks the uniform-grid template feel.
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 bg-cream dark-flip-bg" id="experiences" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="section-num text-charcoal dark-flip-text block mb-3">03 / Experiences</span>
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: '1.0' }}>
                Explore by<br className="hidden sm:block"/> Experience
              </h2>
            </div>
          </div>

          {/*
            Editorial grid: first card is wide (col-span-2),
            the rest are single. Breaks the "6 equal cards" template.
          */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {EXPERIENCES.map((e, i) => (
              <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.slug)}`}
                className={`card-zoom group relative rounded-2xl overflow-hidden hover:shadow-[var(--shadow-lift)] transition-shadow duration-500
                  ${i === 0 ? 'col-span-2 aspect-video sm:aspect-[21/9] lg:aspect-video' : 'aspect-[3/4]'}`}>
                <Image src={e.image} alt={e.label} fill
                  sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                  className="object-cover img-editorial img-inner"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <h3 className="font-display font-bold text-sm sm:text-base text-cream group-hover:text-gold-300 transition-colors leading-tight"
                    style={{ letterSpacing: '-0.01em' }}>
                    {e.label}
                  </h3>
                  <p className="font-sans text-[11px] text-cream/60 mt-1 leading-tight hidden sm:block">{e.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED ATTRACTIONS — Sanity-powered with pagination
      ══════════════════════════════════════════════════════════════ */}
      {(featured as AttrItem[]).length > 0 && (
        <section className="py-24 lg:py-32 bg-sand dark-flip-surf" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="section-num text-charcoal dark-flip-text block mb-3">04 / Attractions</span>
                <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                  style={{ fontSize: 'clamp(30px, 4vw, 52px)', lineHeight: '1.0' }}>
                  Featured<br className="hidden sm:block"/> Attractions
                </h2>
              </div>
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

            {/* Pagination */}
            <div className="mt-12 flex items-center justify-center gap-2">
              <button disabled aria-label="Previous page"
                className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/30 disabled:opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              {[1, 2, 3, 4, 5].map(n => (
                <Link key={n} href={n === 1 ? '/search' : `/search?page=${n}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-[13px] transition-all
                    ${n === 1
                      ? 'bg-ink text-cream shadow-[var(--shadow-soft)]'
                      : 'border border-line dark-flip-border text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson'}`}>
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

      {/* ══════════════════════════════════════════════════════════════
          PHOTO GALLERY — social feed strip
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-cream dark-flip-bg" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-crimson mb-2">@myafrowaka_</p>
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(26px, 3.5vw, 44px)' }}>
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

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER — committed, not hedging
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 overflow-hidden" data-reveal>
        <Image src="https://picsum.photos/seed/cta-v2/1920/700" alt="" fill className="object-cover img-editorial"/>
        <div className="absolute inset-0 bg-ink/88"/>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="section-num text-cream/40 block mb-4">MyAfroWaka</span>
          <h2 className="font-display font-extrabold text-cream mb-6 tracking-hero"
            style={{ fontSize: 'clamp(32px, 5vw, 64px)', lineHeight: '0.92' }}>
            Your African Adventure<br/> Starts Here.
          </h2>
          <p className="font-sans text-cream/68 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            557 verified guides across 47 countries. No stereotypes, no guesswork. Just Africa, told honestly.
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
