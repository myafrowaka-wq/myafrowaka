import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { AfricaMap } from '@/components/AfricaMap'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MyAfroWaka – Discover Africa Beyond the Stereotype',
  description:
    'Verified travel guides to 557 destinations across 47 African countries. Written by Africans, fact-checked, zero fabrications. Explore by region, experience, or country.',
}

// ─── queries ────────────────────────────────────────────────────────────────

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
  | order(_updatedAt desc)[0..2]{
    name, "slug": slug.current, editorialSummary, continentRegion, type,
    "country": country->{ name, "slug": slug.current }
  }
`

// ─── static data ────────────────────────────────────────────────────────────

const POPULAR_SEARCHES = [
  'Victoria Falls',
  'Pyramids of Giza',
  'Serengeti',
  'Zanzibar Islands',
  'Gorilla Trekking',
]

const PLAN_OPTIONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title:    'Where do you want to go?',
    subtitle: 'Browse by country, city, or region',
    href:     '/search',
    color:    'bg-moss-50 text-moss-700',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title:    'When are you going?',
    subtitle: 'Find the best season for each destination',
    href:     '/search',
    color:    'bg-ochre-50 text-ochre-700',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title:    'What is your budget?',
    subtitle: 'Plan for budget, mid-range, or luxury travel',
    href:     '/search',
    color:    'bg-gold-50 text-gold-700',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title:    'What are you interested in?',
    subtitle: 'Safari, culture, history, beaches, food',
    href:     '/search',
    color:    'bg-crimson/10 text-crimson',
  },
]

const TOOLS = [
  {
    href: '#',
    label: 'Visa Guides',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Cost Calculator',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Trip Planner',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    href: '#map-section',
    label: 'Interactive Map',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Travel Safety',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'SIM & Connectivity',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
  },
]

const EXPERIENCES = [
  {
    icon:  '🦁',
    title: 'Safari Adventures',
    desc:  "Track the Big Five across East and Southern Africa's greatest game reserves.",
    href:  '/search?q=safari',
  },
  {
    icon:  '🏛️',
    title: 'Cultural Experiences',
    desc:  "From Yoruba festivals to Zulu traditions — Africa's living cultures, documented.",
    href:  '/search?q=culture',
  },
  {
    icon:  '🏖️',
    title: 'Beach Getaways',
    desc:  'Zanzibar, Seychelles, Mozambique — Indian Ocean coastlines that rival anywhere on earth.',
    href:  '/search?q=beach',
  },
  {
    icon:  '🍲',
    title: 'Food & Drinks',
    desc:  'Jollof debates, injera ceremonies, Cape Malay kitchens — Africa eats well.',
    href:  '/search?q=food',
  },
  {
    icon:  '🏺',
    title: 'Historical Sites',
    desc:  'Pharaonic temples, Great Zimbabwe, medieval Swahili trading cities.',
    href:  '/search?q=history',
  },
  {
    icon:  '🥾',
    title: 'Hiking & Nature',
    desc:  'Kilimanjaro, the Simien Mountains, Drakensberg — Africa rises high and wild.',
    href:  '/search?q=hiking',
  },
]

const REGION_COLORS: Record<string, string> = {
  'East Africa':          '#3F6A3D',
  'West Africa':          '#B55D39',
  'Southern Africa':      '#29251A',
  'North Africa':         '#A22E29',
  'Central Africa':       '#D5A942',
  'Indian Ocean Islands': '#3B403E',
}

const REGIONS_META = [
  { name: 'North Africa',         slug: 'North+Africa',         tagline: 'Sahara · Pyramids · Medinas',           color: '#A22E29' },
  { name: 'West Africa',          slug: 'West+Africa',          tagline: 'Empires · Drumbeats · Atlantic',         color: '#B55D39' },
  { name: 'East Africa',          slug: 'East+Africa',          tagline: 'Rift Valley · Safaris · Swahili Coast',  color: '#3F6A3D' },
  { name: 'Central Africa',       slug: 'Central+Africa',       tagline: 'Congo Basin · Forest · Waterways',       color: '#D5A942' },
  { name: 'Southern Africa',      slug: 'Southern+Africa',      tagline: 'Victoria Falls · Savannah · Winelands',  color: '#29251A' },
  { name: 'Indian Ocean Islands', slug: 'Indian+Ocean+Islands', tagline: 'Madagascar · Seychelles · Mauritius',    color: '#3B403E' },
]

// ─── types ──────────────────────────────────────────────────────────────────

interface Attraction {
  name: string
  slug: string
  type?: string[]
  editorialSummary?: string
  continentRegion?: string
  country?: { name: string; slug: string }
}

interface Country {
  name: string
  slug: string
  continentRegion?: string
  flagEmoji?: string
  count: number
}

// ─── page ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featured, countries, guides] = await Promise.all([
    client.fetch<Attraction[]>(FEATURED_QUERY),
    client.fetch<Country[]>(TOP_COUNTRIES_QUERY),
    client.fetch<Attraction[]>(GUIDES_QUERY),
  ])

  const topCountries = countries.filter(c => c.count > 0).slice(0, 6)

  return (
    <main>

      {/* ══ 1. HERO — split layout ══════════════════════════════════════ */}
      <section
        className="relative bg-ink overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A1813 0%, #1F1B15 50%, #1A1813 100%)' }}
      >
        {/* Multi-layer decorative background */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          background:
            'radial-gradient(ellipse at 72% 38%, rgba(192,120,74,0.17) 0%, transparent 52%), ' +
            'radial-gradient(ellipse at 18% 8%, rgba(218,192,97,0.11) 0%, transparent 45%)',
        }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.065]" style={{
          backgroundImage: 'radial-gradient(circle, #DAC061 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20 lg:py-24">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-14 items-center">

            {/* LEFT — main hero content */}
            <div className="lg:col-span-3 text-center lg:text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ochre-400 mb-4">
                Africa Explained by Africans
              </p>

              <h1 className="font-display text-[2.6rem] sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-7xl leading-[1.05] tracking-tight text-cream mb-5">
                Discover Africa<br />
                <em className="not-italic text-ochre-300 italic">Beyond the Stereotype.</em>
              </h1>

              <p className="font-sans text-base md:text-lg text-cream/55 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8">
                Verified guides to 557 destinations across 47 African countries.
                No fabrications. No stock-photo clichés. Written by people who were actually there.
              </p>

              {/* Search bar — real form action */}
              <form action="/search" method="GET" className="flex gap-2 max-w-xl mx-auto lg:mx-0 mb-5">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35 pointer-events-none"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    name="q"
                    placeholder="Search destinations, countries, experiences…"
                    className="w-full bg-cream/95 text-charcoal placeholder-charcoal/35 font-sans text-sm pl-11 pr-4 py-3.5 rounded-full border border-cream/20 focus:outline-none focus:ring-2 focus:ring-ochre-400/50"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] font-bold uppercase tracking-[0.12em] px-5 py-3 rounded-full transition-colors whitespace-nowrap"
                >
                  Search
                </button>
              </form>

              {/* Popular searches */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-cream/30 self-center mr-1">
                  Popular:
                </span>
                {POPULAR_SEARCHES.map(term => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="font-sans text-[12px] text-cream/60 hover:text-cream bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1 rounded-full transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            {/* RIGHT — Plan Your Perfect Trip widget */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl overflow-hidden border border-white/10"
                style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)' }}>
                <div className="px-5 py-4" style={{ backgroundColor: '#3F6A3D' }}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/55 mb-0.5">
                    Quick Planner
                  </p>
                  <h2 className="font-display text-xl text-cream leading-tight">
                    Plan Your Perfect Trip
                  </h2>
                </div>
                <div className="divide-y divide-line">
                  {PLAN_OPTIONS.map(opt => (
                    <Link
                      key={opt.title}
                      href={opt.href}
                      className="group flex items-center gap-4 px-5 py-4 hover:bg-cream/50 transition-colors"
                    >
                      <div className={`shrink-0 w-9 h-9 ${opt.color} rounded-xl flex items-center justify-center`}>
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] font-medium text-charcoal group-hover:text-ochre-700 transition-colors leading-snug">
                          {opt.title}
                        </p>
                        <p className="font-sans text-[11px] text-charcoal/40 leading-snug mt-0.5">
                          {opt.subtitle}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-charcoal/20 group-hover:text-ochre-500 group-hover:translate-x-0.5 transition-all shrink-0"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
                <div className="px-5 py-3 bg-sand/60 border-t border-line">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/30 text-center">
                    557 verified guides · 47 countries · zero fabricated facts
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ 2. UTILITY TOOLS BAR ════════════════════════════════════════ */}
      <section className="bg-white border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 md:grid-cols-6">
            {TOOLS.map(tool => (
              <Link
                key={tool.label}
                href={tool.href}
                className="flex flex-col items-center gap-2 py-5 px-3 hover:bg-sand/50 rounded-xl transition-colors group"
              >
                <span className="text-ochre-500 group-hover:text-ochre-600 transition-colors">
                  {tool.icon}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-center text-charcoal/40 group-hover:text-charcoal/65 transition-colors leading-tight">
                  {tool.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3. TOP DESTINATIONS ═════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10 gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-1.5">
                Top Destinations
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-charcoal leading-tight">
                Africa&apos;s Most-Documented Countries
              </h2>
            </div>
            <Link href="/search"
              className="hidden sm:inline-flex items-center font-mono text-[10px] uppercase tracking-[0.14em] text-ochre-600 hover:text-ochre-700 transition-colors whitespace-nowrap gap-1">
              View all 47 &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(topCountries.length > 0 ? topCountries : [
              { name: 'Kenya',        slug: 'kenya',        continentRegion: 'East Africa',     flagEmoji: '🇰🇪', count: 0 },
              { name: 'Egypt',        slug: 'egypt',        continentRegion: 'North Africa',    flagEmoji: '🇪🇬', count: 0 },
              { name: 'South Africa', slug: 'south-africa', continentRegion: 'Southern Africa', flagEmoji: '🇿🇦', count: 0 },
              { name: 'Tanzania',     slug: 'tanzania',     continentRegion: 'East Africa',     flagEmoji: '🇹🇿', count: 0 },
              { name: 'Morocco',      slug: 'morocco',      continentRegion: 'North Africa',    flagEmoji: '🇲🇦', count: 0 },
              { name: 'Ghana',        slug: 'ghana',        continentRegion: 'West Africa',     flagEmoji: '🇬🇭', count: 0 },
            ] as Country[]).map(country => {
              const color = REGION_COLORS[country.continentRegion || ''] || '#B55D39'
              return (
                <Link
                  key={country.slug}
                  href={country.count > 0 ? `/countries/${country.slug}` : `/search?q=${encodeURIComponent(country.name)}`}
                  className="group bg-white border border-line hover:border-ochre-200 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="h-[3px]" style={{ backgroundColor: color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {country.flagEmoji ? (
                        <span className="text-3xl leading-none">{country.flagEmoji}</span>
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-mono font-bold"
                          style={{ backgroundColor: color }}>
                          {country.name.charAt(0)}
                        </div>
                      )}
                      {country.count > 0 && (
                        <span className="font-mono text-[9px] px-2 py-1 rounded-full text-white leading-none"
                          style={{ backgroundColor: color }}>
                          {country.count} guide{country.count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors mb-0.5">
                      {country.name}
                    </h3>
                    {country.continentRegion && (
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-charcoal/35 mb-3">
                        {country.continentRegion}
                      </p>
                    )}
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 group-hover:text-ochre-700 transition-colors">
                      Explore &rarr;
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ══ 4. LATEST TRAVEL GUIDES ═════════════════════════════════════ */}
      {guides.length > 0 && (
        <section className="py-16 md:py-20 bg-sand border-y border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-1.5">
                  Latest Guides
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-charcoal">
                  Recently Published
                </h2>
              </div>
              <Link href="/search"
                className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-ochre-600 hover:text-ochre-700 transition-colors whitespace-nowrap">
                All guides &rarr;
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {guides.slice(0, 3).map(guide => {
                const color     = REGION_COLORS[guide.continentRegion || ''] || '#B55D39'
                const typeLabel = guide.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || ''
                return (
                  <Link
                    key={guide.slug}
                    href={`/attractions/${guide.slug}`}
                    className="group flex flex-col bg-white border border-line hover:border-ochre-200 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
                  >
                    <div className="h-[3px]" style={{ backgroundColor: color }} />
                    <div className="p-6 flex flex-col flex-1">
                      {typeLabel && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-500 mb-2">
                          {typeLabel}
                        </span>
                      )}
                      {guide.country && (
                        <p className="font-sans text-[11px] text-charcoal/40 mb-1">
                          {guide.country.name}{guide.continentRegion ? ` · ${guide.continentRegion}` : ''}
                        </p>
                      )}
                      <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors mb-3 leading-snug flex-1">
                        {guide.name}
                      </h3>
                      {guide.editorialSummary && (
                        <p className="font-sans text-sm text-charcoal/55 leading-relaxed line-clamp-3">
                          {guide.editorialSummary}
                        </p>
                      )}
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 group-hover:text-ochre-700 transition-colors">
                        Read full guide &rarr;
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ 5. FEATURED ATTRACTIONS ═════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="py-16 md:py-20 bg-white border-b border-line">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10 gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-1.5">
                  Featured Attractions
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-charcoal">
                  Where Travellers Are Going
                </h2>
              </div>
              <Link href="/search"
                className="hidden sm:inline-flex font-mono text-[10px] uppercase tracking-[0.14em] text-ochre-600 hover:text-ochre-700 transition-colors whitespace-nowrap">
                Browse all 557 &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.slice(0, 8).map(a => {
                const color     = REGION_COLORS[a.continentRegion || ''] || '#B55D39'
                const typeLabel = a.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || ''
                return (
                  <Link
                    key={a.slug}
                    href={`/attractions/${a.slug}`}
                    className="group flex flex-col bg-white border border-line hover:border-ochre-200 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
                  >
                    <div className="h-[3px]" style={{ backgroundColor: color }} />
                    <div className="p-4 flex flex-col flex-1">
                      {typeLabel && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-ochre-500 mb-2 leading-tight block">
                          {typeLabel}
                        </span>
                      )}
                      <h3 className="font-display text-base text-charcoal group-hover:text-ochre-600 transition-colors mb-1.5 leading-snug flex-1">
                        {a.name}
                      </h3>
                      {a.country && (
                        <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-charcoal/35 mb-3">
                          {a.country.name}
                        </p>
                      )}
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-ochre-600 group-hover:text-ochre-700 transition-colors">
                        Explore &rarr;
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ══ 6. INTERACTIVE AFRICA MAP ═══════════════════════════════════ */}
      <section id="map-section" className="py-16 md:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">
              Interactive Africa Map
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-3">
              Explore Destinations by Region
            </h2>
            <p className="font-sans text-charcoal/50 max-w-sm mx-auto text-sm">
              Click any region on the map to browse verified guides for that area.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-14 items-start">
            {/* SVG Map */}
            <div className="lg:col-span-2 flex items-center justify-center">
              <div className="w-full max-w-xs mx-auto">
                <AfricaMap />
              </div>
            </div>

            {/* Region list */}
            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-3 content-start">
              {REGIONS_META.map(r => (
                <Link
                  key={r.name}
                  href={`/search?region=${r.slug}`}
                  className="group flex items-start gap-4 bg-white border border-line hover:border-ochre-200 rounded-2xl p-4 transition-all hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                    style={{ backgroundColor: r.color }} />
                  <div className="flex-1">
                    <p className="font-display text-base text-charcoal group-hover:text-ochre-600 transition-colors leading-tight mb-0.5">
                      {r.name}
                    </p>
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-charcoal/38">
                      {r.tagline}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-charcoal/20 group-hover:text-ochre-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 7. EXPLORE BY EXPERIENCE ════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-sand border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">
              Explore by Experience
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal">
              What Kind of Traveller Are You?
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {EXPERIENCES.map(exp => (
              <Link
                key={exp.title}
                href={exp.href}
                className="group bg-white hover:bg-ochre-50/50 border border-line hover:border-ochre-200 rounded-2xl p-5 md:p-6 transition-all duration-200 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="text-3xl md:text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {exp.icon}
                </div>
                <h3 className="font-display text-base md:text-lg text-charcoal group-hover:text-ochre-600 transition-colors mb-2">
                  {exp.title}
                </h3>
                <p className="font-sans text-sm text-charcoal/50 leading-relaxed">
                  {exp.desc}
                </p>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 group-hover:text-ochre-700 transition-colors">
                  Explore &rarr;
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 8. STATS BAR ════════════════════════════════════════════════ */}
      <section className="bg-charcoal py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '47',  label: 'African Countries',  sub: 'documented and growing' },
              { num: '557', label: 'Attraction Guides',  sub: 'published and verified'  },
              { num: '6',   label: 'Distinct Regions',   sub: 'from Sahara to Cape'     },
              { num: '0',   label: 'Fabricated Facts',   sub: 'zero tolerance policy'   },
            ].map(stat => (
              <div key={stat.label}>
                <p className="font-display text-5xl md:text-6xl text-ochre-300 leading-none mb-1">
                  {stat.num}
                </p>
                <p className="font-sans text-sm text-cream/75 font-medium mb-0.5">
                  {stat.label}
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/30">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 9. WHY MYAFROWAKA ═══════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ochre-500 mb-2">
              Why MyAfroWaka
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal">
              The Standard We Hold Ourselves To
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Verified, Not Fabricated',
                body:  'Every price, distance, operating hour, and historical date is sourced. If we cannot verify it, we write [VERIFY] — or leave it out.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                title: 'Specific, Never Generic',
                body:  'Africa is 54 countries and thousands of ethnic groups. We do not describe it as a single place. Every guide names a country, city, and specific site.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
              },
              {
                title: 'Built for Real Travellers',
                body:  'Entry fees for locals and internationals, how long things actually take, nearest airports, and when not to visit. Practical intelligence, not tourism brochures.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
              },
            ].map(item => (
              <div key={item.title} className="bg-white border border-line rounded-2xl p-6">
                <div className="w-11 h-11 bg-sand rounded-xl flex items-center justify-center text-ochre-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display text-xl text-charcoal mb-2">{item.title}</h3>
                <p className="font-sans text-sm text-charcoal/55 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 10. NEWSLETTER ══════════════════════════════════════════════ */}
      <section
        className="relative py-16 md:py-20 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1A1813 0%, #1F1B15 100%)' }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.055]" style={{
          backgroundImage: 'radial-gradient(circle, #DAC061 1px, transparent 1px)',
          backgroundSize:  '28px 28px',
        }} />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 65% 55%, rgba(162,46,41,0.13) 0%, transparent 60%)',
        }} />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ochre-400 mb-3">
            Africa in Your Inbox
          </p>
          <h2 className="font-display text-3xl md:text-4xl text-cream mb-4 leading-tight">
            New Guides. Every Week.<br />
            <span className="text-ochre-300">No Fluff. No Fabrications.</span>
          </h2>
          <p className="font-sans text-cream/50 mb-8 leading-relaxed text-sm md:text-base">
            We publish verified guides to African destinations, hidden gems, practical travel
            intelligence, and the history no travel magazine covers.
          </p>
          <form action="#" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/6 border border-white/12 text-cream placeholder-cream/25 font-sans text-sm px-5 py-3.5 rounded-full focus:outline-none focus:ring-2 focus:ring-ochre-400/40"
            />
            <button
              type="submit"
              className="bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] font-bold uppercase tracking-[0.12em] px-6 py-3.5 rounded-full transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.14em] text-cream/22">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </section>

    </main>
  )
}
