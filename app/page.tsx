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
  | order(_updatedAt desc)[0..5]{
    name, "slug": slug.current, editorialSummary, continentRegion, type, _updatedAt,
    "country": country->{ name, "slug": slug.current }
  }
`

// ─── static data ─────────────────────────────────────────────────────────

const FALLBACK_DESTINATIONS = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',         flag: '🇪🇬', count: 14, color: '#A22E29', image: 'https://picsum.photos/seed/egypt-nile/800/600'         },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',          flag: '🇰🇪', count: 18, color: '#3F6A3D', image: 'https://picsum.photos/seed/kenya-safari/800/600'       },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa',      flag: '🇿🇦', count: 12, color: '#29251A', image: 'https://picsum.photos/seed/southafrica-cape/800/600'  },
  { name: 'Zanzibar',    slug: 'zanzibar',     region: 'East Africa',          flag: '🇹🇿', count: 8,  color: '#B28E38', image: 'https://picsum.photos/seed/zanzibar-beach/800/600'    },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',         flag: '🇲🇦', count: 22, color: '#B55D39', image: 'https://picsum.photos/seed/morocco-medina/800/600'    },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',          flag: '🇬🇭', count: 11, color: '#3B403E', image: 'https://picsum.photos/seed/ghana-coast/800/600'       },
]

const EXPERIENCES = [
  { label: 'Safari Adventures',    slug: 'safari',   desc: 'Track the Big Five across East and Southern Africa', image: 'https://picsum.photos/seed/safari-wildlife/600/600'    },
  { label: 'Cultural Experiences', slug: 'culture',  desc: 'Meet communities living rich, uninterrupted traditions', image: 'https://picsum.photos/seed/culture-africa/600/600'   },
  { label: 'Beach Getaways',       slug: 'beach',    desc: 'Indian Ocean shores, from Diani to Ile Sainte-Marie', image: 'https://picsum.photos/seed/indian-ocean-beach/600/600' },
  { label: 'Historical Sites',     slug: 'history',  desc: "Egypt, Great Zimbabwe, and West Africa's ancient kingdoms", image: 'https://picsum.photos/seed/ancient-ruins/600/600' },
  { label: 'Hiking and Nature',    slug: 'hiking',   desc: 'Simien Mountains, Rwenzori, and Table Mountain trails', image: 'https://picsum.photos/seed/mountain-hike/600/600'     },
  { label: 'Food and Drink',       slug: 'food',     desc: 'Tagines in Marrakech, jollof rice debates, braai culture', image: 'https://picsum.photos/seed/food-market/600/600'  },
]

const FALLBACK_GUIDES = [
  {
    name: 'Pyramids of Giza: The Complete Travel Guide',
    slug: 'pyramids-of-giza',
    continentRegion: 'North Africa',
    editorialSummary: 'The last surviving Wonder of the Ancient World, standing on the Giza Plateau outside Cairo, Egypt. Everything you need to know before you visit.',
    image: 'https://picsum.photos/seed/pyramid-giza/800/450',
    readTime: 12,
    country: 'Egypt',
    date: '2026-06-01',
  },
  {
    name: 'Bwindi Impenetrable Forest: A Mountain Gorilla Encounter',
    slug: 'bwindi-impenetrable-national-park',
    continentRegion: 'East Africa',
    editorialSummary: 'Home to half the world mountain gorilla population, Bwindi covers 321 square kilometres of southwestern Uganda. Here is how to plan your permit and trek.',
    image: 'https://picsum.photos/seed/gorilla-forest/800/450',
    readTime: 10,
    country: 'Uganda',
    date: '2026-05-15',
  },
  {
    name: 'Table Mountain: Everything You Need to Know',
    slug: 'table-mountain',
    continentRegion: 'Southern Africa',
    editorialSummary: 'Cape Town iconic flat-topped summit rises 1,085 metres above sea level and harbours more plant species than the entire United Kingdom.',
    image: 'https://picsum.photos/seed/table-mountain-cape/800/450',
    readTime: 9,
    country: 'South Africa',
    date: '2026-05-01',
  },
  {
    name: 'Serengeti National Park: The Migration Guide',
    slug: 'serengeti-national-park',
    continentRegion: 'East Africa',
    editorialSummary: 'The Great Migration moves 1.5 million wildebeest and 250,000 zebras in a continuous annual circuit across Tanzania and Kenya. Plan your timing here.',
    image: 'https://picsum.photos/seed/serengeti-plains/800/450',
    readTime: 14,
    country: 'Tanzania',
    date: '2026-04-20',
  },
]

const POPULAR_SEARCHES = ['Victoria Falls', 'Pyramids of Giza', 'Serengeti', 'Zanzibar', 'Gorilla Trek']

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type GuideItem = {
  name: string; slug: string; continentRegion: string;
  editorialSummary: string; image: string; readTime: number; country: string; date: string
}
type DestItem  = { name: string; slug: string; region: string; flag: string; count: number; color: string; image: string }
type AttrItem  = { slug: string; name: string; editorialSummary?: string; continentRegion?: string; country?: { name: string } }

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
          color: FALLBACK_DESTINATIONS[i % FALLBACK_DESTINATIONS.length].color,
          image: FALLBACK_DESTINATIONS[i % FALLBACK_DESTINATIONS.length].image,
        })
      )
    : FALLBACK_DESTINATIONS

  const displayGuides: GuideItem[] = guides.length > 0
    ? guides.slice(0, 4).map(
        (g: { name: string; slug: string; continentRegion: string; editorialSummary: string; _updatedAt: string; country?: { name: string } }, i: number): GuideItem => ({
          name: g.name, slug: g.slug, continentRegion: g.continentRegion, editorialSummary: g.editorialSummary,
          image: FALLBACK_GUIDES[i % FALLBACK_GUIDES.length].image,
          readTime: FALLBACK_GUIDES[i % FALLBACK_GUIDES.length].readTime,
          country: g.country?.name ?? 'Africa',
          date: g._updatedAt ?? FALLBACK_GUIDES[i].date,
        })
      )
    : FALLBACK_GUIDES

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO — cinematic split layout with gradient backdrop
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[88vh] flex items-center overflow-hidden"
        style={{ background: 'linear-gradient(130deg, #0E2410 0%, #1A1813 40%, #1C3D20 75%, #2A3E24 100%)' }}
      >
        {/* Decorative Africa continent silhouette */}
        <div className="absolute right-0 top-0 h-full flex items-center pointer-events-none select-none opacity-[0.04]">
          <svg viewBox="0 0 440 510" className="h-full max-h-[900px] w-auto" fill="white">
            <path d="M 130,20 C 162,10 202,6 255,13 C 300,20 330,36 358,68 C 380,96 396,128 402,162 C 406,188 402,212 386,234 C 372,254 358,272 348,296 C 336,322 326,350 308,382 C 290,414 264,444 228,464 C 205,476 180,468 155,452 C 130,436 116,414 105,388 C 92,362 86,334 86,308 C 86,282 76,264 64,246 C 52,228 50,212 56,196 C 62,180 74,166 90,152 C 106,138 114,118 120,90 C 126,66 128,44 130,20 Z"/>
            <path d="M 378,318 C 393,330 401,358 396,388 C 391,418 378,434 365,428 C 353,422 348,408 352,382 C 356,354 364,308 378,318 Z"/>
          </svg>
        </div>

        {/* Gold grain texture */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="grid lg:grid-cols-5 gap-10 items-center">

            {/* Left: headline + search */}
            <div className="lg:col-span-3">
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream/70">
                  Africa Explained by Africans
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl text-cream leading-[0.92] mb-6">
                Discover Africa<br />
                <span className="text-gold-400">Beyond the</span><br />
                <span className="text-moss-300">Stereotype.</span>
              </h1>

              <p className="font-sans text-lg text-cream/65 max-w-md leading-relaxed mb-10">
                557 verified guides across 47 countries. No fabrications.
                Written by Africans, reviewed by locals, for the world.
              </p>

              {/* Search bar */}
              <form action="/search" method="GET" className="relative max-w-xl">
                <div className="flex bg-white/95 backdrop-blur rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.4)] border border-white/20">
                  <div className="flex items-center pl-5 pr-3 text-charcoal/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input
                    name="q"
                    type="search"
                    placeholder="Search destinations, experiences..."
                    className="flex-1 py-4 pr-4 text-sm font-sans text-charcoal placeholder-charcoal/40 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="m-1.5 bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.12em] px-5 py-3 rounded-xl transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cream/35 self-center">Popular:</span>
                {POPULAR_SEARCHES.map(q => (
                  <Link key={q} href={`/search?q=${encodeURIComponent(q)}`}
                    className="font-sans text-xs text-cream/55 border border-white/12 hover:border-white/30 hover:text-cream/80 rounded-full px-3 py-1 transition-colors">
                    {q}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: Plan Your Trip card */}
            <div className="lg:col-span-2">
              <div className="bg-white/95 backdrop-blur rounded-3xl p-7 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-charcoal/40 mb-5">
                  Plan Your Trip
                </p>

                {[
                  { label: 'Where to?', placeholder: 'Egypt, Kenya, Morocco...', name: 'destination' },
                  { label: 'What kind of trip?', placeholder: 'Safari, beach, culture...', name: 'type' },
                ].map(f => (
                  <div key={f.name} className="mb-4">
                    <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 block mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      name={f.name}
                      placeholder={f.placeholder}
                      className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-ochre-400 transition-colors bg-cream/40"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 block mb-1.5">
                      Month
                    </label>
                    <select name="month" className="w-full border border-line rounded-xl px-3 py-3 text-sm font-sans text-charcoal bg-cream/40 focus:outline-none focus:border-ochre-400 appearance-none">
                      {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/40 block mb-1.5">
                      Duration
                    </label>
                    <select name="duration" className="w-full border border-line rounded-xl px-3 py-3 text-sm font-sans text-charcoal bg-cream/40 focus:outline-none focus:border-ochre-400 appearance-none">
                      {['3-5 days','1 week','2 weeks','3+ weeks'].map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Link
                  href="/search"
                  className="block text-center w-full bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.14em] py-3.5 rounded-xl transition-colors"
                >
                  Build My Itinerary
                </Link>

                <div className="mt-5 pt-4 border-t border-line flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="w-7 h-7 rounded-full bg-sand border-2 border-white overflow-hidden">
                        <Image
                          src={`https://picsum.photos/seed/avatar-${n}/60/60`}
                          alt="Traveller avatar"
                          width={28}
                          height={28}
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="font-sans text-[11px] text-charcoal/50">
                    Join <strong className="text-charcoal/75">12,400+</strong> travellers exploring Africa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream dark-flip-bg to-transparent pointer-events-none" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          UTILITY TOOLS BAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white dark-flip-card border-y border-line dark-flip-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-0 divide-x divide-line dark-flip-border">
            {[
              { label: 'By Region',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, href: '#map-section'  },
              { label: 'By Country',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"/></svg>, href: '/search'       },
              { label: 'Experiences', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>, href: '#experiences'},
              { label: 'Visa Guide',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>, href: '/about'       },
              { label: 'Best Time',  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>, href: '/search'      },
              { label: 'Travel Tips', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>, href: '/about'       },
            ].map(t => (
              <Link key={t.label} href={t.href}
                className="flex flex-col items-center gap-2 py-4 px-3 group hover:bg-cream dark-flip-surf transition-colors">
                <span className="text-ochre-500 group-hover:text-ochre-600 transition-colors">{t.icon}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/45 dark-flip-muted group-hover:text-charcoal/70 transition-colors whitespace-nowrap">{t.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TOP DESTINATIONS — photo cards
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Top Destinations</p>
              <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">
                Where Will You Go Next?
              </h2>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/45 dark-flip-muted hover:text-ochre-600 transition-colors">
              View all 47 countries
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map((d: DestItem) => (
              <Link key={d.name} href={`/search?q=${encodeURIComponent(d.name)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1">

                <div className="absolute inset-0" style={{ backgroundColor: d.color }} />

                <Image
                  src={d.image}
                  alt={`Travel to ${d.name}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-multiply opacity-70"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-cream/60 mb-1">{d.flag} {d.region.split(' ')[0]}</p>
                  <h3 className="font-display text-base text-cream group-hover:text-gold-300 transition-colors leading-tight">{d.name}</h3>
                  <p className="font-mono text-[9px] text-cream/50 mt-1">{d.count} guides</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          LATEST TRAVEL GUIDES — magazine layout
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark-flip-surf" id="guides">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Editorial</p>
              <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">Latest Travel Guides</h2>
            </div>
            <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/45 dark-flip-muted hover:text-ochre-600 transition-colors">
              All guides
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayGuides.map((g: GuideItem, i: number) => (
              <Link key={g.slug} href={`/attractions/${g.slug}`}
                className={`group bg-white dark-flip-card rounded-2xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1 flex flex-col ${i === 0 ? 'sm:col-span-2 sm:row-span-1' : ''}`}>

                {/* Photo */}
                <div className={`relative overflow-hidden ${i === 0 ? 'h-56 sm:h-64' : 'h-44'}`}>
                  <Image
                    src={g.image}
                    alt={g.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/65 px-2.5 py-1 rounded-full">
                      {g.continentRegion}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ochre-500">{g.country}</span>
                    <span className="text-charcoal/20 dark-flip-muted">·</span>
                    <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted">{fmt(g.date)}</span>
                  </div>

                  <h3 className={`font-display text-charcoal dark-flip-text group-hover:text-ochre-600 transition-colors leading-snug mb-2 ${i === 0 ? 'text-xl' : 'text-base'}`}>
                    {g.name}
                  </h3>

                  <p className="font-sans text-sm text-charcoal/55 dark-flip-muted leading-relaxed flex-1 line-clamp-2">
                    {g.editorialSummary}
                  </p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-line dark-flip-border">
                    <span className="font-mono text-[10px] text-charcoal/40 dark-flip-muted">{g.readTime} min read</span>
                    <span className="font-mono text-[10px] text-ochre-500 group-hover:translate-x-1 transition-transform">
                      Read guide &rarr;
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
            {EXPERIENCES.map((e) => (
              <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.slug)}`}
                className="group relative rounded-2xl overflow-hidden aspect-[3/4] hover:shadow-[var(--shadow-lift)] transition-all duration-300 hover:-translate-y-1">

                <Image
                  src={e.image}
                  alt={e.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-sm text-cream group-hover:text-gold-300 transition-colors leading-tight">
                    {e.label}
                  </h3>
                  <p className="font-sans text-[11px] text-cream/55 mt-1 leading-tight line-clamp-2 hidden sm:block">
                    {e.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          INTERACTIVE AFRICA MAP + NEWSLETTER (two-column)
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark-flip-surf" id="map-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12 items-start">

            {/* Map */}
            <div className="lg:col-span-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Interactive Map</p>
              <h2 className="font-display text-3xl text-charcoal dark-flip-text mb-2">Explore Africa by Region</h2>
              <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-8">
                Click any region to discover destinations, guides, and experiences.
              </p>
              <AfricaMap />
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-2">
              <div className="bg-ink rounded-3xl p-8 sticky top-24">
                <div className="mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold-400">Newsletter</span>
                </div>
                <h3 className="font-display text-2xl text-cream mb-3 leading-snug">
                  Africa in Your Inbox Every Week
                </h3>
                <p className="font-sans text-sm text-cream/60 leading-relaxed mb-6">
                  New destination guides, hidden gems, visa updates, and travel inspiration. No spam, one email a week.
                </p>

                <form className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your first name"
                    className="w-full bg-white/8 border border-white/12 text-cream placeholder-cream/30 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full bg-white/8 border border-white/12 text-cream placeholder-cream/30 font-sans text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-gold-400 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-600 text-ink font-mono font-bold text-[11px] uppercase tracking-[0.14em] py-3.5 rounded-xl transition-colors"
                  >
                    Subscribe Free
                  </button>
                </form>

                <p className="font-mono text-[9px] text-cream/25 text-center mt-4">
                  No spam. Unsubscribe anytime.
                </p>

                {/* Social media links */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-cream/35 mb-3 text-center">
                    Follow Our Journey
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {[
                      { label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', href: '#' },
                      { label: 'X / Twitter',  icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z', href: '#' },
                      { label: 'Facebook',     icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', href: '#' },
                    ].map(s => (
                      <a key={s.label} href={s.href} aria-label={s.label}
                        className="w-9 h-9 bg-white/8 hover:bg-white/15 rounded-full flex items-center justify-center text-cream/55 hover:text-cream transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d={s.icon}/>
                        </svg>
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
          FEATURED ATTRACTION — if Sanity has content
      ══════════════════════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-20 bg-cream dark-flip-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Curated Picks</p>
                <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">
                  Featured Attractions
                </h2>
              </div>
              <Link href="/search" className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/45 hover:text-ochre-600 transition-colors">
                Browse all &rarr;
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(featured as AttrItem[]).slice(0, 8).map((a, i: number) => (
                <Link key={a.slug} href={`/attractions/${a.slug}`}
                  className="group bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-5 hover:shadow-[var(--shadow-lift)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: FALLBACK_DESTINATIONS[i % FALLBACK_DESTINATIONS.length].color + '18' }}>
                      🌍
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-ochre-500">{a.continentRegion}</p>
                      <h3 className="font-display text-[15px] text-charcoal dark-flip-text group-hover:text-ochre-600 transition-colors leading-tight mt-0.5 line-clamp-2">{a.name}</h3>
                    </div>
                  </div>
                  {a.editorialSummary && (
                    <p className="font-sans text-[12px] text-charcoal/50 dark-flip-muted leading-relaxed line-clamp-2 flex-1">
                      {a.editorialSummary}
                    </p>
                  )}
                  <div className="mt-3 pt-3 border-t border-line dark-flip-border">
                    {a.country?.name && (
                      <span className="font-mono text-[9px] text-charcoal/35 dark-flip-muted">{a.country.name}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-charcoal py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/8">
            {[
              { n: '54',    label: 'African Countries', note: 'continent-wide coverage' },
              { n: '557',   label: 'Guides and Attractions', note: 'fact-checked records' },
              { n: '47+',   label: 'Countries Covered', note: 'active guide library' },
              { n: '100%',  label: 'Africa-Written', note: 'by local experts' },
            ].map(s => (
              <div key={s.n} className="px-6 sm:px-10 py-4 text-center">
                <p className="font-display text-4xl text-cream">{s.n}</p>
                <p className="font-sans text-sm text-cream/65 mt-1">{s.label}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-cream/25 mt-0.5">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TRUST + WHY MYAFROWAKA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark-flip-surf">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">Our Promise</p>
            <h2 className="font-display text-3xl sm:text-4xl text-charcoal dark-flip-text">
              Why Travellers Trust MyAfroWaka
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: '✓',
                title: 'Zero Fabrications',
                body: 'Every distance, price, opening hour, and historical date in our guides comes from a verified source. If we cannot confirm it, we write [VERIFY].',
              },
              {
                icon: '🌍',
                title: 'Written by Africans',
                body: 'Our editorial team lives on the continent. We write about places we have visited, communities we know, and stories we have heard firsthand.',
              },
              {
                icon: '🔄',
                title: 'Continuously Updated',
                body: 'Travel conditions change. We flag guides with their last-verified date and actively refresh content when borders, prices, or access routes change.',
              },
            ].map(p => (
              <div key={p.title} className="bg-white dark-flip-card rounded-2xl p-7 border border-line dark-flip-border">
                <div className="w-11 h-11 bg-ochre-50 rounded-xl flex items-center justify-center text-xl mb-5">
                  {p.icon}
                </div>
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
      <section className="bg-ink py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-400 mb-4">Ready to explore?</p>
          <h2 className="font-display text-4xl sm:text-5xl text-cream mb-5 leading-tight">
            Your African adventure starts here.
          </h2>
          <p className="font-sans text-cream/60 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            557 verified guides across 47 countries. No stereotypes, no guesswork. Just Africa, told honestly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search"
              className="inline-flex items-center justify-center bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.14em] px-8 py-4 rounded-full transition-colors">
              Explore Destinations
            </Link>
            <Link href="/about"
              className="inline-flex items-center justify-center border border-white/20 hover:border-white/40 text-cream/75 hover:text-cream font-mono text-[11px] uppercase tracking-[0.14em] px-8 py-4 rounded-full transition-colors">
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
