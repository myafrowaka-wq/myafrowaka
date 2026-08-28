import Image from 'next/image'
import Link from 'next/link'
import { COUNTRY_COLOR } from '@/lib/regionColors'

type Country = {
  name: string; slug: string; region: string; flag: string; color: string; image: string
}

const ALL_COUNTRIES: Country[] = [
  { name: 'Egypt',        slug: 'egypt',        region: 'North Africa',         flag: '\u{1F1EA}\u{1F1EC}', color: COUNTRY_COLOR['Egypt'], image: 'https://images.unsplash.com/photo-1640005438758-861043e64aa5?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Kenya',        slug: 'kenya',        region: 'East Africa',          flag: '\u{1F1F0}\u{1F1EA}', color: COUNTRY_COLOR['Kenya'], image: 'https://images.unsplash.com/photo-1531872036218-4e8a6828e339?auto=format&fit=crop&w=600&q=80'  },
  { name: 'South Africa', slug: 'south-africa', region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1E6}', color: COUNTRY_COLOR['South Africa'], image: 'https://images.unsplash.com/photo-1744604030401-b24c5975a574?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Tanzania',     slug: 'tanzania',     region: 'East Africa',          flag: '\u{1F1F9}\u{1F1FF}', color: COUNTRY_COLOR['Tanzania'], image: 'https://images.unsplash.com/photo-1635865897833-38bc0f8aee44?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Morocco',      slug: 'morocco',      region: 'North Africa',         flag: '\u{1F1F2}\u{1F1E6}', color: COUNTRY_COLOR['Morocco'], image: 'https://images.unsplash.com/photo-1760681554227-d7aad73cd57f?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ghana',        slug: 'ghana',        region: 'West Africa',          flag: '\u{1F1EC}\u{1F1ED}', color: COUNTRY_COLOR['Ghana'], image: 'https://images.unsplash.com/photo-1727023663928-1772e2c7e679?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Nigeria',      slug: 'nigeria',      region: 'West Africa',          flag: '\u{1F1F3}\u{1F1EC}', color: COUNTRY_COLOR['Nigeria'], image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Rwanda',       slug: 'rwanda',       region: 'East Africa',          flag: '\u{1F1F7}\u{1F1FC}', color: COUNTRY_COLOR['Rwanda'], image: 'https://images.unsplash.com/photo-1682773083896-95176d8aecf8?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ethiopia',     slug: 'ethiopia',     region: 'East Africa',          flag: '\u{1F1EA}\u{1F1F9}', color: COUNTRY_COLOR['Ethiopia'], image: 'https://images.unsplash.com/photo-1782283849015-df78517d4765?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Uganda',       slug: 'uganda',       region: 'East Africa',          flag: '\u{1F1FA}\u{1F1EC}', color: COUNTRY_COLOR['Uganda'], image: 'https://images.unsplash.com/photo-1614528767034-70de9fe166e0?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Senegal',      slug: 'senegal',      region: 'West Africa',          flag: '\u{1F1F8}\u{1F1F3}', color: COUNTRY_COLOR['Senegal'], image: 'https://images.unsplash.com/photo-1644772088209-c71d5c59f719?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Zimbabwe',     slug: 'zimbabwe',     region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1FC}', color: COUNTRY_COLOR['Zimbabwe'], image: 'https://images.unsplash.com/photo-1618811308896-d279d72fdf4d?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Namibia',      slug: 'namibia',      region: 'Southern Africa',      flag: '\u{1F1F3}\u{1F1E6}', color: COUNTRY_COLOR['Namibia'], image: 'https://images.unsplash.com/photo-1563985336376-568060942b80?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Botswana',     slug: 'botswana',     region: 'Southern Africa',      flag: '\u{1F1E7}\u{1F1FC}', color: COUNTRY_COLOR['Botswana'], image: 'https://images.unsplash.com/photo-1531208853003-c1ec1b8a81d7?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Madagascar',   slug: 'madagascar',   region: 'Indian Ocean Islands', flag: '\u{1F1F2}\u{1F1EC}', color: COUNTRY_COLOR['Madagascar'], image: 'https://images.unsplash.com/photo-1558694440-03ade9215d7b?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Tunisia',      slug: 'tunisia',      region: 'North Africa',         flag: '\u{1F1F9}\u{1F1F3}', color: COUNTRY_COLOR['Tunisia'], image: 'https://images.unsplash.com/photo-1737276812695-a930ae18aec2?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Ivory Coast',  slug: 'ivory-coast',  region: 'West Africa',          flag: '\u{1F1E8}\u{1F1EE}', color: COUNTRY_COLOR['Ivory Coast'], image: 'https://images.unsplash.com/photo-1690975719788-c0cf5b5692de?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Mozambique',   slug: 'mozambique',   region: 'East Africa',          flag: '\u{1F1F2}\u{1F1FF}', color: COUNTRY_COLOR['Mozambique'], image: 'https://images.unsplash.com/photo-1544298903-35eee5a95b4d?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Zambia',       slug: 'zambia',       region: 'Southern Africa',      flag: '\u{1F1FF}\u{1F1F2}', color: COUNTRY_COLOR['Zambia'], image: 'https://images.unsplash.com/photo-1678714001094-ba90abd57fec?auto=format&fit=crop&w=600&q=80'  },
  { name: 'Mauritius',    slug: 'mauritius',    region: 'Indian Ocean Islands', flag: '\u{1F1F2}\u{1F1FA}', color: COUNTRY_COLOR['Mauritius'], image: 'https://images.unsplash.com/photo-1513415277900-a62401e19be4?auto=format&fit=crop&w=600&q=80'  },
]

function CountryCard({ d }: { d: Country }) {
  return (
    <Link
      href={`/destinations/${d.slug}`}
      className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 block w-full"
      style={{ aspectRatio: '3/4' }}
    >
      <div className="absolute inset-0" style={{ backgroundColor: d.color }}/>
      <Image src={d.image} alt={d.name} fill
        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 17vw"
        className="object-cover img-editorial mix-blend-multiply opacity-60 img-inner"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent"/>
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        <p className="font-sans text-[14px] lg:text-[14px] uppercase tracking-[0.12em] text-cream/55 mb-1">
          {d.flag} {d.region}
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

// Static, no-JS grid — replaces a mouse-driven mobile auto-carousel and a
// desktop CSS marquee (both banned: M-09 auto-advance, M-05 marquee).
export function DestinationsGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
      {ALL_COUNTRIES.map(d => (
        <CountryCard key={d.slug} d={d} />
      ))}
    </div>
  )
}
