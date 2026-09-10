'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Flag } from '@/components/Flag'
import { HOME_COUNTRIES, type HomeCountry } from '@/lib/homeSections'

// The country list lives in lib/homeSections.ts now (a plain module, so
// the force-dynamic homepage can shuffle it per request and pass it back
// as the `countries` prop). Session 6.3's X-32 rule still holds: every
// country in that list must have a real overview or a published
// attraction, or /destinations/[slug]'s own notFound() gate 404s it.

function CountryCard({ d }: { d: HomeCountry }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      // Owner review (2026-09-06) — the flat colour-tint overlay
      // (d.color background + mix-blend-multiply + 60% opacity) is gone:
      // plain photography now, per direct feedback. Dropped .card-zoom's
      // hover-triggered scale(1.06) too, since it targets the same
      // `transform` property as the new continuous ambient zoom below —
      // running both would fight each other on hover. overflow-hidden
      // stays local so the zoomed image never spills past the card's
      // rounded corners.
      className="group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 block shrink-0"
      style={{ aspectRatio: '3/4', width: 'clamp(140px, 30vw, 220px)', scrollSnapAlign: 'start' }}
    >
      {/* Session 6.3 — image-redundant-alt: d.name is a visible heading in this same card below. */}
      <Image src={d.image} alt="" fill
        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 17vw"
        className="object-cover img-editorial img-slow-zoom"
      />
      {/* Kept, lighter: the flag + country name below still need real
          contrast against a busy photo — this is legibility, not a tint. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"/>
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

// Owner review (2026-09-06, third pass) — "very difficult to see": a
// 50%-opacity icon on a 1px near-white border was too low-contrast for a
// thin chevron stroke at this size. Full-opacity charcoal + a visibly
// darker border fixes it without going full-black or losing the quiet,
// editorial feel every other secondary control on the site has.
const ARROW_BTN = 'w-10 h-10 rounded-full border-2 border-charcoal/35 dark-flip-border bg-cream dark-flip-card flex items-center justify-center text-charcoal dark-flip-text hover:bg-crimson hover:border-crimson hover:text-cream transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-cream disabled:hover:border-charcoal/35 disabled:hover:text-charcoal shrink-0'

// User-controlled horizontal carousel — moves only in direct response to a
// click, a touch swipe, or a keyboard arrow key while a card is focused
// (native browser behaviour for a scrollable region). No timer, no
// auto-advance: WDOS M-09 bans that outright regardless of how it's built.
// The previous version of this section (Session 1.3) was a static grid with
// no carousel at all; before that, a CSS marquee + an auto-advancing mobile
// slider, both deleted as banned AI-site motion (M-05, M-09).
export function DestinationsGrid({ heading, countries = HOME_COUNTRIES }: { heading: string; countries?: HomeCountry[] }) {
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
      {/* Owner review (2026-09-06) — the arrow row used to sit BELOW the
          card track (its own mt-4 row), which was the real source of the
          extra whitespace the owner flagged above this section: two
          stacked gaps (heading→cards, cards→arrows) plus the "All
          Destinations" button's own mt-10, none of which needed to be
          three separate gaps. The heading now owns this row and the
          arrows move up beside it, matching every other carousel-header
          pattern on the site (Featured Attractions, Explore by
          Experience). */}
      <div className="flex items-center justify-between gap-4 mb-9">
        <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
          style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
          {heading}
        </h2>
        <div className="flex items-center gap-2 shrink-0">
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

      <div
        ref={trackRef}
        role="region"
        aria-label="Destinations carousel"
        className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {countries.map(d => (
          <CountryCard key={d.slug} d={d} />
        ))}
      </div>
    </div>
  )
}
