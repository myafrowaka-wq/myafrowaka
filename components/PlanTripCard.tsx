'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { SearchTypeahead } from '@/components/SearchTypeahead'
import type { Suggestion } from '@/lib/searchIndex'

// Session 4.2 — this used to open an auth-gate modal ("Create a free
// account...") the moment someone typed a destination, before they'd seen
// anything — a direct contradiction of the decided spec in the plan ("no
// sign-up wall at the front door... let them build the trip first, feel
// the value"). Now it sends them straight into the real planner
// (app/plan-a-trip), which is itself fully usable while signed out; the
// wall only shows up later, on "Save this trip".
export function PlanTripCard() {
  const router = useRouter()
  const [dest, setDest] = useState('')

  function handleFind(e: React.FormEvent) {
    e.preventDefault()
    const params = dest.trim() ? `?country=${encodeURIComponent(dest.trim())}` : ''
    router.push(`/plan-a-trip${params}`)
  }

  return (
    <div className="bg-white/96 backdrop-blur-sm rounded-3xl p-7 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
      <p className="font-display font-bold text-[26px] text-charcoal/85 mb-5" style={{ letterSpacing: '-0.012em' }}>
        Plan Your Trip
      </p>

      <form onSubmit={handleFind} className="space-y-0">
        <div className="mb-5 relative">
          <label htmlFor="plan-trip-dest" className="font-sans text-[14px] font-semibold text-charcoal/65 block mb-1.5">Where to?</label>
          <SearchTypeahead
            id="plan-trip-dest"
            value={dest}
            onChange={setDest}
            placeholder="Egypt, Kenya, Morocco..."
            className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold-400 transition-colors bg-cream/40"
            kinds={['country']}
            resolveHref={(s: Suggestion) => `/plan-a-trip?country=${encodeURIComponent(s.name)}`}
          />
        </div>

        <button
          type="submit"
          className="block w-full text-center bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Planning
        </button>
      </form>

      {/* Session 6.3 (WDOS Human Pass, X-30/X-31 — the two gates with no
          override, ever) — this used to be "4.6k+ travellers exploring
          Africa with intention" next to 4 stock photos of unrelated
          people, implying real social proof neither of which existed: no
          analytics or user-count tracking runs anywhere on this site (see
          the WDOS Performance/SEO gate notes on that), and the photos
          were generic stock images, not real MyAfroWaka travellers.
          Flagged back in Session 2.4 as a known gap and never fixed until
          now. Replaced with something honest: what's actually true about
          using the planner, not a number nobody can back up. */}
      <p className="mt-5 pt-4 border-t border-line font-sans text-[14px] text-charcoal/65 leading-snug">
        Free to plan. No account needed to start.
      </p>
    </div>
  )
}
