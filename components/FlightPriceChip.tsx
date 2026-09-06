'use client'
import { useState } from 'react'

interface Result {
  available: boolean
  price?: number
  airline?: string
  departDate?: string
}

// Batch 3 — "suggested airlines and the cheapest rate" from the owner's
// trip-journey walkthrough. Real flight pricing needs a Travelpayouts
// account (see lib/flightPricing.ts's comment for why that's an owner
// action, not something Claude can sign up for). This component is built
// to work the moment that account exists: it always collects a real
// origin airport and calls the real API route, and simply shows an
// honest "not available yet" state for as long as no token is configured
// — never a fabricated price. Matches the same graceful-degradation
// pattern as the "Coming Soon" / "In Development" states already used on
// the dashboard (app/[locale]/user-dashboard/page.tsx).
export function FlightPriceChip({ destinationIATA, destinationName }: { destinationIATA?: string; destinationName: string }) {
  const [origin, setOrigin] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [checked, setChecked] = useState(false)

  async function check() {
    const code = origin.trim().toUpperCase()
    if (code.length !== 3 || !destinationIATA) return
    setLoading(true)
    setChecked(true)
    try {
      const res = await fetch(`/api/flights/cheapest?origin=${code}&destination=${destinationIATA}`)
      const data = await res.json() as Result
      setResult(data)
    } catch {
      setResult({ available: false })
    } finally {
      setLoading(false)
    }
  }

  if (!destinationIATA) return null

  return (
    <div className="border border-line dark-flip-border rounded-3xl p-6">
      <h3 className="font-display font-bold text-[15px] text-charcoal dark-flip-text mb-1">Flights to {destinationName}</h3>

      {!checked || !result ? (
        <>
          <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted mb-4 leading-relaxed">
            Type where you&apos;re flying from to check the cheapest fare we can find.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={origin}
              onChange={e => setOrigin(e.target.value.slice(0, 3))}
              onKeyDown={e => { if (e.key === 'Enter') check() }}
              placeholder="e.g. LOS"
              maxLength={3}
              className="w-24 font-sans text-[14px] uppercase px-3 py-2 rounded-lg border border-line dark-flip-border bg-transparent text-charcoal dark-flip-text placeholder-charcoal/40 focus:outline-none focus:border-crimson"
            />
            <button
              type="button"
              onClick={check}
              disabled={origin.trim().length !== 3 || loading}
              className="font-sans text-[14px] font-semibold uppercase tracking-[0.08em] text-cream bg-crimson px-4 py-2 rounded-lg hover:bg-crimson/90 disabled:opacity-40 transition-colors"
            >
              {loading ? 'Checking...' : 'Check fare'}
            </button>
          </div>
        </>
      ) : result.available ? (
        <div>
          <p className="font-display font-extrabold text-charcoal dark-flip-text" style={{ fontSize: 'clamp(22px, 2.5vw, 28px)' }}>
            From ${result.price}
          </p>
          <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted mt-1">
            {result.airline} · cheapest fare found for {origin.toUpperCase()} → {destinationIATA}
          </p>
        </div>
      ) : (
        <div>
          <p className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/55 dark-flip-muted bg-charcoal/6 dark-flip-surf inline-block px-3 py-1.5 rounded-full mb-2">
            Not available yet
          </p>
          <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-relaxed">
            Live fare checking is still being connected. In the meantime, search {origin.toUpperCase() || 'your city'} to {destinationIATA} directly on your usual flight search site.
          </p>
        </div>
      )}
    </div>
  )
}
