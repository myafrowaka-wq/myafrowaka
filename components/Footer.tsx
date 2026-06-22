import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream/70 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <p className="font-display text-2xl text-cream mb-2">MyAfroWaka</p>
            <p className="font-mono text-xs uppercase tracking-widest text-ochre-400 mb-3">
              Africa explained by Africans.
            </p>
            <p className="text-sm text-cream/50 leading-relaxed max-w-xs">
              The leading destination for discovering Africa's greatest attractions, culture, and travel experiences.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-cream/30 mb-4">Explore</p>
            <ul className="space-y-2">
              {[
                { label: 'All Destinations', href: '/search' },
                { label: 'East Africa', href: '/search?region=East+Africa' },
                { label: 'West Africa', href: '/search?region=West+Africa' },
                { label: 'Southern Africa', href: '/search?region=Southern+Africa' },
                { label: 'North Africa', href: '/search?region=North+Africa' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/60 hover:text-ochre-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-cream/30 mb-4">Company</p>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Use', href: '/terms' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/60 hover:text-ochre-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="font-mono text-xs text-cream/30">
            © {new Date().getFullYear()} MyAfroWaka. All rights reserved.
          </p>
          <p className="font-mono text-xs text-cream/20">
            Abuja, Nigeria · myafrowaka@gmail.com
          </p>
        </div>
      </div>
    </footer>
  )
}
