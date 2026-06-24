'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* Issue 03 (South Africa) removed per request — kept 01, 02, 04, 05 */
const SLIDES = [
  {
    tag: 'Egypt',
    issue: 'Issue 01',
    headline: 'The Pyramids of Giza Still Defy Explanation.',
    body: 'Built over 4,500 years ago, the Great Pyramid was the tallest man-made structure on Earth for 3,800 years. Our complete guide covers permits, best viewing times, and what the tour operators skip.',
    slug: 'pyramids-of-giza',
    img: 'https://picsum.photos/seed/pyramids-editorial-spotlight/1200/900',
  },
  {
    tag: 'Uganda',
    issue: 'Issue 02',
    headline: 'Eye to Eye with Earth\'s Last Mountain Gorillas.',
    body: 'Bwindi Impenetrable Forest shelters half the world\'s remaining mountain gorilla population. Trekking here is one of the rarest encounters left in modern travel.',
    slug: 'bwindi-impenetrable-national-park',
    img: 'https://picsum.photos/seed/bwindi-editorial-spotlight/1200/900',
  },
  {
    tag: 'Tanzania',
    issue: 'Issue 04',
    headline: 'The Serengeti Migration: Nothing Prepares You.',
    body: '1.5 million wildebeest and 250,000 zebras crossing an ancient circuit through Tanzania and Kenya. The largest land animal movement on Earth, and it runs every year without fail.',
    slug: 'serengeti-national-park',
    img: 'https://picsum.photos/seed/serengeti-editorial/1200/900',
  },
  {
    tag: 'Morocco',
    issue: 'Issue 05',
    headline: 'Marrakech: A City That Remembers Everything.',
    body: 'The medina was built in the 11th century and is still lived in the same way. Souks, riads, and the call to prayer at dawn. A city that layers centuries without hiding any of them.',
    slug: 'djemaa-el-fna-marrakech',
    img: 'https://picsum.photos/seed/marrakech-editorial/1200/900',
  },
]

export function EditorialSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, 6500)
    return () => clearInterval(id)
  }, [next, paused])

  const slide = SLIDES[current]

  return (
    <section
      className="bg-ink relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Desktop full-bleed image */}
      <div
        key={`img-${current}`}
        className="hidden lg:block absolute inset-y-0 left-[45%] right-0 animate-fade-in"
        aria-hidden="true"
      >
        <Image
          src={slide.img}
          alt={slide.headline}
          fill
          className="object-cover"
          sizes="60vw"
          priority={current === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/5 pointer-events-none"/>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20 pointer-events-none"/>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[580px]">

          <div className="py-20 lg:py-28 pr-0 lg:pr-20 flex flex-col justify-center">

            {/* Overline */}
            <div key={`tag-${current}`} className="flex items-center gap-3 mb-8 animate-fade-in">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-cream/30">{slide.issue}</span>
              <span className="w-8 h-px bg-gold-400 opacity-50"/>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-400">{slide.tag}</span>
            </div>

            {/* Headline — reduced to fit 3 lines comfortably */}
            <h2
              key={`title-${current}`}
              className="font-display font-extrabold text-cream animate-fade-in mb-6"
              style={{
                fontSize: 'clamp(28px, 3.8vw, 54px)',
                lineHeight: '1.0',
                letterSpacing: '-0.022em',
              }}
            >
              {slide.headline}
            </h2>

            <p
              key={`body-${current}`}
              className="font-sans text-[15px] text-cream/68 leading-relaxed mb-10 max-w-md animate-fade-in"
            >
              {slide.body}
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link
                href={`/attractions/${slide.slug}`}
                className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-all btn-magnetic"
              >
                Read the full guide
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <Link
                href={`/search?q=${encodeURIComponent(slide.tag)}`}
                className="inline-flex items-center border border-white/20 hover:border-white/40 text-cream/70 hover:text-cream font-mono text-[11px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-colors"
              >
                All {slide.tag} guides
              </Link>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <button onClick={prev} aria-label="Previous"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <div className="flex gap-2 items-center">
                {SLIDES.map((_, i) => (
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

              <span className="font-mono text-[10px] text-cream/22 tabular-nums ml-1">
                {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Mobile image */}
          <div
            key={`img-mob-${current}`}
            className="relative min-h-[240px] lg:hidden animate-fade-in mb-2 rounded-2xl overflow-hidden"
          >
            <Image src={slide.img} alt={slide.headline} fill className="object-cover" sizes="100vw"/>
            <div className="absolute inset-0 bg-ink/40"/>
          </div>
        </div>
      </div>
    </section>
  )
}
