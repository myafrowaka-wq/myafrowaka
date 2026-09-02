'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { COUNTRY_COLOR } from '@/lib/regionColors'
import { Flag } from '@/components/Flag'
import { stockImage } from '@/lib/stockImageCredits'

type Country = {
  name: string; slug: string; region: string; code: string; color: string; image: string
}

const ALL_COUNTRIES: Country[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',         code: 'eg', color: COUNTRY_COLOR['Egypt'], image: stockImage('1640005438758-861043e64aa5')  },
  // Session 6.3 (WDOS Performance gate) — see lib/stockImageCredits.ts's
  // matching comment on COUNTRY_IMAGE_IDS.kenya: the old ID here was a
  // graphic lion-kill photo, not a Kenya tourism scene.
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',          code: 'ke', color: COUNTRY_COLOR['Kenya'], image: stockImage('hero-savanna-poster')  },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa',      code: 'za', color: COUNTRY_COLOR['South Africa'], image: stockImage('1744604030401-b24c5975a574')  },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',          code: 'tz', color: COUNTRY_COLOR['Tanzania'], image: stockImage('1635865897833-38bc0f8aee44')  },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',         code: 'ma', color: COUNTRY_COLOR['Morocco'], image: stockImage('1760681554227-d7aad73cd57f')  },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',          code: 'gh', color: COUNTRY_COLOR['Ghana'], image: stockImage('1727023663928-1772e2c7e679')  },
  { name: 'Rwanda',       slug: 'rwanda',       region: 'East Africa',          code: 'rw', color: COUNTRY_COLOR['Rwanda'], image: stockImage('1682773083896-95176d8aecf8')  },
  { name: 'Ethiopia',     slug: 'ethiopia',     region: 'East Africa',          code: 'et', color: COUNTRY_COLOR['Ethiopia'], image: stockImage('1782283849015-df78517d4765')  },
  { name: 'Uganda',       slug: 'uganda',       region: 'East Africa',          code: 'ug', color: COUNTRY_COLOR['Uganda'], image: stockImage('1614528767034-70de9fe166e0')  },
  { name: 'Senegal',      slug: 'senegal',      region: 'West Africa',          code: 'sn', color: COUNTRY_COLOR['Senegal'], image: stockImage('1644772088209-c71d5c59f719')  },
  { name: 'Zimbabwe',     slug: 'zimbabwe',     region: 'Southern Africa',      code: 'zw', color: COUNTRY_COLOR['Zimbabwe'], image: stockImage('1618811308896-d279d72fdf4d')  },
  { name: 'Namibia',      slug: 'namibia',      region: 'Southern Africa',      code: 'na', color: COUNTRY_COLOR['Namibia'], image: stockImage('1563985336376-568060942b80')  },
  { name: 'Botswana',     slug: 'botswana',     region: 'Southern Africa',      code: 'bw', color: COUNTRY_COLOR['Botswana'], image: stockImage('1531208853003-c1ec1b8a81d7')  },
]

// Session 6.3 (WDOS Content Integrity gate, X-32 — every link resolves) —
// real bug, found by actually crawling every link this component renders:
// Madagascar, Tunisia, Ivory Coast, Mozambique, Zambia, Mauritius, and
// Nigeria were all in this list with zero published attractions and no
// country overview written yet, so /destinations/[slug]'s own honest gate
// (`if (dest.attractions.length === 0 && !dest.overview) notFound()`)
// 404s every one of them — confirmed against the live Sanity dataset, not
// assumed. Removed rather than linked-and-broken; add each back the moment
// it has a real overview or a published attraction.

function CountryCard({ d }: { d: Country }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 block shrink-0"
      style={{ aspectRatio: '3/4', width: 'clamp(140px, 30vw, 220px)', scrollSnapAlign: 'start' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
      {/* Session 6.3 — image-redundant-alt: d.name is a visible heading in this same card below. */}
      <Image src={d.image} alt="" fill
        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 17vw"
        className="object-cover img-editorial mix-blend-multiply opacity-60 img-inner"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-sans text-[14px] lg:text-[14px] uppercase tracking-[0.12em] text-cream/55 mb-1 flex items-center gap-1.5">
          <Flag code={d.code} />
        </p>
        <h3
          className="font-display font-bold text-cream group-hover:text-gold-300 transition-colors leading-tight text-sm lg:text-[14px]"
          style={{ letterSpacing: '-0.015em' }}
        >
          {d.name}
        </h3>
      </div>
    </Link>
  )
}

const ARROW_BTN = 'w-10 h-10 rounded-full border border-line dark-flip-border bg-cream dark-flip-card flex items-center justify-center text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-charcoal/50 shrink-0'

// User-controlled horizontal carousel — moves only in direct response to a
// click, a touch swipe, or a keyboard arrow key while a card is focused
// (native browser behaviour for a scrollable region). No timer, no
// auto-advance: WDOS M-09 bans that outright regardless of how it's built.
// The previous version of this section (Session 1.3) was a static grid with
// no carousel at all; before that, a CSS marquee + an auto-advancing mobile
// slider, both deleted as banned AI-site motion (M-05, M-09).
export function DestinationsGrid() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd]     = useState(false)

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateEdges()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateEdges, { passive: true })
    window.addEventListener('resize', updateEdges)
    return () => {
      el.removeEventListener('scroll', updateEdges)
      window.removeEventListener('resize', updateEdges)
    }
  }, [updateEdges])

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        role="region"
        aria-label="Destinations carousel"
        className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {ALL_COUNTRIES.map(d => (
          <CountryCard key={d.slug} d={d} />
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          type="button" onClick={() => scrollByPage(-1)} disabled={atStart}
          aria-label="Previous destinations" className={ARROW_BTN}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          type="button" onClick={() => scrollByPage(1)} disabled={atEnd}
          aria-label="Next destinations" className={ARROW_BTN}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
