import Link from 'next/link'

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-2">Dashboard</p>
        <h1 className="font-display font-extrabold text-charcoal dark-flip-text"
          style={{ fontSize: 'clamp(22px, 3vw, 34px)', letterSpacing: '-0.02em' }}>
          Trip Planner
        </h1>
      </div>

      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-crimson/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </div>
        <p className="font-display font-bold text-[17px] text-charcoal dark-flip-text mb-2" style={{ letterSpacing: '-0.01em' }}>
          Trip Planner is coming.
        </p>
        <p className="font-sans text-[13px] text-charcoal/45 dark-flip-muted mb-6 max-w-sm mx-auto leading-relaxed">
          Build multi-destination Africa itineraries, set dates, add notes, and share your plan. Coming in the next update.
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/25 dark-flip-muted mb-6">
          In the meantime — save attractions to your list.
        </p>
        <Link href="/dashboard/saved"
          className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson/90 text-cream font-display font-bold text-[11px] uppercase tracking-[0.1em] px-6 py-3 rounded-full transition-all">
          View Saved Attractions
        </Link>
      </div>
    </div>
  )
}
