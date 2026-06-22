import Image from 'next/image'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { AfricaMap } from '@/components/AfricaMap'
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
  { label: 'Safari',    slug: 'safari',   desc: 'The Big Five and beyond',           image: 'https://picsum.photos/seed/safari-exp/600/700'   },
  { label: 'Culture',   slug: 'culture',  desc: 'Living traditions across the continent', image: 'https://picsum.photos/seed/culture-exp/600/700'  },
  { label: 'Beach',     slug: 'beach',    desc: 'Indian Ocean and Atlantic shores',   image: 'https://picsum.photos/seed/beach-exp/600/700'    },
  { label: 'History',   slug: 'history',  desc: 'Ancient kingdoms and World Heritage', image: 'https://picsum.photos/seed/history-exp/600/700'  },
  { label: 'Hiking',    slug: 'hiking',   desc: 'Trails from Simien to Table Mountain', image: 'https://picsum.photos/seed/hiking-exp/600/700'   },
  { label: 'Food',      slug: 'food',     desc: 'Tagines, jollof, nyama choma',       image: 'https://picsum.photos/seed/food-exp/600/700'     },
]

const FALLBACK_GUIDES: GuideItem[] = [
  {
    name: 'Pyramids of Giza: The Complete Travel Guide',
    slug: 'pyramids-of-giza', continentRegion: 'North Africa', country: 'Egypt',
    editorialSummary: 'The last surviving Wonder of the Ancient World, standing on the Giza Plateau outside Cairo. Everything you need to know before you visit.',
    image: 'https://picsum.photos/seed/giza-guide-card/800/500', readTime: 12, date: '2026-06-01',
  },
  {
    name: 'Bwindi Impenetrable Forest: Mountain Gorilla Encounter',
    slug: 'bwindi-impenetrable-national-park', continentRegion: 'East Africa', country: 'Uganda',
    editorialSummary: 'Home to half the world mountain gorilla population, Bwindi covers 321 square kilometres of southwestern Uganda.',
    image: 'https://picsum.photos/seed/bwindi-guide-card/800/500', readTime: 10, date: '2026-05-15',
  },
  {
    name: 'Table Mountain: Everything You Need to Know',
    slug: 'table-mountain', continentRegion: 'Southern Africa', country: 'South Africa',
    editorialSummary: 'Cape Town iconic flat-topped summit rises 1,085 metres above sea level and harbours more plant species than the entire United Kingdom.',
    image: 'https://picsum.photos/seed/table-mtn-guide/800/500', readTime: 9, date: '2026-05-01',
  },
  {
    name: 'Serengeti National Park: The Migration Guide',
    slug: 'serengeti-national-park', continentRegion: 'East Africa', country: 'Tanzania',
    editorialSummary: 'The Great Migration moves 1.5 million wildebeest and 250,000 zebras in a continuous annual circuit across Tanzania and Kenya.',
    image: 'https://picsum.photos/seed/serengeti-guide/800/500', readTime: 14, date: '2026-04-20',
  },
]

const TESTIMONIALS = [
  {
    quote: "I visited 8 African countries in one year, and MyAfroWaka was the only guide I used. Every detail was accurate and nothing felt like it had been copied from Wikipedia.",
    name: 'Sarah M.', origin: 'London, UK', avatar: 'https://picsum.photos/seed/avatar-sarah/80/80',
  },
  {
    quote: "Finally a platform that treats Africa as 54 distinct countries, not one continent with one story. The Bwindi gorilla trek guide alone was worth bookmarking.",
    name: 'David O.', origin: 'Lagos, Nigeria', avatar: 'https://picsum.photos/seed/avatar-david/80/80',
  },
  {
    quote: "We planned our entire East Africa itinerary through MyAfroWaka. Three weeks, four countries, zero surprises. Everything matched what the guides said.",
    name: 'Amina K.', origin: 'Montreal, Canada', avatar: 'https://picsum.photos/seed/avatar-amina/80/80',
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
        {/* Background photo */}
        <Image
          src="https://picsum.photos/seed/myafrowaka-hero-landscape/1920/1080"
          alt="African landscape"
          fill
          priority
          className="object-cover"
        />
        {/* Dark overlay — left heavier so text is readable, right lighter to show image */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1F0D]/92 via-[#0E2410]/82 to-[#122B15]/65" />
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F0D]/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-24">
          <div className="grid lg:grid-cols-5 gap-12 items-center">

            {/* Left: headline + search */}
            <div className="lg:col-span-3">
              <h1 className="font-display text-5xl sm:text-6xl xl:text-[72px] text-cream leading-[0.9] mb-6 tracking-tight">
                Discover Africa<br />
                <span className="text-gold-400">Beyond the</span><br />
                <span className="text-moss-300">Stereotype.</span>
              </h1>

              <p className="font-sans text-lg text-cream/65 max-w-md leading-relaxed mb-10">
                557 verified guides across 47 countries. Written by Africans, for the world.
                No fabrications. No cliches.
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
                    className="m-1.5 bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.12em] px-5 py-3 rounded-xl transition-colors whitespace-nowrap">
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
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-charcoal/35 mb-5">
                  Plan Your Trip
                </p>

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
                  className="block text-center w-full bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.14em] py-3.5 rounded-xl transition-colors">
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

        {/* Page transition fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cream dark-flip-bg to-transparent pointer-events-none"/>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TOP DESTINATIONS — photo cards
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Top Destinations</p>
              <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">Where Will You Go Next?</h2>
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
                {/* Colour fallback */}
                <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
                {/* Photo */}
                <Image src={d.image} alt={d.name} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,17vw"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 mix-blend-multiply opacity-65"/>
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/15 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-cream/55 mb-1">{d.flag} {d.region.split(' ')[0]}</p>
                  <h3 className="font-display text-base sm:text-lg text-cream group-hover:text-gold-300 transition-colors leading-tight">{d.name}</h3>
                  <p className="font-mono text-[9px] text-cream/45 mt-1">{d.count} guides</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURED SPOTLIGHT — editorial hero banner
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-ink overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Text */}
            <div className="py-16 lg:py-20 pr-0 lg:pr-12 flex flex-col justify-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-400 mb-4">Editor Pick</p>
              <h2 className="font-display text-4xl sm:text-5xl text-cream leading-tight mb-5">
                The Pyramids of Giza Still Defy Explanation.
              </h2>
              <p className="font-sans text-cream/60 leading-relaxed mb-8 max-w-md">
                Built over 4,500 years ago, the Great Pyramid of Giza was the tallest man-made structure on Earth for 3,800 years.
                Our complete guide covers permits, best viewing times, and what tour operators won&apos;t tell you.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/attractions/pyramids-of-giza"
                  className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-colors">
                  Read the full guide
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
                <Link href="/search?q=Egypt"
                  className="inline-flex items-center border border-white/20 hover:border-white/40 text-cream/70 hover:text-cream font-mono text-[11px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-colors">
                  Explore Egypt
                </Link>
              </div>
            </div>
            {/* Image */}
            <div className="relative min-h-[320px] lg:min-h-0">
              <Image src="https://picsum.photos/seed/pyramids-editorial-spotlight/800/600"
                alt="Pyramids of Giza editorial spotlight" fill className="object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent lg:block hidden"/>
              <div className="absolute inset-0 bg-ink/40 lg:hidden"/>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LATEST TRAVEL GUIDES — magazine 2×2 grid (no white spaces)
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark-flip-surf" id="guides">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Editorial</p>
              <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">Latest Travel Guides</h2>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark-flip-muted hover:text-ochre-600 transition-colors">
              All guides
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          {/* Uniform 2×2 grid — always complete, no white space */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayGuides.map((g: GuideItem) => (
              <Link key={g.slug} href={`/attractions/${g.slug}`}
                className="group bg-white dark-flip-card rounded-2xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                {/* Photo */}
                <div className="relative h-52 overflow-hidden shrink-0">
                  <Image src={g.image} alt={g.name} fill sizes="(max-width:640px) 100vw,50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/65 px-2.5 py-1 rounded-full">
                      {g.continentRegion}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ochre-500">{g.country}</span>
                    <span className="text-charcoal/20 dark-flip-muted">·</span>
                    <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted">{fmt(g.date)}</span>
                  </div>
                  <h3 className="font-display text-xl text-charcoal dark-flip-text group-hover:text-ochre-600 transition-colors leading-snug mb-3 flex-1">
                    {g.name}
                  </h3>
                  <p className="font-sans text-sm text-charcoal/55 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
                    {g.editorialSummary}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-line dark-flip-border">
                    <span className="font-mono text-[10px] text-charcoal/35 dark-flip-muted">{g.readTime} min read</span>
                    <span className="font-mono text-[10px] text-ochre-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      Read guide
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          EXPLORE BY EXPERIENCE — photo grid
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream dark-flip-bg" id="experiences">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">What Moves You</p>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">Explore by Experience</h2>
            <p className="mt-3 font-sans text-charcoal/55 dark-flip-muted max-w-lg mx-auto">
              Africa is not one thing. Choose the experience that speaks to you.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {EXPERIENCES.map(e => (
              <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.slug)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1.5">
                <Image src={e.image} alt={e.label} fill sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,17vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-sm text-cream group-hover:text-gold-300 transition-colors leading-tight">{e.label}</h3>
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
      <section className="py-20 bg-sand dark-flip-surf" id="map-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Map */}
            <div className="lg:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Interactive Map</p>
              <h2 className="font-display text-3xl text-charcoal dark-flip-text mb-2">Explore Africa by Region</h2>
              <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-8">Click any region to discover destinations, guides, and experiences.</p>
              <AfricaMap />
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-2">
              <div className="bg-ink rounded-3xl p-8 sticky top-24">
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold-400">Newsletter</span>
                <h3 className="font-display text-2xl text-cream mt-2 mb-3 leading-snug">
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
                    className="w-full bg-gold-500 hover:bg-gold-600 text-ink font-mono font-bold text-[11px] uppercase tracking-[0.14em] py-3.5 rounded-xl transition-colors">
                    Subscribe Free
                  </button>
                </form>
                <p className="font-mono text-[9px] text-cream/20 text-center mt-4">No spam. Unsubscribe any time.</p>

                {/* Social */}
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
          FEATURED ATTRACTIONS (Sanity-powered, shows if data exists)
      ══════════════════════════════════════════════════════════════ */}
      {(featured as AttrItem[]).length > 0 && (
        <section className="py-20 bg-cream dark-flip-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Curated Picks</p>
                <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">Featured Attractions</h2>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 hover:text-ochre-600 transition-colors">
                Browse all &rarr;
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(featured as AttrItem[]).slice(0, 8).map((a, i) => (
                <Link key={a.slug} href={`/attractions/${a.slug}`}
                  className="group bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-5 hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: FALLBACK_DESTINATIONS[i % 6].color + '18' }}>🌍</div>
                    <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ochre-500">{a.continentRegion}</p>
                      <h3 className="font-display text-[15px] text-charcoal dark-flip-text group-hover:text-ochre-600 transition-colors leading-tight mt-0.5 line-clamp-2">{a.name}</h3>
                    </div>
                  </div>
                  {a.editorialSummary && (
                    <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted leading-relaxed line-clamp-2 flex-1">{a.editorialSummary}</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-line dark-flip-border">
                    {a.country?.name && <span className="font-mono text-[9px] text-charcoal/30 dark-flip-muted">{a.country.name}</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TRAVELLER TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-ink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-400 mb-2">Real Travellers</p>
            <h2 className="font-display text-3xl sm:text-4xl text-cream">What People Are Saying</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-6 flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-gold-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="font-sans text-cream/70 text-sm leading-relaxed flex-1 mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/10 shrink-0">
                    <Image src={t.avatar} alt={t.name} width={40} height={40} className="object-cover"/>
                  </div>
                  <div>
                    <p className="font-sans text-sm font-medium text-cream">{t.name}</p>
                    <p className="font-mono text-[9px] text-cream/35">{t.origin}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          PHOTO GALLERY — "Follow Our Journey"
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">@myafrowaka_</p>
              <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">Follow Our Journey</h2>
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
          STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-charcoal py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/8">
            {[
              { n: '54',   label: 'African Countries',      note: 'continent-wide coverage' },
              { n: '557',  label: 'Guides and Attractions', note: 'fact-checked records'    },
              { n: '47+',  label: 'Countries Covered',      note: 'active guide library'    },
              { n: '100%', label: 'Africa-Written',         note: 'by local experts'        },
            ].map(s => (
              <div key={s.n} className="px-6 sm:px-10 py-4 text-center first:pl-0 last:pr-0">
                <p className="font-display text-4xl text-cream">{s.n}</p>
                <p className="font-sans text-sm text-cream/60 mt-1">{s.label}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-cream/25 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TRUST PILLARS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark-flip-surf">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Our Promise</p>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">Why Travellers Trust MyAfroWaka</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: '✓', title: 'Zero Fabrications', body: 'Every distance, price, opening hour, and historical date in our guides comes from a verified source. If we cannot confirm it, we write [VERIFY].' },
              { icon: '🌍', title: 'Written by Africans', body: 'Our editorial team lives on the continent. We write about places we have visited, communities we know, and stories we have heard firsthand.' },
              { icon: '🔄', title: 'Continuously Updated', body: 'Travel conditions change. We flag every guide with its last-verified date and actively refresh content when borders, prices, or access routes change.' },
            ].map(p => (
              <div key={p.title} className="bg-white dark-flip-card rounded-2xl p-7 border border-line dark-flip-border hover:shadow-[var(--shadow-soft)] transition-shadow">
                <div className="w-11 h-11 bg-ochre-50 rounded-xl flex items-center justify-center text-xl mb-5">{p.icon}</div>
                <h3 className="font-display text-lg text-charcoal dark-flip-text mb-2">{p.title}</h3>
                <p className="font-sans text-sm text-charcoal/60 dark-flip-muted leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <Image src="https://picsum.photos/seed/cta-africa-wide/1920/600" alt="" fill className="object-cover"/>
        <div className="absolute inset-0 bg-ink/85"/>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-400 mb-4">Ready to explore?</p>
          <h2 className="font-display text-4xl sm:text-5xl text-cream mb-5 leading-tight">
            Your African adventure starts here.
          </h2>
          <p className="font-sans text-cream/60 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            557 verified guides across 47 countries. No stereotypes, no guesswork. Just Africa, told honestly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search"
              className="inline-flex items-center justify-center gap-2 bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.14em] px-8 py-4 rounded-full transition-colors">
              Explore Destinations
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <Link href="/about"
              className="inline-flex items-center justify-center border border-white/25 hover:border-white/50 text-cream/75 hover:text-cream font-mono text-[11px] uppercase tracking-[0.14em] px-8 py-4 rounded-full transition-colors">
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
