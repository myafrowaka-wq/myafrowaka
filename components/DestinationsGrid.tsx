'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Country = {
  name: string; slug: string; region: string
  flag: string; color: string; image: string
}

const ALL_COUNTRIES: Country[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',         flag: '🇪🇬', color: '#A22E29', image: 'https://picsum.photos/seed/egypt-dest-rnd/600/800'        },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',          flag: '🇰🇪', color: '#3F6A3D', image: 'https://picsum.photos/seed/kenya-dest-rnd/600/800'        },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa',      flag: '🇿🇦', color: '#29251A', image: 'https://picsum.photos/seed/capetown-dest-rnd/600/800'    },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',          flag: '🇹🇿', color: '#B28E38', image: 'https://picsum.photos/seed/tanzania-dest-rnd/600/800'    },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',         flag: '🇲🇦', color: '#8C4A28', image: 'https://picsum.photos/seed/morocco-dest-rnd/600/800'     },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',          flag: '🇬🇭', color: '#B55D39', image: 'https://picsum.photos/seed/ghana-dest-rnd/600/800'       },
  { name: 'Nigeria',      slug: 'nigeria',      region: 'West Africa',          flag: '🇳🇬', color: '#3B7A5E', image: 'https://picsum.photos/seed/nigeria-dest-rnd/600/800'     },
  { name: 'Rwanda',       slug: 'rwanda',       region: 'East Africa',          flag: '🇷🇼', color: '#2D6B50', image: 'https://picsum.photos/seed/rwanda-dest-rnd/600/800'      },
  { name: 'Ethiopia',     slug: 'ethiopia',     region: 'East Africa',          flag: '🇪🇹', color: '#2D5A29', image: 'https://picsum.photos/seed/ethiopia-dest-rnd/600/800'    },
  { name: 'Uganda',       slug: 'uganda',       region: 'East Africa',          flag: '🇺🇬', color: '#3F6A3D', image: 'https://picsum.photos/seed/uganda-dest-rnd/600/800'      },
  { name: 'Senegal',      slug: 'senegal',      region: 'West Africa',          flag: '🇸🇳', color: '#B55D39', image: 'https://picsum.photos/seed/senegal-dest-rnd/600/800'     },
  { name: 'Zimbabwe',     slug: 'zimbabwe',     region: 'Southern Africa',      flag: '🇿🇼', color: '#29251A', image: 'https://picsum.photos/seed/zimbabwe-dest-rnd/600/800'    },
  { name: 'Namibia',      slug: 'namibia',      region: 'Southern Africa',      flag: '🇳🇦', color: '#8C6A28', image: 'https://picsum.photos/seed/namibia-dest-rnd/600/800'     },
  { name: 'Botswana',     slug: 'botswana',     region: 'Southern Africa',      flag: '🇧🇼', color: '#4A3218', image: 'https://picsum.photos/seed/botswana-dest-rnd/600/800'    },
  { name: 'Madagascar',   slug: 'madagascar',   region: 'Indian Ocean Islands', flag: '🇲🇬', color: '#3B403E', image: 'https://picsum.photos/seed/madagascar-dest-rnd/600/800'  },
  { name: 'Tunisia',      slug: 'tunisia',      region: 'North Africa',         flag: '🇹🇳', color: '#A22E29', image: 'https://picsum.photos/seed/tunisia-dest-rnd/600/800'     },
  { name: 'Ivory Coast',  slug: 'ivory-coast',  region: 'West Africa',          flag: '🇨🇮', color: '#B55D39', image: 'https://picsum.photos/seed/ivorycoast-dest-rnd/600/800'  },
  { name: 'Mozambique',   slug: 'mozambique',   region: 'East Africa',          flag: '🇲🇿', color: '#3B6E58', image: 'https://picsum.photos/seed/mozambique-dest-rnd/600/800'  },
  { name: 'Zambia',       slug: 'zambia',       region: 'Southern Africa',      flag: '🇿🇲', color: '#5A3A1A', image: 'https://picsum.photos/seed/zambia-dest-rnd/600/800'      },
  { name: 'Mauritius',    slug: 'mauritius',    region: 'Indian Ocean Islands', flag: '🇲🇺', color: '#2E5B6E', image: 'https://picsum.photos/seed/mauritius-dest-rnd/600/800'   },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function CountryCard({ d }: { d: Country }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500"
      style={{ aspectRatio: '3/4' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
      <Image
        src={d.image} alt={d.name} fill
        sizes="(max-width:1024px) 50vw, 17vw"
        className="object-cover img-editorial mix-blend-multiply opacity-60 img-inner"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-mono text-[7px] lg:text-[8px] uppercase tracking-[0.12em] text-cream/55 mb-1">
          {d.flag} {d.region}
        </p>
        <h3
          className="font-display font-bold text-cream group-hover:text-gold-300 transition-colors leading-tight text-sm lg:text-[13px]"
          style={{ letterSpacing: '-0.015em' }}
        >
          {d.name}
        </h3>
      </div>
    </Link>
  )
}

export function DestinationsGrid() {
  const [countries, setCountries] = useState<Country[]>(ALL_COUNTRIES.slice(0, 6))
  const [ready, setReady]         = useState(false)
  const [idx, setIdx]             = useState(0)

  useEffect(() => {
    setCountries(shuffle(ALL_COUNTRIES).slice(0, 6))
    setReady(true)
  }, [])

  const visibleOnMobile = 2
  const maxIdx          = countries.length - visibleOnMobile

  function prev() { setIdx(i => Math.max(0, i - 1)) }
  function next() { setIdx(i => Math.min(maxIdx, i + 1)) }

  return (
    <div className={`transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>

      {/* Mobile: carousel showing 2 at a time */}
      <div className="lg:hidden">
        <div className="overflow-hidden">
          <div
            className="flex gap-3 transition-transform duration-300"
            style={{ transform: `translateX(calc(-${idx} * (50% + 6px)))` }}
          >
            {countries.map(d => (
              <div key={d.name} className="shrink-0" style={{ width: 'calc(50% - 6px)' }}>
                <CountryCard d={d} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <button onClick={prev} disabled={idx === 0} aria-label="Previous destinations"
            className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/40 dark-flip-muted disabled:opacity-30 hover:border-crimson hover:text-crimson transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: maxIdx + 1 }, (_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-crimson w-4' : 'bg-charcoal/20 dark:bg-cream/20 w-1.5'}`}/>
            ))}
          </div>

          <button onClick={next} disabled={idx === maxIdx} aria-label="Next destinations"
            className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/40 dark-flip-muted disabled:opacity-30 hover:border-crimson hover:text-crimson transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop: unchanged 6-col grid */}
      <div className="hidden lg:grid lg:grid-cols-6 gap-4">
        {countries.map(d => <CountryCard key={d.name} d={d}/>)}
      </div>
    </div>
  )
}
