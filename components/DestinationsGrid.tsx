'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { COUNTRY_COLOR } from '@/lib/regionColors'
import { Flag } from '@/components/Flag'

type Country = {
  name: string; slug: string; region: string; code: string; color: string; image: string
}

const ALL_COUNTRIES: Country[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',         code: 'eg', color: COUNTRY_COLOR['Egypt'], image: 'https://images.unsplash.com/photo-1640005438758-861043e64aa5?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',          code: 'ke', color: COUNTRY_COLOR['Kenya'], image: 'https://images.unsplash.com/photo-1531872036218-4e8a6828e339?auto=format&fit=crop&w=600&q=80'  },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa',      code: 'za', color: COUNTRY_COLOR['South Africa'], image: 'https://images.unsplash.com/photo-1744604030401-b24c5975a574?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',          code: 'tz', color: COUNTRY_COLOR['Tanzania'], image: 'https://images.unsplash.com/photo-1635865897833-38bc0f8aee44?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',         code: 'ma', color: COUNTRY_COLOR['Morocco'], image: 'https://images.unsplash.com/photo-1760681554227-d7aad73cd57f?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',          code: 'gh', color: COUNTRY_COLOR['Ghana'], image: 'https://images.unsplash.com/photo-1727023663928-1772e2c7e679?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Nigeria',      slug: 'nigeria',      region: 'West Africa',          code: 'ng', color: COUNTRY_COLOR['Nigeria'], image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Rwanda',       slug: 'rwanda',       region: 'East Africa',          code: 'rw', color: COUNTRY_COLOR['Rwanda'], image: 'https://images.unsplash.com/photo-1682773083896-95176d8aecf8?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ethiopia',     slug: 'ethiopia',     region: 'East Africa',          code: 'et', color: COUNTRY_COLOR['Ethiopia'], image: 'https://images.unsplash.com/photo-1782283849015-df78517d4765?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Uganda',       slug: 'uganda',       region: 'East Africa',          code: 'ug', color: COUNTRY_COLOR['Uganda'], image: 'https://images.unsplash.com/photo-1614528767034-70de9fe166e0?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Senegal',      slug: 'senegal',      region: 'West Africa',          code: 'sn', color: COUNTRY_COLOR['Senegal'], image: 'https://images.unsplash.com/photo-1644772088209-c71d5c59f719?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Zimbabwe',     slug: 'zimbabwe',     region: 'Southern Africa',      code: 'zw', color: COUNTRY_COLOR['Zimbabwe'], image: 'https://images.unsplash.com/photo-1618811308896-d279d72fdf4d?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Namibia',      slug: 'namibia',      region: 'Southern Africa',      code: 'na', color: COUNTRY_COLOR['Namibia'], image: 'https://images.unsplash.com/photo-1563985336376-568060942b80?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Botswana',     slug: 'botswana',     region: 'Southern Africa',      code: 'bw', color: COUNTRY_COLOR['Botswana'], image: 'https://images.unsplash.com/photo-1531208853003-c1ec1b8a81d7?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Madagascar',   slug: 'madagascar',   region: 'Indian Ocean Islands', code: 'mg', color: COUNTRY_COLOR['Madagascar'], image: 'https://images.unsplash.com/photo-1558694440-03ade9215d7b?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Tunisia',      slug: 'tunisia',      region: 'North Africa',         code: 'tn', color: COUNTRY_COLOR['Tunisia'], image: 'https://images.unsplash.com/photo-1737276812695-a930ae18aec2?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ivory Coast',  slug: 'ivory-coast',  region: 'West Africa',          code: 'ci', color: COUNTRY_COLOR['Ivory Coast'], image: 'https://images.unsplash.com/photo-1690975719788-c0cf5b5692de?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Mozambique',   slug: 'mozambique',   region: 'East Africa',          code: 'mz', color: COUNTRY_COLOR['Mozambique'], image: 'https://images.unsplash.com/photo-1544298903-35eee5a95b4d?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Zambia',       slug: 'zambia',       region: 'Southern Africa',      code: 'zm', color: COUNTRY_COLOR['Zambia'], image: 'https://images.unsplash.com/photo-1678714001094-ba90abd57fec?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Mauritius',    slug: 'mauritius',    region: 'Indian Ocean Islands', code: 'mu', color: COUNTRY_COLOR['Mauritius'], image: 'https://images.unsplash.com/photo-1513415277900-a62401e19be4?auto=format&fit=crop&w=600&q=80'  },
]

function CountryCard({ d }: { d: Country }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 block shrink-0"
      style={{ aspectRatio: '3/4', width: 'clamp(140px, 30vw, 220px)', scrollSnapAlign: 'start' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
      <Image src={d.image} alt={d.name} fill
        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 17vw"
        className="object-cover img-editorial mix-blend-multiply opacity-60 img-inner"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-sans text-[14px] lg:text-[14px] uppercase tracking-[0.12em] text-cream/55 mb-1 flex items-center gap-1.5">
          <Flag code={d.code} />
          {d.region}
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
