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

export function DestinationsGrid() {
  const [countries, setCountries] = useState<Country[]>(ALL_COUNTRIES.slice(0, 6))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setCountries(shuffle(ALL_COUNTRIES).slice(0, 6))
    setReady(true)
  }, [])

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}>
      {countries.map(d => (
        <Link
          key={d.name}
          href={`/destinations/${d.slug}`}
          className="card-zoom group relative rounded-2xl overflow-hidden aspect-[3/4] lg:aspect-[2/3] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500"
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
      ))}
    </div>
  )
}
