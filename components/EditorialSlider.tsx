'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

export interface EditorialSlide {
  headline: string
  body: string
  slug: string
  img: string
  category?: string
}

// Owner review (2026-09-06) — this used to be 4 hand-written slides with a
// fixed slug/image/country baked in, so the section never changed no
// matter how many real articles got published. It now renders whatever
// slides the page passes in — see app/[locale]/page.tsx, which draws a
// same-day-stable random sample from the real published post list (or
// FALLBACK_POSTS if Sanity is unreachable) using lib/dailyRandom.ts, so a
// visitor sees something different once the date rolls over, not a
// hand-curated set that never moves.
export function EditorialSlider({ slides }: { slides: EditorialSlide[] }) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % slides.length)
  }, [slides.length])
  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Owner review (2026-09-06) — explicit request: "it swipes on its own
  // every 10 seconds." This is a deliberate, direct reversal of Session
  // 1.3's WDOS M-09 read on auto-advancing carousels (see this file's
  // git history) — the owner is the one person whose call that actually
  // is. Kept as safe as a timed auto-advance can be: a real
  // prefers-reduced-motion check stops the timer outright (X-11/M-08,
  // same standard as everywhere else on the site — the global CSS
  // override in globals.css can't reach a JS setInterval, so it has to be
  // checked here directly), and it pauses on hover/focus so a visitor
  // reading a slide never has it change under them. The manual prev/next/
  // dot controls are untouched.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches || paused || slides.length <= 1) return
    timerRef.current = setInterval(next, 10_000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [next, paused, slides.length])

  if (slides.length === 0) return null
  const slide = slides[Math.min(current, slides.length - 1)]

  return (
    <section
      className="bg-ink relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        key={`img-${current}`}
        className="absolute inset-0 lg:inset-y-0 lg:left-[45%] lg:right-0 animate-fade-in"
        aria-hidden="true"
      >
        <Image
          src={slide.img} alt={slide.headline} fill
          className="object-cover"
          sizes="(max-width:1024px) 100vw, 60vw"
          priority={current === 0}
        />
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/5 pointer-events-none"/>
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20 pointer-events-none"/>
        <div className="lg:hidden absolute inset-0 bg-ink/88 pointer-events-none"/>
      </div>

      {/* Owner review (2026-09-06) — top/bottom padding tightened
          (py-20/28 -> py-14/20) and the eyebrow badge above the headline
          removed outright: it only ever showed a country name that real
          posts don't reliably carry (none of the 11 live posts have
          featuredCountry set), and the owner asked for it gone regardless. */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[520px]">
          <div className="py-14 lg:py-20 pr-0 lg:pr-20 flex flex-col justify-center">

            <h2
              key={`title-${current}`}
              className="font-display font-extrabold text-cream animate-fade-in mb-6"
              style={{ fontSize: 'clamp(28px, 3.8vw, 54px)', lineHeight: '1.0', letterSpacing: '-0.022em' }}
            >
              {slide.headline}
            </h2>

            <p key={`body-${current}`} className="font-sans text-[15px] text-cream/68 leading-relaxed mb-10 max-w-md animate-fade-in">
              {slide.body}
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link href={`/blog/${slide.slug}`}
                className="inline-flex items-center gap-2 bg-action hover:bg-action-hover text-cream font-sans text-[14px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-colors">
                Read the Full Article
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              {slide.category && (
                <Link href={`/blog?category=${encodeURIComponent(slide.category)}`}
                  className="inline-flex items-center border border-white/20 hover:border-white/40 text-cream/70 hover:text-cream font-sans text-[14px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-colors">
                  More {slide.category}
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={prev} aria-label="Previous"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className="flex gap-2 items-center">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
                    className={`h-px rounded-full transition-all duration-500 ${i === current ? 'w-10 bg-gold-400' : 'w-3 bg-white/25 hover:bg-white/45'}`}
                  />
                ))}
              </div>
              <button onClick={next} aria-label="Next"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
              <span className="font-sans text-[14px] text-cream/55 tabular-nums ml-1">
                {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
