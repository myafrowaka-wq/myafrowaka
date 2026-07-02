'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Country = {
  name: string; slug: string; region: string; flag: string; color: string; image: string
}

const ALL_COUNTRIES: Country[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',         flag: '\u{1F1EA}\u{1F1EC}', color: '#A22E29', image: 'https://picsum.photos/seed/egypt-dest-rnd/600/800'        },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',          flag: '\u{1F1F0}\u{1F1EA}', color: '#3F6A3D', image: 'https://picsum.photos/seed/kenya-dest-rnd/600/800'        },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1E6}', color: '#29251A', image: 'https://picsum.photos/seed/capetown-dest-rnd/600/800'    },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',          flag: '\u{1F1F9}\u{1F1FF}', color: '#B28E38', image: 'https://picsum.photos/seed/tanzania-dest-rnd/600/800'    },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',         flag: '\u{1F1F2}\u{1F1E6}', color: '#8C4A28', image: 'https://picsum.photos/seed/morocco-dest-rnd/600/800'     },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',          flag: '\u{1F1EC}\u{1F1ED}', color: '#B55D39', image: 'https://picsum.photos/seed/ghana-dest-rnd/600/800'       },
  { name: 'Nigeria',      slug: 'nigeria',      region: 'West Africa',          flag: '\u{1F1F3}\u{1F1EC}', color: '#3B7A5E', image: 'https://picsum.photos/seed/nigeria-dest-rnd/600/800'     },
  { name: 'Rwanda',       slug: 'rwanda',       region: 'East Africa',          flag: '\u{1F1F7}\u{1F1FC}', color: '#2D6B50', image: 'https://picsum.photos/seed/rwanda-dest-rnd/600/800'      },
  { name: 'Ethiopia',     slug: 'ethiopia',     region: 'East Africa',          flag: '\u{1F1EA}\u{1F1F9}', color: '#2D5A29', image: 'https://picsum.photos/seed/ethiopia-dest-rnd/600/800'    },
  { name: 'Uganda',       slug: 'uganda',       region: 'East Africa',          flag: '\u{1F1FA}\u{1F1EC}', color: '#3F6A3D', image: 'https://picsum.photos/seed/uganda-dest-rnd/600/800'      },
  { name: 'Senegal',      slug: 'senegal',      region: 'West Africa',          flag: '\u{1F1F8}\u{1F1F3}', color: '#B55D39', image: 'https://picsum.photos/seed/senegal-dest-rnd/600/800'     },
  { name: 'Zimbabwe',     slug: 'zimbabwe',     region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1FC}', color: '#29251A', image: 'https://picsum.photos/seed/zimbabwe-dest-rnd/600/800'    },
  { name: 'Namibia',      slug: 'namibia',      region: 'Southern Africa',      flag: '\u{1F1F3}\u{1F1E6}', color: '#8C6A28', image: 'https://picsum.photos/seed/namibia-dest-rnd/600/800'     },
  { name: 'Botswana',     slug: 'botswana',     region: 'Southern Africa',      flag: '\u{1F1E7}\u{1F1FC}', color: '#4A3218', image: 'https://picsum.photos/seed/botswana-dest-rnd/600/800'    },
  { name: 'Madagascar',   slug: 'madagascar',   region: 'Indian Ocean Islands', flag: '\u{1F1F2}\u{1F1EC}', color: '#3B403E', image: 'https://picsum.photos/seed/madagascar-dest-rnd/600/800'  },
  { name: 'Tunisia',      slug: 'tunisia',      region: 'North Africa',         flag: '\u{1F1F9}\u{1F1F3}', color: '#A22E29', image: 'https://picsum.photos/seed/tunisia-dest-rnd/600/800'     },
  { name: 'Ivory Coast',  slug: 'ivory-coast',  region: 'West Africa',          flag: '\u{1F1E8}\u{1F1EE}', color: '#B55D39', image: 'https://picsum.photos/seed/ivorycoast-dest-rnd/600/800'  },
  { name: 'Mozambique',   slug: 'mozambique',   region: 'East Africa',          flag: '\u{1F1F2}\u{1F1FF}', color: '#3B6E58', image: 'https://picsum.photos/seed/mozambique-dest-rnd/600/800'  },
  { name: 'Zambia',       slug: 'zambia',       region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1F2}', color: '#5A3A1A', image: 'https://picsum.photos/seed/zambia-dest-rnd/600/800'      },
  { name: 'Mauritius',    slug: 'mauritius',    region: 'Indian Ocean Islands', flag: '\u{1F1F2}\u{1F1FA}', color: '#2E5B6E', image: 'https://picsum.photos/seed/mauritius-dest-rnd/600/800'   },
]

function CountryCard({ d }: { d: Country }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 h-full"
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

const VISIBLE_MOBILE = 2
const GAP_MOBILE = 12 // px
const INTERVAL_MS = 4500
// Use first 8 countries as a fixed set for mobile carousel
const DISPLAY = ALL_COUNTRIES.slice(0, 8)
const N = DISPLAY.length
// Triple for seamless infinite loop
const ITEMS = [...DISPLAY, ...DISPLAY, ...DISPLAY]

export function DestinationsGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)
  const [rawIdx, setRawIdx] = useState(N) // start at 2nd copy
  const [animated, setAnimated] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Measure container width with ResizeObserver for reliable SSR-safe detection
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? 0
      if (w > 0) setContainerW(w)
    })
    ro.observe(el)
    // Fallback immediate check
    if (el.offsetWidth > 0) setContainerW(el.offsetWidth)
    return () => ro.disconnect()
  }, [])

  const cardW = containerW > 0 ? (containerW - GAP_MOBILE) / VISIBLE_MOBILE : 0
  const step  = cardW + GAP_MOBILE

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setAnimated(true)
      setRawIdx(i => i + 1)
    }, INTERVAL_MS)
  }, [])

  useEffect(() => {
    if (containerW > 0) {
      setAnimated(false)
      setRawIdx(N)
      const t = setTimeout(() => {
        setAnimated(true)
        startTimer()
      }, 100)
      return () => {
        clearTimeout(t)
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [containerW, startTimer])

  // Seamless loop: after CSS transition, silently reset index
  useEffect(() => {
    if (rawIdx >= N * 2) {
      const t = setTimeout(() => {
        setAnimated(false)
        setRawIdx(i => i - N)
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
      }, 520)
      return () => clearTimeout(t)
    }
    if (containerW > 0 && rawIdx < N) {
      const t = setTimeout(() => {
        setAnimated(false)
        setRawIdx(i => i + N)
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)))
      }, 520)
      return () => clearTimeout(t)
    }
  }, [rawIdx, containerW])

  function handleNav(dir: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setAnimated(true)
    setRawIdx(i => i + dir)
    startTimer()
  }

  function handleDot(i: number) {
    if (timerRef.current) clearInterval(timerRef.current)
    setAnimated(true)
    setRawIdx(N + i)
    startTimer()
  }

  const dotIdx = ((rawIdx - N) % N + N) % N

  const navBtn = 'w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/40 dark-flip-muted hover:border-crimson hover:text-crimson transition-all active:scale-95'

  return (
    <>
      {/* ── Mobile: JS infinite carousel ──────────────────────────────── */}
      <div className="lg:hidden" ref={containerRef}>
        <div className="overflow-hidden rounded-xl">
          <div
            className="flex"
            style={{
              gap: `${GAP_MOBILE}px`,
              transform: containerW > 0 ? `translateX(${-rawIdx * step}px)` : 'translateX(0)',
              transition: animated && containerW > 0 ? 'transform 500ms cubic-bezier(0.4,0,0.2,1)' : 'none',
            }}
          >
            {ITEMS.map((d, i) => (
              <div key={i} className="shrink-0" style={{ width: `${cardW}px` }}>
                <CountryCard d={d} />
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-5">
          <button onClick={() => handleNav(-1)} aria-label="Previous" className={navBtn}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="flex gap-1.5">
            {DISPLAY.map((_, i) => (
              <button key={i} onClick={() => handleDot(i)} aria-label={`Go to ${DISPLAY[i].name}`}
                className={`h-1.5 rounded-full transition-all ${i === dotIdx ? 'bg-crimson w-5' : 'bg-charcoal/18 dark-flip-surf w-1.5'}`}/>
            ))}
          </div>

          <button onClick={() => handleNav(1)} aria-label="Next" className={navBtn}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Desktop: CSS marquee (slow auto-scroll) ─────────────────────── */}
      <div className="hidden lg:block marquee-wrap-dest">
        <div className="marquee-track-dest" style={{ gap: '16px' }}>
          {[...ALL_COUNTRIES, ...ALL_COUNTRIES].map((d, i) => (
            <div key={i} className="shrink-0" style={{ width: '200px' }}>
              <CountryCard d={d} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
