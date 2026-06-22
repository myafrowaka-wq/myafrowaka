import Link from 'next/link'

export default function Nav() {
  return (
    <header className="border-b border-sand bg-cream/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link href="/" className="font-display text-xl text-charcoal hover:text-ochre-600 transition-colors shrink-0">
          MyAfroWaka
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/search" className="font-mono text-xs uppercase tracking-widest text-charcoal/60 hover:text-ochre-600 transition-colors">
            Destinations
          </Link>
          <Link href="/search?region=East+Africa" className="font-mono text-xs uppercase tracking-widest text-charcoal/60 hover:text-ochre-600 transition-colors">
            East Africa
          </Link>
          <Link href="/search?region=West+Africa" className="font-mono text-xs uppercase tracking-widest text-charcoal/60 hover:text-ochre-600 transition-colors">
            West Africa
          </Link>
          <Link href="/search?region=Southern+Africa" className="font-mono text-xs uppercase tracking-widest text-charcoal/60 hover:text-ochre-600 transition-colors">
            Southern Africa
          </Link>
          <Link href="/about" className="font-mono text-xs uppercase tracking-widest text-charcoal/60 hover:text-ochre-600 transition-colors">
            About
          </Link>
        </nav>

        {/* Search CTA */}
        <Link href="/search" className="shrink-0 bg-ochre-600 hover:bg-ochre-700 text-cream text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full transition-colors">
          Search
        </Link>
      </div>
    </header>
  )
}
