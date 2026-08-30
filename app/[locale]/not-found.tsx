import { Link } from '@/i18n/navigation'

// Session 5.3 — the in-locale 404 (e.g. notFound() called from an
// attraction/event page whose slug doesn't exist while browsing within
// /fr or /pt). Next.js resolves notFound() to the nearest not-found.tsx up
// the tree, so this renders wrapped in [locale]/layout.tsx's Nav/Footer —
// the root app/not-found.tsx below is the rarer fallback for a request
// that doesn't even resolve to a locale segment at all.
// Session 6.3 (WDOS gate run) — same gap as privacy/terms/cities pages: zero
// dark-mode classes anywhere here, on a page whose body genuinely goes dark
// (this renders inside [locale]/layout.tsx's Nav/Footer). charcoal text and
// the unconditional text-ochre-600 both need their dark-mode counterparts —
// see privacy/page.tsx's comment for the ochre-600 contrast math (2.95:1 on
// ink, fixed by the project's existing ochre-400 convention, 5.09:1).
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-ochre-600 dark:text-ochre-400 mb-4">404</p>
        <h1 className="font-display text-5xl md:text-6xl text-charcoal dark-flip-text mb-5 leading-tight">
          This Page<br />Doesn&rsquo;t Exist
        </h1>
        <p className="font-sans text-charcoal/60 dark-flip-muted mb-10 text-lg leading-relaxed max-w-sm mx-auto">
          The page you are looking for may have moved, or the URL may be incorrect.
          Try searching for what you need.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-action hover:bg-action-hover text-cream font-sans text-[14px] uppercase tracking-[0.14em] px-7 py-3.5 rounded-full transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center border border-ochre-300 dark:border-ochre-700 text-ochre-600 dark:text-ochre-400 hover:bg-ochre-50 dark:hover:bg-white/5 font-sans text-[14px] uppercase tracking-[0.14em] px-7 py-3.5 rounded-full transition-colors"
          >
            Search Attractions
          </Link>
        </div>
        <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted uppercase tracking-[0.14em] mt-12">
          africa explained by africans.
        </p>
      </div>
    </div>
  )
}
