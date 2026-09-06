'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { stockImage } from '@/lib/stockImageCredits'

// Owner review (2026-09-06) — widened from 6 to 10 experiences per direct
// request. The 4 new IDs aren't new licensing: each is already a real,
// vetted Unsplash photo used elsewhere in the codebase for the matching
// subject (lib/stockImageCredits.ts's ATTRACTION_IMAGE_IDS / an earlier
// DestinationsGrid.tsx country card), not a fresh, unreviewed image.
const EXPERIENCES = [
  { label: 'Safari',    slug: 'safari',    desc: 'The Big Five and beyond',                image: stockImage('1741850820849-1b63a5911606')  },
  { label: 'Culture',   slug: 'culture',   desc: 'Living traditions across the continent', image: stockImage('1597212618440-806262de4f6b')  },
  { label: 'Beach',     slug: 'beach',     desc: 'Indian Ocean and Atlantic shores',        image: stockImage('1577455486223-089171b4572f')  },
  { label: 'History',   slug: 'history',   desc: 'Ancient kingdoms and World Heritage',     image: stockImage('1640005438758-861043e64aa5')  },
  { label: 'Hiking',    slug: 'hiking',    desc: 'Trails from Simien to Table Mountain',    image: stockImage('1563985336376-568060942b80')  },
  { label: 'Food',      slug: 'food',      desc: 'Tagines, jollof, nyama choma',            image: stockImage('1664992960082-0ea299a9c53e')  },
  { label: 'Wildlife',  slug: 'wildlife',  desc: 'National parks and migration corridors',  image: stockImage('1635865897833-38bc0f8aee44')  },
  { label: 'Desert',    slug: 'desert',    desc: 'Dunes, salt pans, and starlit nights',    image: stockImage('1666837147745-1c9dea9908a4')  },
  { label: 'Islands',   slug: 'islands',   desc: 'Archipelagos across the Indian Ocean',    image: stockImage('1513415277900-a62401e19be4')  },
  { label: 'Markets',   slug: 'markets',   desc: 'Open-air trade, centuries in the making', image: stockImage('1776153380872-108ba14dc63d')  },
]

function ExperienceCard({ e }: { e: (typeof EXPERIENCES)[number] }) {
  return (
    <Link
      href={`/search?q=${encodeURIComponent(e.label)}`}
      className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 block shrink-0"
      style={{ aspectRatio: '3/4', width: 'clamp(140px, 28vw, 200px)', scrollSnapAlign: 'start' }}
    >
      <Image src={e.image} alt={e.label} fill sizes="(max-width:1024px) 40vw, 17vw"
        className="object-cover img-editorial img-inner"/>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <h3 className="font-display font-bold text-sm sm:text-[15px] text-cream group-hover:text-gold-300 transition-colors leading-tight"
          style={{ letterSpacing: '-0.01em' }}>{e.label}</h3>
        <p className="font-sans text-[14px] text-cream/70 mt-0.5 sm:mt-1 leading-tight">{e.desc}</p>
      </div>
    </Link>
  )
}

const ARROW_BTN = 'w-10 h-10 rounded-full border border-line dark-flip-border bg-cream dark-flip-card flex items-center justify-center text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-line disabled:hover:text-charcoal/50 shrink-0'

// Owner review (2026-09-06) — was two separate static grids (a 2-col
// mobile grid and a fixed 6-col desktop grid, both showing every item at
// once with no controls) plus a heading with no arrows next to it, in a
// page.tsx section of its own. Restructured to match DestinationsGrid's
// carousel pattern exactly: a real user-controlled horizontal scroller
// (no auto-advance — this one was never asked to have any) with prev/next
// arrows sharing the heading's row, since 10 cards no longer fit in one
// static row at any reasonable width. This component now owns its own
// heading for the same reason DestinationsGrid does.
export function ExperiencesCarousel({ heading }: { heading: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

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
    <div>
      <div className="flex items-center justify-between gap-4 mb-9">
        <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
          style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
          {heading}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => scrollByPage(-1)} disabled={atStart}
            aria-label="Previous experiences" className={ARROW_BTN}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button type="button" onClick={() => scrollByPage(1)} disabled={atEnd}
            aria-label="Next experiences" className={ARROW_BTN}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label="Experiences carousel"
        className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {EXPERIENCES.map(e => (
          <ExperienceCard key={e.slug} e={e} />
        ))}
      </div>
    </div>
  )
}
