'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SLIDES = [
  {
    tag: 'Egypt',
    headline: 'The Pyramids of Giza Still Defy Explanation.',
    body: 'Built over 4,500 years ago, the Great Pyramid was the tallest man-made structure on Earth for 3,800 years. Our complete guide covers permits, best viewing times, and what the tour operators skip.',
    slug: 'pyramids-of-giza',
    img: 'https://picsum.photos/seed/pyramids-editorial-spotlight/1200/900',
  },
  {
    tag: 'Uganda',
    headline: 'Eye to Eye with Earth\'s Last Mountain Gorillas.',
    body: 'Bwindi Impenetrable Forest shelters half the world\'s remaining mountain gorilla population. Trekking here is one of the rarest encounters left in modern travel.',
    slug: 'bwindi-impenetrable-national-park',
    img: 'https://picsum.photos/seed/bwindi-editorial-spotlight/1200/900',
  },
  {
    tag: 'South Africa',
    headline: 'Table Mountain: Above the Cloud, Below the Stars.',
    body: 'Cape Town\'s flat-topped summit rises 1,085 metres and hosts more plant species than the entire United Kingdom. The hike up is as extraordinary as the view from the top.',
    slug: 'table-mountain',
    img: 'https://picsum.photos/seed/table-mtn-editorial/1200/900',
  },
  {
    tag: 'Tanzania',
    headline: 'The Serengeti Migration: Nothing Prepares You.',
    body: '1.5 million wildebeest and 250,000 zebras crossing an ancient circuit through Tanzania and Kenya. The largest land animal movement on Earth, and it runs every year without fail.',
    slug: 'serengeti-national-park',
    img: 'https://picsum.photos/seed/serengeti-editorial/1200/900',
  },
  {
    tag: 'Morocco',
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
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [next, paused])

  const slide = SLIDES[current]

  return (
    <section
      className="bg-ink relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Full-bleed image — desktop: absolutely stretches right to screen edge */}
      <div
        key={`img-${current}`}
        className="hidden lg:block absolute inset-y-0 left-1/2 right-0 animate-fade-in"
        aria-hidden="true"
      >
        <Image
          src={slide.img}
          alt={slide.headline}
          fill
          className="object-cover"
          sizes="55vw"
          priority={current === 0}
        />
        {/* Gradient blend: dark on the left (meeting text), transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-ink/10 pointer-events-none" />
        {/* Subtle vignette on top and bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-ink/15 pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[560px]">

          {/* Text side */}
          <div className="py-18 lg:py-24 pr-0 lg:pr-16 flex flex-col justify-center">
            <h2
              key={`title-${current}`}
              className="font-display font-bold text-4xl sm:text-5xl text-cream leading-tight mb-5 animate-fade-in"
            >
              {slide.headline}
            </h2>
            <p
              key={`body-${current}`}
              className="font-sans text-[16px] text-cream/65 leading-relaxed mb-8 max-w-md animate-fade-in"
            >
              {slide.body}
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href={`/attractions/${slide.slug}`}
                className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-[0.98]"
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
                Explore {slide.tag}
              </Link>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-4">
              <button onClick={prev} aria-label="Previous article"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <div className="flex gap-2 items-center">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`}
                    className={`h-1 rounded-full transition-all duration-400 ${i === current ? 'w-8 bg-gold-400' : 'w-2 bg-white/25 hover:bg-white/45'}`}
                  />
                ))}
              </div>

              <button onClick={next} aria-label="Next article"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <span className="font-mono text-[10px] text-cream/25 ml-1">
                {current + 1} / {SLIDES.length}
              </span>
            </div>
          </div>

          {/* Mobile image — block below text on small screens */}
          <div
            key={`img-mob-${current}`}
            className="relative min-h-[260px] lg:hidden animate-fade-in mb-1"
          >
            <Image
              src={slide.img}
              alt={slide.headline}
              fill
              className="object-cover rounded-2xl"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-ink/40 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
