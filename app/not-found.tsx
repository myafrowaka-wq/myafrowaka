import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ochre-600 mb-4">404</p>
      <h1 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
        This page doesn&apos;t exist
      </h1>
      <p className="text-charcoal/60 mb-8 text-lg leading-relaxed">
        The page you&apos;re looking for may have moved, or the URL might be incorrect. Try searching for what you need.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="bg-ochre-600 hover:bg-ochre-700 text-cream font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/search"
          className="border border-ochre-300 text-ochre-600 hover:bg-ochre-50 font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-colors"
        >
          Search attractions
        </Link>
      </div>
    </div>
  )
}
