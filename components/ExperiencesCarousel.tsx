import Image from 'next/image'
import Link from 'next/link'
import { stockImage } from '@/lib/stockImageCredits'

const EXPERIENCES = [
  { label: 'Safari',  slug: 'safari',  desc: 'The Big Five and beyond',               image: stockImage('1741850820849-1b63a5911606')  },
  { label: 'Culture', slug: 'culture', desc: 'Living traditions across the continent', image: stockImage('1597212618440-806262de4f6b')  },
  { label: 'Beach',   slug: 'beach',   desc: 'Indian Ocean and Atlantic shores',       image: stockImage('1577455486223-089171b4572f')  },
  { label: 'History', slug: 'history', desc: 'Ancient kingdoms and World Heritage',    image: stockImage('1640005438758-861043e64aa5')  },
  { label: 'Hiking',  slug: 'hiking',  desc: 'Trails from Simien to Table Mountain',   image: stockImage('1563985336376-568060942b80')  },
  { label: 'Food',    slug: 'food',    desc: 'Tagines, jollof, nyama choma',           image: stockImage('1664992960082-0ea299a9c53e')  },
]

export function ExperiencesCarousel() {
  return (
    <>
      {/* Mobile: static 2-col grid */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        {EXPERIENCES.map(e => (
          <Link
            key={e.slug}
            href={`/search?q=${encodeURIComponent(e.label)}`}
            className="card-zoom group relative rounded-2xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500"
            style={{ aspectRatio: '3/4', display: 'block' }}
          >
            <Image src={e.image} alt={e.label} fill sizes="50vw"
              className="object-cover img-editorial img-inner"/>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/25 to-transparent"/>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="font-display font-bold text-sm text-cream group-hover:text-gold-300 transition-colors leading-tight"
                style={{ letterSpacing: '-0.01em' }}>{e.label}</h3>
              <p className="font-sans text-[14px] text-cream/70 mt-0.5 leading-tight">{e.desc}</p>
            </div>
          </Link>
        ))}
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
              <h3 className="font-display font-bold text-[15px] text-cream group-hover:text-gold-300 transition-colors leading-tight"
                style={{ letterSpacing: '-0.01em' }}>{e.label}</h3>
              <p className="font-sans text-[14px] text-cream/70 mt-1 leading-tight">{e.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
