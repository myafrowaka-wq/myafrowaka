'use client'

import Image from 'next/image'
import Link from 'next/link'

const EXPERIENCES = [
  { label: 'Safari',  slug: 'safari',  desc: 'The Big Five and beyond',               image: 'https://picsum.photos/seed/exp-safari-rnd/600/800'   },
  { label: 'Culture', slug: 'culture', desc: 'Living traditions across the continent', image: 'https://picsum.photos/seed/exp-culture-rnd/600/800'  },
  { label: 'Beach',   slug: 'beach',   desc: 'Indian Ocean and Atlantic shores',       image: 'https://picsum.photos/seed/exp-beach-rnd/600/800'    },
  { label: 'History', slug: 'history', desc: 'Ancient kingdoms and World Heritage',    image: 'https://picsum.photos/seed/exp-history-rnd/600/800'  },
  { label: 'Hiking',  slug: 'hiking',  desc: 'Trails from Simien to Table Mountain',   image: 'https://picsum.photos/seed/exp-hiking-rnd/600/800'   },
  { label: 'Food',    slug: 'food',    desc: 'Tagines, jollof, nyama choma',           image: 'https://picsum.photos/seed/exp-food-rnd/600/800'     },
]

export function ExperiencesCarousel() {
  const doubled = [...EXPERIENCES, ...EXPERIENCES]

  return (
    <>
      {/* Mobile: infinite auto-scrolling marquee */}
      <div className="lg:hidden marquee-wrap-exp">
        <div className="marquee-track-exp">
          {doubled.map((e, i) => (
            <Link
              key={i}
              href={`/search?q=${encodeURIComponent(e.label)}`}
              className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 shrink-0"
              style={{ width: '155px', aspectRatio: '3/4', display: 'block' }}
            >
              <Image src={e.image} alt={e.label} fill sizes="160px"
                className="object-cover img-editorial img-inner"/>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-display font-bold text-sm text-cream group-hover:text-gold-300 transition-colors leading-tight"
                  style={{ letterSpacing: '-0.01em' }}>{e.label}</h3>
                <p className="font-sans text-[10px] text-cream/55 mt-0.5 leading-tight">{e.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: 6-col grid */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-4">
        {EXPERIENCES.map(e => (
          <Link key={e.slug} href={`/search?q=${encodeURIComponent(e.label)}`}
            className="card-zoom group relative rounded-2xl overflow-hidden aspect-[2/3] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500">
            <Image src={e.image} alt={e.label} fill sizes="17vw"
              className="object-cover img-editorial img-inner"/>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-display font-bold text-[13px] text-cream group-hover:text-gold-300 transition-colors leading-tight"
                style={{ letterSpacing: '-0.01em' }}>{e.label}</h3>
              <p className="font-sans text-[10px] text-cream/55 mt-1 leading-tight">{e.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
