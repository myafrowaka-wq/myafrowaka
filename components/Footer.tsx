import Image from 'next/image'
import Link from 'next/link'

const DESTINATIONS = [
  { label: 'East Africa',          href: '/search?region=East+Africa'          },
  { label: 'West Africa',          href: '/search?region=West+Africa'          },
  { label: 'North Africa',         href: '/search?region=North+Africa'         },
  { label: 'Southern Africa',      href: '/search?region=Southern+Africa'      },
  { label: 'Central Africa',       href: '/search?region=Central+Africa'       },
  { label: 'Indian Ocean Islands', href: '/search?region=Indian+Ocean+Islands' },
  { label: 'All Destinations',     href: '/search'                             },
]

const EXPERIENCES = [
  { label: 'Safari Adventures',    href: '/search?q=safari'   },
  { label: 'Cultural Experiences', href: '/search?q=culture'  },
  { label: 'Beach Getaways',       href: '/search?q=beach'    },
  { label: 'Historical Sites',     href: '/search?q=history'  },
  { label: 'Hiking and Nature',    href: '/search?q=hiking'   },
  { label: 'Food and Drink',       href: '/search?q=food'     },
]

const GUIDES = [
  { label: 'Latest Guides',        href: '/search'                                        },
  { label: 'Pyramids of Giza',     href: '/attractions/pyramids-of-giza'                 },
  { label: 'Bwindi Forest',        href: '/attractions/bwindi-impenetrable-national-park' },
  { label: 'Table Mountain',       href: '/attractions/table-mountain'                    },
  { label: 'Serengeti Migration',  href: '/attractions/serengeti-national-park'           },
]

const COMPANY = [
  { label: 'About Us',       href: '/about'   },
  { label: 'Contact Us',     href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms'   },
]

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://instagram.com/myafrowaka_',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@myafrowaka_',
    path: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@myafrowaka',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  {
    label: 'X / Twitter',
    href: '#',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#131009]" role="contentinfo">

      {/* ── Main link grid ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-10">

          {/* Brand — spans 2 cols on md */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-5">
              {/* White logo — no filter needed on dark background */}
              <Image
                src="/logo-white.png"
                alt="MyAfroWaka"
                width={320}
                height={84}
                quality={90}
                className="h-9 w-auto opacity-90"
              />
            </Link>
            <p className="font-sans text-sm text-cream/45 leading-relaxed mb-6 max-w-[220px]">
              The destination for discovering Africa greatest attractions, culture, and travel experiences.
              Verified. Specific. Written from inside the continent.
            </p>

            {/* Social icons */}
            <div className="flex flex-wrap gap-2">
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 bg-white/6 hover:bg-white/12 rounded-full flex items-center justify-center text-cream/40 hover:text-cream transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path}/></svg>
                </a>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/6">
              <a href="mailto:info@myafrowaka.com"
                className="font-mono text-[10px] text-cream/35 hover:text-gold-400 transition-colors">
                info@myafrowaka.com
              </a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/25 mb-4">Destinations</p>
            <ul className="space-y-2.5">
              {DESTINATIONS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm text-cream/45 hover:text-cream/80 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/25 mb-4">Experiences</p>
            <ul className="space-y-2.5">
              {EXPERIENCES.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm text-cream/45 hover:text-cream/80 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/25 mb-4">Top Guides</p>
            <ul className="space-y-2.5">
              {GUIDES.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm text-cream/45 hover:text-cream/80 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-cream/25 mb-4">Company</p>
            <ul className="space-y-2.5">
              {COMPANY.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-sm text-cream/45 hover:text-cream/80 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────── */}
      <div className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-mono text-[10px] text-cream/20 uppercase tracking-[0.1em]">
              &copy; {new Date().getFullYear()} MyAfroWaka. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="font-mono text-[10px] text-cream/20 hover:text-cream/45 transition-colors uppercase tracking-[0.1em]">Privacy</Link>
              <Link href="/terms"   className="font-mono text-[10px] text-cream/20 hover:text-cream/45 transition-colors uppercase tracking-[0.1em]">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
