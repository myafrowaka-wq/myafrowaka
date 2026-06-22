import Link from 'next/link'
import { client } from '@/sanity/lib/client'

const FEATURED_QUERY = `*[_type == "attraction" && contentStatus == "Published"] | order(_createdAt desc)[0..7]{
  name, "slug": slug.current, type, continentRegion, editorialSummary,
  "country": country->{ name, "slug": slug.current }
}`

const REGIONS = [
  {
    name: 'East Africa',
    href: '/search?region=East+Africa',
    desc: 'The Great Migration, mountain gorillas, Rift Valley lakes, and the Swahili Coast.',
    color: '#3F6A3D',
  },
  {
    name: 'West Africa',
    href: '/search?region=West+Africa',
    desc: "Benin's Bronze Kingdom, Ghana's slave forts, Lagos, and the Sahel's ancient mosques.",
    color: '#B55D39',
  },
  {
    name: 'Southern Africa',
    href: '/search?region=Southern+Africa',
    desc: "Okavango Delta, Victoria Falls, Cape Winelands, Kruger Park, and Skeleton Coast.",
    color: '#29251A',
  },
  {
    name: 'North Africa',
    href: '/search?region=North+Africa',
    desc: 'Roman ruins, Sahara landscapes, imperial medinas, and the Nile from source to delta.',
    color: '#A22E29',
  },
  {
    name: 'Central Africa',
    href: '/search?region=Central+Africa',
    desc: 'Congo Basin rainforests, western lowland gorillas, and the least-visited parks on earth.',
    color: '#262219',
  },
  {
    name: 'Indian Ocean Islands',
    href: '/search?region=Indian+Ocean+Islands',
    desc: 'Mauritius, the Seychelles, Reunion, and Madagascar, where species exist nowhere else.',
    color: '#3B403E',
  },
]

const STANDARDS = [
  {
    title: 'Written from inside Africa',
    body: "Our team operates from Abuja, Nigeria. We don't pitch Africa to outsiders from a distance. We write about it the way a well-travelled African friend would: with specifics, context, and the kind of details that only come from actually going.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <path d="M20 4C13 4 8 11 8 18c0 5 3 9 7 12l5 6 5-6c4-3 7-7 7-12 0-7-5-14-12-14z" fill="#B55D39" opacity="0.15"/>
        <path d="M20 6C14 6 10 12 10 18c0 4.5 2.5 8 6 11l4 5 4-5c3.5-3 6-6.5 6-11 0-6-4-12-10-12z" stroke="#B55D39" strokeWidth="1.5" fill="none"/>
        <circle cx="20" cy="18" r="4" fill="#B55D39"/>
      </svg>
    ),
  },
  {
    title: 'Verified, not guessed',
    body: "Every entry fee, airport IATA code, and driving distance in our guides is sourced from a primary authority. When we cannot confirm a detail, we say so explicitly. No approximation is published as fact.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <circle cx="20" cy="20" r="14" fill="#3F6A3D" opacity="0.12"/>
        <circle cx="20" cy="20" r="13" stroke="#3F6A3D" strokeWidth="1.5"/>
        <path d="M13 20l5 5 9-10" stroke="#3F6A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    title: 'Specific, always',
    body: "You will not read 'a stunning landscape in East Africa' here. You will read 'the 290-kilometre escarpment of the Ethiopian Highlands north of Gondar.' Specificity is not a style choice. It is a form of respect for the places and the people who visit them.",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
        <rect x="8" y="10" width="24" height="20" rx="3" fill="#D5A942" opacity="0.12"/>
        <rect x="8" y="10" width="24" height="20" rx="3" stroke="#D5A942" strokeWidth="1.5"/>
        <path d="M13 17h14M13 21h10M13 25h7" stroke="#D5A942" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

interface Attraction {
  name: string
  slug: string
  type?: string[]
  continentRegion?: string
  editorialSummary?: string
  country?: { name: string; slug: string }
}

const REGION_BORDER: Record<string, string> = {
  'East Africa':          '#3F6A3D',
  'West Africa':          '#B55D39',
  'Southern Africa':      '#29251A',
  'North Africa':         '#A22E29',
  'Central Africa':       '#D5A942',
  'Indian Ocean Islands': '#3B403E',
}

export default async function HomePage() {
  const featured = await client.fetch<Attraction[]>(FEATURED_QUERY)

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-ink overflow-hidden">
        {/* Dot-grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(213,169,66,0.07) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Warm radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(181,93,57,0.07) 0%, transparent 65%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 md:py-36 text-center">
          {/* Overline */}
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-400 mb-6">
            Africa Explained by Africans
          </p>

          {/* H1 */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[1.05] tracking-tight mb-6">
            The Africa They<br />
            Never Told You<br />
            <span className="text-ochre-300 italic">About.</span>
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-lg md:text-xl text-cream/55 leading-relaxed max-w-2xl mx-auto mb-10">
            557 verified attraction guides across 47 countries. From the Roman ruins of Morocco
            to the gorilla forests of Uganda. Written by people who live here.
          </p>

          {/* Search bar (link) */}
          <Link
            href="/search"
            className="group flex items-center w-full max-w-xl mx-auto bg-white/8 hover:bg-white/12 border border-white/12 hover:border-white/20 rounded-2xl px-5 py-4 gap-3 transition-all duration-200 mb-10"
          >
            <svg className="w-5 h-5 text-cream/35 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="font-sans text-[15px] text-cream/35 flex-1 text-left">
              Search Pyramids of Giza, Bwindi Forest, Cape Town&hellip;
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/50 bg-white/10 group-hover:bg-crimson group-hover:text-cream px-3 py-1.5 rounded-full shrink-0 transition-colors">
              Search
            </span>
          </Link>

          {/* Stats strip */}
          <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
            {[
              { num: '557', label: 'Verified Guides' },
              { num: '47',  label: 'Countries' },
              { num: '6',   label: 'Regions' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-4">
                {i > 0 && <span className="text-cream/15 hidden md:block">·</span>}
                <div className="text-center">
                  <p className="font-display text-3xl md:text-4xl text-cream leading-none">{s.num}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-cream/40 mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED GUIDES ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-24">
          <div className="flex items-end justify-between mb-10 md:mb-12">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ochre-600 mb-2">Start Here</p>
              <h2 className="font-display text-4xl md:text-5xl text-charcoal">
                Africa&apos;s Most<br className="hidden md:block" /> Remarkable Places
              </h2>
            </div>
            <Link
              href="/search"
              className="hidden md:inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ochre-600 hover:text-ochre-700 transition-colors shrink-0 mb-2"
            >
              All guides
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.slice(0, 6).map(attraction => {
              const borderColor = REGION_BORDER[attraction.continentRegion || ''] || '#B55D39'
              const typeLabel = attraction.type?.[0]?.replace('UNESCO World Heritage Site | ', '') || ''
              return (
                <Link
                  key={attraction.slug}
                  href={`/attractions/${attraction.slug}`}
                  className="group block bg-white border border-line hover:border-ochre-300 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-lift)]"
                >
                  {/* Colour accent top */}
                  <div className="h-[3px]" style={{ backgroundColor: borderColor }} />

                  <div className="p-6">
                    {typeLabel && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ochre-600 block mb-2.5">
                        {typeLabel}
                      </span>
                    )}
                    <h3 className="font-display text-xl text-charcoal group-hover:text-ochre-600 transition-colors leading-snug mb-2">
                      {attraction.name}
                    </h3>
                    {attraction.country && (
                      <p className="font-mono text-[10px] text-charcoal/40 uppercase tracking-[0.12em] mb-3">
                        {attraction.country.name}
                      </p>
                    )}
                    {attraction.editorialSummary && (
                      <p className="text-sm text-charcoal/60 leading-relaxed line-clamp-3">
                        {attraction.editorialSummary}
                      </p>
                    )}
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ochre-600 group-hover:text-ochre-700 transition-colors">
                      Read guide &rarr;
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 border border-ochre-200 text-ochre-600 font-mono text-xs uppercase tracking-[0.12em] px-6 py-3 rounded-full hover:bg-ochre-50 transition-colors"
            >
              View all guides &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* ── BROWSE BY REGION ─────────────────────────────────────── */}
      <section className="bg-sand py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-10 md:mb-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ochre-600 mb-2">Find Your Starting Point</p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal">
              47 Countries.<br className="hidden sm:block" /> Six Regions.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REGIONS.map(region => (
              <Link
                key={region.name}
                href={region.href}
                className="group block rounded-2xl overflow-hidden"
                style={{ backgroundColor: region.color }}
              >
                <div
                  className="relative p-7 min-h-[200px] flex flex-col justify-between overflow-hidden"
                >
                  {/* Subtle stripe pattern */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
                      backgroundSize: '14px 14px',
                    }}
                  />
                  <div className="relative">
                    <h3 className="font-display text-2xl md:text-3xl text-cream leading-tight mb-2">
                      {region.name}
                    </h3>
                    <p className="text-[13px] text-cream/60 leading-relaxed">
                      {region.desc}
                    </p>
                  </div>
                  <p className="relative font-mono text-[11px] uppercase tracking-[0.14em] text-cream/40 group-hover:text-cream/80 transition-colors mt-5">
                    Explore region &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUR STANDARD ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ochre-600 mb-2">Why MyAfroWaka</p>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-5">
            Different by Design
          </h2>
          <p className="font-sans text-charcoal/60 max-w-xl mx-auto leading-relaxed">
            There is no shortage of travel websites. There is a shortage of African travel media
            written by Africans, held to high standards, for people who want the real story.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {STANDARDS.map(s => (
            <div
              key={s.title}
              className="bg-white border border-line rounded-2xl p-7 hover:border-ochre-200 transition-colors"
            >
              <div className="mb-5">{s.icon}</div>
              <h3 className="font-display text-xl text-charcoal mb-3">{s.title}</h3>
              <p className="text-sm text-charcoal/65 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────── */}
      <section className="bg-ink py-20 md:py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(213,169,66,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold-400 mb-3">Stay Connected</p>
          <h2 className="font-display text-4xl md:text-5xl text-cream mb-4">
            Africa in Your Inbox
          </h2>
          <p className="font-sans text-cream/50 leading-relaxed mb-8">
            New destination guides, travel intelligence, and stories from the field.
            One email when there is something worth reading. No schedule. No filler.
          </p>
          <form className="flex gap-2" action="#">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-white/8 border border-white/12 rounded-full px-5 py-3.5 text-sm font-sans text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold-400/50"
            />
            <button
              type="submit"
              className="bg-ochre-600 hover:bg-ochre-700 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.12em] px-5 py-3.5 rounded-full transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
          <p className="font-mono text-[10px] text-cream/25 uppercase tracking-[0.12em] mt-4">
            Newsletter setup coming soon &mdash; we&apos;ll announce when it launches
          </p>
        </div>
      </section>
    </>
  )
}
