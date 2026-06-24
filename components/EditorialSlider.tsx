'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SLIDES = [
  {
    tag: 'Egypt',
    region: 'North Africa',
    headline: 'The Pyramids of Giza Still Defy Explanation.',
    body: 'Built over 4,500 years ago, the Great Pyramid was the tallest man-made structure on Earth for 3,800 years. Our complete guide covers permits, best viewing times, and what the tour operators skip.',
    slug: 'pyramids-of-giza',
    countrySlug: 'egypt',
    img: 'https://picsum.photos/seed/pyramids-editorial-spotlight/800/600',
  },
  {
    tag: 'Uganda',
    region: 'East Africa',
    headline: 'Eye to Eye with Earth\'s Last Mountain Gorillas.',
    body: 'Bwindi Impenetrable Forest shelters half the world\'s remaining mountain gorilla population. Trekking here is one of the rarest encounters left in modern travel.',
    slug: 'bwindi-impenetrable-national-park',
    countrySlug: 'uganda',
    img: 'https://picsum.photos/seed/bwindi-editorial-spotlight/800/600',
  },
  {
    tag: 'South Africa',
    region: 'Southern Africa',
    headline: 'Table Mountain: Above the Cloud, Below the Stars.',
    body: 'Cape Town\'s flat-topped summit rises 1,085 metres and hosts more plant species than the entire United Kingdom. The hike up is as extraordinary as the view from the top.',
    slug: 'table-mountain',
    countrySlug: 'south-africa',
    img: 'https://picsum.photos/seed/table-mtn-editorial/800/600',
  },
  {
    tag: 'Tanzania',
    region: 'East Africa',
    headline: 'The Serengeti Migration: Nothing Prepares You.',
    body: '1.5 million wildebeest and 250,000 zebras crossing an ancient circuit through Tanzania and Kenya. The largest land animal movement on Earth, and it runs every year without fail.',
    slug: 'serengeti-national-park',
    countrySlug: 'tanzania',
    img: 'https://picsum.photos/seed/serengeti-editorial/800/600',
  },
  {
    tag: 'Morocco',
    region: 'North Africa',
    headline: 'Marrakech: A City That Remembers Everything.',
    body: 'The medina was built in the 11th century and is still lived in the same way. Souks, riads, and the call to prayer at dawn. A city that layers centuries without hiding any of them.',
    slug: 'djemaa-el-fna-marrakech',
    countrySlug: 'morocco',
    img: 'https://picsum.photos/seed/marrakech-editorial/800/600',
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
      className="bg-ink overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[520px]">

          {/* Text side */}
          <div className="py-16 lg:py-20 pr-0 lg:pr-14 flex flex-col justify-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-400 mb-4">
              {slide.region}
            </p>
            <h2
              key={`title-${current}`}
              className="font-display font-bold text-4xl sm:text-5xl text-cream leading-tight mb-5 animate-fade-in"
            >
              {slide.headline}
            </h2>
            <p
              key={`body-${current}`}
              className="font-sans text-cream/60 leading-relaxed mb-8 max-w-md animate-fade-in"
            >
              {slide.body}
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href={`/attractions/${slide.slug}`}
                className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-colors"
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
              <button
                onClick={prev}
                aria-label="Previous article"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>

              <div className="flex gap-2 items-center">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1 rounded-full transition-all duration-400 ${i === current ? 'w-8 bg-gold-400' : 'w-2 bg-white/25 hover:bg-white/45'}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                aria-label="Next article"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </button>

              <span className="font-mono text-[10px] text-cream/25 ml-1">
                {current + 1} / {SLIDES.length}
              </span>
            </div>
          </div>

          {/* Image side */}
          <div key={`img-${current}`} className="relative min-h-[300px] lg:min-h-0 animate-fade-in">
            <Image
              src={slide.img}
              alt={slide.headline}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/20 to-transparent hidden lg:block" />
            <div className="absolute inset-0 bg-ink/45 lg:hidden" />
          </div>
        </div>
      </div>
    </section>
  )
}
