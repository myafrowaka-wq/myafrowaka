'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SLIDES = [
  {
    tag:      'Nigeria',
    tagSlug:  'nigeria',
    headline: 'What Lagos Rush Hour Teaches You About African City Life.',
    body:     'Five million journeys a day. The danfo, the okada, the man selling credit through your car window. Lagos traffic is not dysfunction. It is an improvised system that works.',
    slug:     'lagos-rush-hour-city-life',
    img:      'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag:      'Ghana',
    tagSlug:  'ghana',
    headline: 'Kumasi Central Market: The Heartbeat of West African Trade.',
    body:     'Kejetia market in Kumasi is one of the largest open-air markets in West Africa. Kente cloth, spices, secondhand goods, live poultry. Every aisle tells a different story.',
    slug:     'kumasi-central-market-west-africa',
    img:      'https://images.unsplash.com/photo-1776153380872-108ba14dc63d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag:      'Rwanda',
    tagSlug:  'rwanda',
    headline: 'Slow Travel in Rwanda: The Country That Made You Stop Rushing.',
    body:     'Rwanda rewards patience. The rolling hills, the mist over Lake Kivu, the silence of Nyungwe Forest. If you move too fast, you will miss everything that makes this country extraordinary.',
    slug:     'slow-travel-rwanda',
    img:      'https://images.unsplash.com/photo-1682773083896-95176d8aecf8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    tag:      'Tanzania',
    tagSlug:  'tanzania',
    headline: 'Zanzibar Stone Town: What the Carved Doors Are Actually Saying.',
    body:     "Every carved wooden door in Stone Town tells its owner's story. Indian brass studs, Omani chain carving, Swahili latticework. The architecture of the old town is a record of four centuries of trade.",
    slug:     'zanzibar-stone-town-doors',
    img:      'https://images.unsplash.com/photo-1678042955980-c173f0460d0a?auto=format&fit=crop&w=1200&q=80',
  },
]

export function EditorialSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused]   = useState(false)
  const [progress, setProgress] = useState(0)

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % SLIDES.length)
    setProgress(0)
  }, [])
  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
    setProgress(0)
  }, [])

  useEffect(() => {
    if (paused) return
    setProgress(0)
    const INTERVAL = 5000
    const TICK     = 50
    let elapsed    = 0
    const timer = setInterval(() => {
      elapsed += TICK
      setProgress(elapsed / INTERVAL * 100)
      if (elapsed >= INTERVAL) next()
    }, TICK)
    return () => clearInterval(timer)
  }, [next, paused, current])

  const slide = SLIDES[current]

  return (
    <section
      className="bg-ink relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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

      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <div className="h-full bg-gold-400 transition-none" style={{ width: `${progress}%` }}/>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-0 min-h-[580px]">
          <div className="py-20 lg:py-28 pr-0 lg:pr-20 flex flex-col justify-center">

            <p className="font-sans text-[14px] uppercase tracking-[0.24em] text-gold-400/70 mb-5">{slide.tag}</p>

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
                className="inline-flex items-center gap-2 bg-action hover:bg-action-hover text-cream font-sans text-[14px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-all btn-magnetic">
                Read the Full Article
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <Link href={`/destinations/${slide.tagSlug}`}
                className="inline-flex items-center border border-white/20 hover:border-white/40 text-cream/70 hover:text-cream font-sans text-[14px] uppercase tracking-[0.13em] px-6 py-3.5 rounded-full transition-colors">
                Explore {slide.tag}
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={prev} aria-label="Previous"
                className="w-10 h-10 rounded-full border border-white/20 hover:border-white/45 flex items-center justify-center text-cream/60 hover:text-cream transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className="flex gap-2 items-center">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => { setCurrent(i); setProgress(0) }} aria-label={`Slide ${i + 1}`}
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
              <span className="font-sans text-[14px] text-cream/22 tabular-nums ml-1">
                {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
