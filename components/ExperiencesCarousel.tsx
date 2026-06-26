'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const EXPERIENCES = [
  { label: 'Safari',    slug: 'safari',  desc: 'The Big Five and beyond',               image: 'https://picsum.photos/seed/exp-safari-rnd/600/800'    },
  { label: 'Culture',   slug: 'culture', desc: 'Living traditions across the continent', image: 'https://picsum.photos/seed/exp-culture-rnd/600/800'   },
  { label: 'Beach',     slug: 'beach',   desc: 'Indian Ocean and Atlantic shores',       image: 'https://picsum.photos/seed/exp-beach-rnd/600/800'     },
  { label: 'History',   slug: 'history', desc: 'Ancient kingdoms and World Heritage',    image: 'https://picsum.photos/seed/exp-history-rnd/600/800'   },
  { label: 'Hiking',    slug: 'hiking',  desc: 'Trails from Simien to Table Mountain',   image: 'https://picsum.photos/seed/exp-hiking-rnd/600/800'    },
  { label: 'Food',      slug: 'food',    desc: 'Tagines, jollof, nyama choma',           image: 'https://picsum.photos/seed/exp-food-rnd/600/800'      },
]

export function ExperiencesCarousel() {
  const [idx, setIdx]   = useState(0)
  const trackRef        = useRef<HTMLDivElement>(null)
  const total           = EXPERIENCES.length
  const visibleOnMobile = 2
  const maxIdx          = total - visibleOnMobile

  function prev() { setIdx(i => Math.max(0, i - 1)) }
  function next() { setIdx(i => Math.min(maxIdx, i + 1)) }

  return (
    <>
      {/* Mobile: touch carousel with 2 visible */}
      <div className="lg:hidden relative">
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex gap-3 transition-transform duration-300"
            style={{ transform: `translateX(calc(-${idx} * (50% + 6px)))` }}
          >
            {EXPERIENCES.map(e => (
              <Link
                key={e.slug}
                href={`/search?q=${encodeURIComponent(e.slug)}`}
                className="card-zoom group relative rounded-2xl overflow-hidden shrink-0 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500"
                style={{ width: 'calc(50% - 6px)', aspectRatio: '3/4' }}
              >
                <Image src={e.image} alt={e.label} fill
                  sizes="50vw"
                  className="object-cover img-editorial img-inner"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="font-display font-bold text-sm text-cream group-hover:text-gold-300 transition-colors leading-tight"
                    style={{ letterSpacing: '-0.01em' }}>
                    {e.label}
                  </h3>
                  <p className="font-sans text-[10px] text-cream/55 mt-1 leading-tight">{e.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button onClick={prev} disabled={idx === 0} aria-label="Previous"
            className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/40 dark-flip-muted disabled:opacity-30 hover:border-crimson hover:text-crimson transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: maxIdx + 1 }, (_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-crimson w-4' : 'bg-charcoal/20 dark-flip-surf w-1.5'}`}/>
            ))}
          </div>

          <button onClick={next} disabled={idx === maxIdx} aria-label="Next"
            className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/40 dark-flip-muted disabled:opacity-30 hover:border-crimson hover:text-crimson transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop: unchanged 6-col grid */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-4">
        {EXPERIENCES.map(e => (
          <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.slug)}`}
            className="card-zoom group relative rounded-2xl overflow-hidden aspect-[2/3] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500">
            <Image src={e.image} alt={e.label} fill
              sizes="17vw"
              className="object-cover img-editorial img-inner"/>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-display font-bold text-[13px] text-cream group-hover:text-gold-300 transition-colors leading-tight"
                style={{ letterSpacing: '-0.01em' }}>
                {e.label}
              </h3>
              <p className="font-sans text-[10px] text-cream/55 mt-1 leading-tight">{e.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
