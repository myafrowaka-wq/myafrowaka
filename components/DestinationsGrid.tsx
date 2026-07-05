'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Country = {
  name: string; slug: string; region: string; flag: string; color: string; image: string
}

const ALL_COUNTRIES: Country[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',         flag: '\u{1F1EA}\u{1F1EC}', color: '#A22E29', image: 'https://images.unsplash.com/photo-1640005438758-861043e64aa5?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',          flag: '\u{1F1F0}\u{1F1EA}', color: '#3F6A3D', image: 'https://images.unsplash.com/photo-1531872036218-4e8a6828e339?auto=format&fit=crop&w=600&q=80'  },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1E6}', color: '#29251A', image: 'https://images.unsplash.com/photo-1744604030401-b24c5975a574?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',          flag: '\u{1F1F9}\u{1F1FF}', color: '#B28E38', image: 'https://images.unsplash.com/photo-1635865897833-38bc0f8aee44?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',         flag: '\u{1F1F2}\u{1F1E6}', color: '#8C4A28', image: 'https://images.unsplash.com/photo-1760681554227-d7aad73cd57f?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',          flag: '\u{1F1EC}\u{1F1ED}', color: '#B55D39', image: 'https://images.unsplash.com/photo-1727023663928-1772e2c7e679?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Nigeria',      slug: 'nigeria',      region: 'West Africa',          flag: '\u{1F1F3}\u{1F1EC}', color: '#3B7A5E', image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Rwanda',       slug: 'rwanda',       region: 'East Africa',          flag: '\u{1F1F7}\u{1F1FC}', color: '#2D6B50', image: 'https://images.unsplash.com/photo-1682773083896-95176d8aecf8?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ethiopia',     slug: 'ethiopia',     region: 'East Africa',          flag: '\u{1F1EA}\u{1F1F9}', color: '#2D5A29', image: 'https://images.unsplash.com/photo-1782283849015-df78517d4765?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Uganda',       slug: 'uganda',       region: 'East Africa',          flag: '\u{1F1FA}\u{1F1EC}', color: '#3F6A3D', image: 'https://images.unsplash.com/photo-1614528767034-70de9fe166e0?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Senegal',      slug: 'senegal',      region: 'West Africa',          flag: '\u{1F1F8}\u{1F1F3}', color: '#B55D39', image: 'https://images.unsplash.com/photo-1644772088209-c71d5c59f719?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Zimbabwe',     slug: 'zimbabwe',     region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1FC}', color: '#29251A', image: 'https://images.unsplash.com/photo-1618811308896-d279d72fdf4d?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Namibia',      slug: 'namibia',      region: 'Southern Africa',      flag: '\u{1F1F3}\u{1F1E6}', color: '#8C6A28', image: 'https://images.unsplash.com/photo-1563985336376-568060942b80?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Botswana',     slug: 'botswana',     region: 'Southern Africa',      flag: '\u{1F1E7}\u{1F1FC}', color: '#4A3218', image: 'https://images.unsplash.com/photo-1531208853003-c1ec1b8a81d7?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Madagascar',   slug: 'madagascar',   region: 'Indian Ocean Islands', flag: '\u{1F1F2}\u{1F1EC}', color: '#3B403E', image: 'https://images.unsplash.com/photo-1558694440-03ade9215d7b?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Tunisia',      slug: 'tunisia',      region: 'North Africa',         flag: '\u{1F1F9}\u{1F1F3}', color: '#A22E29', image: 'https://images.unsplash.com/photo-1737276812695-a930ae18aec2?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ivory Coast',  slug: 'ivory-coast',  region: 'West Africa',          flag: '\u{1F1E8}\u{1F1EE}', color: '#B55D39', image: 'https://images.unsplash.com/photo-1690975719788-c0cf5b5692de?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Mozambique',   slug: 'mozambique',   region: 'East Africa',          flag: '\u{1F1F2}\u{1F1FF}', color: '#3B6E58', image: 'https://images.unsplash.com/photo-1544298903-35eee5a95b4d?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Zambia',       slug: 'zambia',       region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1F2}', color: '#5A3A1A', image: 'https://images.unsplash.com/photo-1678714001094-ba90abd57fec?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Mauritius',    slug: 'mauritius',    region: 'Indian Ocean Islands', flag: '\u{1F1F2}\u{1F1FA}', color: '#2E5B6E', image: 'https://images.unsplash.com/photo-1513415277900-a62401e19be4?auto=format&fit=crop&w=600&q=80'  },
]

function CountryCard({ d }: { d: Country }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 block w-full"
      style={{ aspectRatio: '3/4' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
      <Image src={d.image} alt={d.name} fill
        sizes="(max-width:1024px) 50vw, 17vw"
        className="object-cover img-editorial mix-blend-multiply opacity-60 img-inner"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-inter text-[7px] lg:text-[8px] uppercase tracking-[0.12em] text-cream/55 mb-1">
          {d.flag} {d.region}
        </p>
        <h3
          className="font-display font-bold text-cream group-hover:text-gold-300 transition-colors leading-tight text-sm lg:text-[13px]"
          style={{ letterSpacing: '-0.015em' }}
        >
          {d.name}
        </h3>
      </div>
    </Link>
  )
}

// ── Mobile carousel constants ──────────────────────────────────────────────────
// Show 2 countries per "page". 8 countries = 4 pages.
// Triple for seamless infinite loop: 12 total page slots.
// Key insight: track is 1200% wide; each slot = (100/12)% of track = 100% of container.
// translateX uses % of the TRACK width — so -rawPage/12*100% moves exactly one slot.
// No JavaScript width measurement needed at all.

const MOBILE_POOL  = ALL_COUNTRIES.slice(0, 8)              // 8 countries
const PPV          = 2                                        // countries per view
const PAGES        = MOBILE_POOL.length / PPV                // 4 pages
const COPIES       = 3                                        // triple for seamless loop
const TOTAL_SLOTS  = PAGES * COPIES                          // 12 slots
const SLOT_PCT     = 100 / TOTAL_SLOTS                       // 8.333% per slot
const TRACK_PCT    = TOTAL_SLOTS * 100                       // 1200% track width

// Build 12 slots (4 pages × 3 copies)
const ALL_SLOTS = Array.from({ length: COPIES }, () =>
  Array.from({ length: PAGES }, (_, p) => MOBILE_POOL.slice(p * PPV, p * PPV + PPV))
).flat()

const INTERVAL_MS = 4500

const NAV_BTN = 'w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/40 dark-flip-muted hover:border-crimson hover:text-crimson transition-all active:scale-95'

export function DestinationsGrid() {
  // Start at first slot of the MIDDLE copy so we can go both directions
  const [rawSlot, setRawSlot]   = useState(PAGES)
  const [animated, setAnimated] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setAnimated(true)
      setRawSlot(s => s + 1)
    }, INTERVAL_MS)
  }, [])

  useEffect(() => {
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [startTimer])

  // Seamless loop: after CSS transition finishes, silently teleport within middle copy
  useEffect(() => {
    if (rawSlot >= PAGES * 2) {
      const t = setTimeout(() => {
        setAnimated(false)
        setRawSlot(s => s - PAGES)
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
      }, 520)
      return () => clearTimeout(t)
    }
    if (rawSlot < PAGES) {
      const t = setTimeout(() => {
        setAnimated(false)
        setRawSlot(s => s + PAGES)
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
      }, 520)
      return () => clearTimeout(t)
    }
  }, [rawSlot])

  function handleNav(dir: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setAnimated(true)
    setRawSlot(s => s + dir)
    startTimer()
  }

  function handleDot(pageIdx: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setAnimated(true)
    setRawSlot(PAGES + pageIdx)
    startTimer()
  }

  // Which dot lights up (0-3)
  const dotIdx = ((rawSlot - PAGES) % PAGES + PAGES) % PAGES

  return (
    <>
      {/* ── Mobile: CSS percentage-based infinite carousel ─────────────── */}
      {/* No JS width measurement — track is TRACK_PCT% wide, each slot = 100% of outer */}
      <div className="lg:hidden">
        <div className="overflow-hidden rounded-xl">
          <div
            className="flex"
            style={{
              width: `${TRACK_PCT}%`,
              transform: `translateX(-${rawSlot * SLOT_PCT}%)`,
              transition: animated ? 'transform 500ms cubic-bezier(0.4,0,0.2,1)' : 'none',
              willChange: 'transform',
            }}
          >
            {ALL_SLOTS.map((pair, i) => (
              <div key={i} style={{ width: `${SLOT_PCT}%`, flexShrink: 0 }}>
                <div className="grid grid-cols-2 gap-3 px-0.5">
                  {pair.map(d => (
                    <CountryCard key={d.slug} d={d} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-5">
          <button onClick={() => handleNav(-1)} aria-label="Previous" className={NAV_BTN}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: PAGES }).map((_, i) => (
              <button
                key={i}
                onClick={() => handleDot(i)}
                aria-label={`Page ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === dotIdx ? 'bg-crimson w-5' : 'bg-charcoal/18 dark-flip-surf w-1.5'
                }`}
              />
            ))}
          </div>

          <button onClick={() => handleNav(1)} aria-label="Next" className={NAV_BTN}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Desktop: CSS marquee — self-contained keyframe ─────────────── */}
      <style>{`
        @keyframes marquee-dest-anim {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-dest-track {
          display: flex;
          width: max-content;
          gap: 16px;
          animation: marquee-dest-anim 50s linear infinite;
        }
        .marquee-dest-track:hover { animation-play-state: paused; }
        .marquee-dest-wrap { overflow: hidden; }
      `}</style>
      <div className="hidden lg:block marquee-dest-wrap">
        <div className="marquee-dest-track">
          {[...ALL_COUNTRIES, ...ALL_COUNTRIES].map((d, i) => (
            <div key={i} style={{ width: '200px', flexShrink: 0 }}>
              <CountryCard d={d} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
