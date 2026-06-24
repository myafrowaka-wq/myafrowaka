import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { AfricaMap } from '@/components/AfricaMap'
import { EditorialSlider } from '@/components/EditorialSlider'
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

// ─── static data ─────────────────────────────────────────────────────────

const FALLBACK_DESTINATIONS: DestItem[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',    flag: '🇪🇬', count: 14, color: '#A22E29', image: 'https://picsum.photos/seed/egypt-dest-card/800/600'    },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',     flag: '🇰🇪', count: 18, color: '#3F6A3D', image: 'https://picsum.photos/seed/kenya-dest-card/800/600'    },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa', flag: '🇿🇦', count: 12, color: '#29251A', image: 'https://picsum.photos/seed/sa-dest-card/800/600'       },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',     flag: '🇹🇿', count: 9,  color: '#B28E38', image: 'https://picsum.photos/seed/tanzania-dest-card/800/600' },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',    flag: '🇲🇦', count: 22, color: '#B55D39', image: 'https://picsum.photos/seed/morocco-dest-card/800/600'  },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',     flag: '🇬🇭', count: 11, color: '#3B403E', image: 'https://picsum.photos/seed/ghana-dest-card/800/600'    },
]

const EXPERIENCES = [
  { label: 'Safari',    slug: 'safari',   desc: 'The Big Five and beyond',              image: 'https://picsum.photos/seed/safari-exp/600/700'   },
  { label: 'Culture',   slug: 'culture',  desc: 'Living traditions across the continent', image: 'https://picsum.photos/seed/culture-exp/600/700'  },
  { label: 'Beach',     slug: 'beach',    desc: 'Indian Ocean and Atlantic shores',      image: 'https://picsum.photos/seed/beach-exp/600/700'    },
  { label: 'History',   slug: 'history',  desc: 'Ancient kingdoms and World Heritage',   image: 'https://picsum.photos/seed/history-exp/600/700'  },
  { label: 'Hiking',    slug: 'hiking',   desc: 'Trails from Simien to Table Mountain',  image: 'https://picsum.photos/seed/hiking-exp/600/700'   },
  { label: 'Food',      slug: 'food',     desc: 'Tagines, jollof, nyama choma',          image: 'https://picsum.photos/seed/food-exp/600/700'     },
]

const FALLBACK_GUIDES: GuideItem[] = [
  {
    name: 'Pyramids of Giza: The Complete Travel Guide',
    slug: 'pyramids-of-giza', continentRegion: 'North Africa', country: 'Egypt',
    editorialSummary: 'The last surviving Wonder of the Ancient World, standing on the Giza Plateau outside Cairo. Everything you need to know before you visit.',
    image: 'https://picsum.photos/seed/giza-guide-card/800/600', readTime: 12, date: '2026-06-01',
  },
  {
    name: 'Bwindi Impenetrable Forest: Mountain Gorilla Encounter',
    slug: 'bwindi-impenetrable-national-park', continentRegion: 'East Africa', country: 'Uganda',
    editorialSummary: 'Home to half the world mountain gorilla population, Bwindi covers 321 square kilometres of southwestern Uganda.',
    image: 'https://picsum.photos/seed/bwindi-guide-card/800/600', readTime: 10, date: '2026-05-15',
  },
  {
    name: 'Table Mountain: Everything You Need to Know',
    slug: 'table-mountain', continentRegion: 'Southern Africa', country: 'South Africa',
    editorialSummary: 'Cape Town iconic flat-topped summit rises 1,085 metres above sea level and harbours more plant species than the entire United Kingdom.',
    image: 'https://picsum.photos/seed/table-mtn-guide/800/600', readTime: 9, date: '2026-05-01',
  },
  {
    name: 'Serengeti National Park: The Migration Guide',
    slug: 'serengeti-national-park', continentRegion: 'East Africa', country: 'Tanzania',
    editorialSummary: 'The Great Migration moves 1.5 million wildebeest and 250,000 zebras in a continuous annual circuit across Tanzania and Kenya.',
    image: 'https://picsum.photos/seed/serengeti-guide/800/600', readTime: 14, date: '2026-04-20',
  },
]

const POPULAR_SEARCHES = ['Victoria Falls', 'Pyramids of Giza', 'Serengeti', 'Zanzibar', 'Gorilla Trek']
const GALLERY_SEEDS = ['gallery-africa-1', 'gallery-africa-2', 'gallery-africa-3', 'gallery-africa-4', 'gallery-africa-5', 'gallery-africa-6']

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
          HERO — image background with dark overlay
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <Image
          src="https://picsum.photos/seed/myafrowaka-hero-landscape/1920/1080"
          alt="African landscape"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F0D]/92 via-[#0E2410]/82 to-[#122B15]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F0D]/40 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left: headline + search */}
            <div className="lg:col-span-3">
              <h1 className="font-display font-extrabold text-5xl sm:text-6xl xl:text-[72px] text-cream leading-[0.9] mb-6 tracking-tight">
                Discover Africa<br />
                <span className="text-gold-400">Beyond the</span><br />
                <span className="text-moss-300">Stereotype.</span>
              </h1>

              <p className="font-sans text-lg text-cream/70 max-w-md leading-relaxed mb-10">
                Every country has a story the headlines never covered. We find the hidden valleys, the ancient cities, and the coastlines without crowds. Guides written from inside the continent, for travellers who want the real thing.
              </p>

              {/* Search */}
              <form action="/search" method="GET" className="relative max-w-xl mb-5">
                <div className="flex bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_8px_50px_rgba(0,0,0,0.45)]">
                  <div className="flex items-center pl-5 pr-3 text-charcoal/35">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input name="q" type="search" placeholder="Search destinations, experiences, countries..."
                    className="flex-1 py-4 pr-4 text-sm font-sans text-charcoal placeholder-charcoal/35 bg-transparent focus:outline-none"/>
                  <button type="submit"
                    className="m-1.5 bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[11px] uppercase tracking-[0.10em] px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
                    Search
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream/30 self-center mr-1">Popular:</span>
                {POPULAR_SEARCHES.map(q => (
                  <Link key={q} href={`/search?q=${encodeURIComponent(q)}`}
                    className="font-sans text-xs text-cream/55 border border-white/15 hover:border-white/35 hover:text-cream/85 rounded-full px-3 py-1 transition-colors">
                    {q}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Plan a Trip card */}
            <div className="lg:col-span-2">
              <div className="bg-white/96 backdrop-blur-sm rounded-3xl p-7 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-charcoal/35 mb-5">Plan Your Trip</p>

                <div className="mb-4">
                  <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/35 block mb-1.5">Where to?</label>
                  <input type="text" name="destination" placeholder="Egypt, Kenya, Morocco..."
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-ochre-400 transition-colors bg-cream/40"/>
                </div>
                <div className="mb-4">
                  <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/35 block mb-1.5">Type of trip</label>
                  <input type="text" name="type" placeholder="Safari, beach, cultural..."
                    className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-ochre-400 transition-colors bg-cream/40"/>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/35 block mb-1.5">Month</label>
                    <select className="w-full border border-line rounded-xl px-3 py-3 text-sm font-sans text-charcoal bg-cream/40 focus:outline-none focus:border-ochre-400 appearance-none">
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/35 block mb-1.5">Duration</label>
                    <select className="w-full border border-line rounded-xl px-3 py-3 text-sm font-sans text-charcoal bg-cream/40 focus:outline-none focus:border-ochre-400 appearance-none">
                      {['3-5 days','1 week','2 weeks','3+ weeks'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <Link href="/search"
                  className="block text-center w-full bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[11px] uppercase tracking-[0.12em] py-3.5 rounded-xl transition-colors">
                  Find My Destination
                </Link>

                <div className="mt-5 pt-4 border-t border-line flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(n => (
                      <div key={n} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-sand">
                        <Image src={`https://picsum.photos/seed/hero-avatar-${n}/60/60`} alt="" width={28} height={28} className="object-cover"/>
                      </div>
                    ))}
                  </div>
                  <p className="font-sans text-[11px] text-charcoal/50">
                    <strong className="text-charcoal/70">12,400+</strong> travellers exploring Africa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* No bottom fade — sharp section transition */}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TOP DESTINATIONS — photo cards
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream dark-flip-bg" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal dark-flip-text">Where Will You Go Next?</h2>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted hover:text-ochre-600 transition-colors">
              All 47 countries
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((d: DestItem) => (
              <Link key={d.name} href={`/search?q=${encodeURIComponent(d.name)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1.5">
                <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
                <Image src={d.image} alt={d.name} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,17vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700 mix-blend-multiply opacity-65"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/15 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-cream/55 mb-1">{d.flag} {d.region.split(' ')[0]}</p>
                  <h3 className="font-display font-bold text-base sm:text-lg text-cream group-hover:text-gold-300 transition-colors leading-tight">{d.name}</h3>
                  <p className="font-mono text-[9px] text-cream/45 mt-1">{d.count} guides</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          EDITORIAL SPOTLIGHT — auto-advancing slider
      ══════════════════════════════════════════════════════════════ */}
      <EditorialSlider />

      {/* ══════════════════════════════════════════════════════════════
          LATEST TRAVEL GUIDES — masonry layout
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark-flip-surf" id="guides" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal dark-flip-text">Latest Travel Guides</h2>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted hover:text-ochre-600 transition-colors">
              All guides
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          {/* Masonry grid: tall left card, 2 right cards, wide bottom card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1: Tall (spans 2 rows on desktop) — photo-first, content overlay */}
            <Link href={`/attractions/${displayGuides[0].slug}`}
              className="group relative rounded-3xl overflow-hidden lg:row-span-2 min-h-[380px] lg:min-h-[560px] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-400 flex flex-col">
              <Image
                src={displayGuides[0].image}
                alt={displayGuides[0].name}
                fill
                sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent"/>
              <div className="relative mt-auto p-7">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold-400">{displayGuides[0].country}</span>
                  <span className="text-white/20">·</span>
                  <span className="font-mono text-[9px] text-white/35">{fmt(displayGuides[0].date)}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-cream group-hover:text-gold-300 transition-colors leading-snug mb-3">
                  {displayGuides[0].name}
                </h3>
                <p className="font-sans text-sm text-cream/60 leading-relaxed line-clamp-2 mb-4">
                  {displayGuides[0].editorialSummary}
                </p>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-400 group-hover:translate-x-1 transition-transform">
                  Read guide
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </span>
              </div>
            </Link>

            {/* Card 2: Normal top-right */}
            <Link href={`/attractions/${displayGuides[1].slug}`}
              className="group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-44 shrink-0 overflow-hidden">
                <Image src={displayGuides[1].image} alt={displayGuides[1].name} fill sizes="(max-width:640px) 100vw,50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/65 px-2.5 py-1 rounded-full">
                    {displayGuides[1].continentRegion}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ochre-500">{displayGuides[1].country}</span>
                  <span className="text-charcoal/20 dark-flip-muted">·</span>
                  <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted">{fmt(displayGuides[1].date)}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-charcoal dark-flip-text group-hover:text-ochre-600 transition-colors leading-snug mb-2 flex-1">
                  {displayGuides[1].name}
                </h3>
                <p className="font-sans text-sm text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
                  {displayGuides[1].editorialSummary}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-line dark-flip-border">
                  <span className="font-mono text-[10px] text-charcoal/35 dark-flip-muted">{displayGuides[1].readTime} min read</span>
                  <span className="font-mono text-[10px] text-ochre-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 3: Normal middle-right */}
            <Link href={`/attractions/${displayGuides[2].slug}`}
              className="group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-44 shrink-0 overflow-hidden">
                <Image src={displayGuides[2].image} alt={displayGuides[2].name} fill sizes="(max-width:640px) 100vw,50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/65 px-2.5 py-1 rounded-full">
                    {displayGuides[2].continentRegion}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ochre-500">{displayGuides[2].country}</span>
                  <span className="text-charcoal/20 dark-flip-muted">·</span>
                  <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted">{fmt(displayGuides[2].date)}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-charcoal dark-flip-text group-hover:text-ochre-600 transition-colors leading-snug mb-2 flex-1">
                  {displayGuides[2].name}
                </h3>
                <p className="font-sans text-sm text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
                  {displayGuides[2].editorialSummary}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-line dark-flip-border">
                  <span className="font-mono text-[10px] text-charcoal/35 dark-flip-muted">{displayGuides[2].readTime} min read</span>
                  <span className="font-mono text-[10px] text-ochre-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Read
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 4: Wide horizontal (spans 2 columns on desktop) */}
            <Link href={`/attractions/${displayGuides[3].slug}`}
              className="group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 lg:col-span-2 flex flex-col sm:flex-row">
              <div className="relative h-52 sm:h-auto sm:w-64 lg:w-80 shrink-0 overflow-hidden">
                <Image src={displayGuides[3].image} alt={displayGuides[3].name} fill sizes="(max-width:640px) 100vw,320px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/65 px-2.5 py-1 rounded-full">
                    {displayGuides[3].continentRegion}
                  </span>
                </div>
              </div>
              <div className="p-6 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ochre-500">{displayGuides[3].country}</span>
                  <span className="text-charcoal/20 dark-flip-muted">·</span>
                  <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted">{fmt(displayGuides[3].date)}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal dark-flip-text group-hover:text-ochre-600 transition-colors leading-snug mb-3">
                  {displayGuides[3].name}
                </h3>
                <p className="font-sans text-sm text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-3 mb-4">
                  {displayGuides[3].editorialSummary}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-line dark-flip-border">
                  <span className="font-mono text-[10px] text-charcoal/35 dark-flip-muted">{displayGuides[3].readTime} min read</span>
                  <span className="font-mono text-[10px] text-ochre-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Read the guide
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          EXPLORE BY EXPERIENCE — photo grid
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream dark-flip-bg" id="experiences" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal dark-flip-text">Explore by Experience</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {EXPERIENCES.map(e => (
              <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.slug)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1.5">
                <Image src={e.image} alt={e.label} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,17vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display font-bold text-sm text-cream group-hover:text-gold-300 transition-colors leading-tight">{e.label}</h3>
                  <p className="font-sans text-[11px] text-cream/50 mt-1 leading-tight hidden sm:block">{e.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          INTERACTIVE MAP + NEWSLETTER — two-column
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark-flip-surf" id="map-section" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Map */}
            <div className="lg:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Interactive Map</p>
              <h2 className="font-display font-bold text-3xl text-charcoal dark-flip-text mb-2">Explore Africa by Region</h2>
              <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-8">Click any region to discover destinations, guides, and experiences.</p>
              <AfricaMap />
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-2">
              <div className="bg-ink rounded-3xl p-8 sticky top-24">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold-400">Newsletter</span>
                <h3 className="font-display font-bold text-2xl text-cream mt-2 mb-3 leading-snug">
                  Africa in Your Inbox, Every Week
                </h3>
                <p className="font-sans text-sm text-cream/55 leading-relaxed mb-6">
                  New destination guides, hidden gems, visa updates, and travel inspiration. One email per week, no spam.
                </p>
                <form className="space-y-3">
                  <input type="text" placeholder="Your first name"
                    className="w-full bg-white/8 border border-white/12 text-cream placeholder-cream/30 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors"/>
                  <input type="email" placeholder="your@email.com"
                    className="w-full bg-white/8 border border-white/12 text-cream placeholder-cream/30 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors"/>
                  <button type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-600 text-ink font-display font-bold text-[11px] uppercase tracking-[0.12em] py-3.5 rounded-xl transition-colors">
                    Subscribe Free
                  </button>
                </form>
                <p className="font-mono text-[9px] text-cream/20 text-center mt-4">No spam. Unsubscribe any time.</p>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-cream/30 mb-3 text-center">Follow Our Journey</p>
                  <div className="flex items-center justify-center gap-3">
                    {[
                      { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', href: 'https://instagram.com/myafrowaka_' },
                      { label: 'X',         path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z', href: '#' },
                      { label: 'TikTok',    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z', href: 'https://tiktok.com/@myafrowaka_' },
                    ].map(s => (
                      <a key={s.label} href={s.href} aria-label={s.label}
                        className="w-9 h-9 bg-white/8 hover:bg-white/15 rounded-full flex items-center justify-center text-cream/50 hover:text-cream transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path}/></svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED ATTRACTIONS — photo cards (Sanity-powered)
      ══════════════════════════════════════════════════════════════ */}
      {(featured as AttrItem[]).length > 0 && (
        <section className="py-20 bg-cream dark-flip-bg" data-reveal>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal dark-flip-text">Featured Attractions</h2>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 hover:text-ochre-600 transition-colors">
                Browse all &rarr;
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(featured as AttrItem[]).slice(0, 8).map((a) => (
                <Link key={a.slug} href={`/attractions/${a.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1.5">
                  <Image
                    src={`https://picsum.photos/seed/${a.slug}/600/750`}
                    alt={a.name}
                    fill
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-gold-400 mb-1">{a.continentRegion}</p>
                    <h3 className="font-display font-bold text-base text-cream group-hover:text-gold-300 transition-colors leading-tight mb-1">{a.name}</h3>
                    {a.editorialSummary && (
                      <p className="font-sans text-[11px] text-cream/55 leading-snug line-clamp-2">{a.editorialSummary}</p>
                    )}
                    {a.country?.name && (
                      <p className="font-mono text-[9px] text-cream/35 mt-2">{a.country.name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PHOTO GALLERY — "Follow Our Journey"
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream dark-flip-bg" data-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">@myafrowaka_</p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-charcoal dark-flip-text">Follow Our Journey</h2>
            </div>
            <a href="https://instagram.com/myafrowaka_" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted hover:text-ochre-600 transition-colors">
              Instagram
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {GALLERY_SEEDS.map(seed => (
              <a key={seed} href="https://instagram.com/myafrowaka_" target="_blank" rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-sand dark-flip-surf">
                <Image src={`https://picsum.photos/seed/${seed}/600/600`} alt="MyAfroWaka on Instagram" fill sizes="(max-width:640px) 33vw,17vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-6 h-6 text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" data-reveal>
        <Image src="https://picsum.photos/seed/cta-africa-wide/1920/600" alt="" fill className="object-cover"/>
        <div className="absolute inset-0 bg-ink/85"/>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-400 mb-4">Ready to explore?</p>
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-cream mb-5 leading-tight">
            Your African Adventure Starts Here.
          </h2>
          <p className="font-sans text-cream/60 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            557 verified guides across 47 countries. No stereotypes, no guesswork. Just Africa, told honestly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search"
              className="inline-flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-8 py-4 rounded-full transition-colors">
              Explore Destinations
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <Link href="/about"
              className="inline-flex items-center justify-center border border-white/25 hover:border-white/50 text-cream/75 hover:text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-8 py-4 rounded-full transition-colors">
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
