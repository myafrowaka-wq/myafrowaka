import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ochre-600 mb-4">404</p>
        <h1 className="font-display text-5xl md:text-6xl text-charcoal mb-5 leading-tight">
          This Page<br />Doesn&rsquo;t Exist
        </h1>
        <p className="font-sans text-charcoal/60 mb-10 text-lg leading-relaxed max-w-sm mx-auto">
          The page you are looking for may have moved, or the URL may be incorrect.
          Try searching for what you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-crimson hover:bg-crimson-600 text-cream font-mono text-[11px] uppercase tracking-[0.14em] px-7 py-3.5 rounded-full transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center border border-ochre-300 text-ochre-600 hover:bg-ochre-50 font-mono text-[11px] uppercase tracking-[0.14em] px-7 py-3.5 rounded-full transition-colors"
          >
            Search Attractions
          </Link>
        </div>
        <p className="font-mono text-[10px] text-charcoal/25 uppercase tracking-[0.14em] mt-12">
          africa explained by africans.
        </p>
      </div>
    </div>
  )
}
