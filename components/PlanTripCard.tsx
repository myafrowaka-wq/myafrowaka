'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { stockImage } from '@/lib/stockImageCredits'

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
      <p className="font-display font-bold text-[16px] text-charcoal/85 mb-5" style={{ letterSpacing: '-0.012em' }}>
        Plan Your Trip
      </p>

      <form onSubmit={handleFind} className="space-y-0">
        <div className="mb-5">
          <label className="font-sans text-[14px] font-semibold text-charcoal/65 block mb-1.5">Where to?</label>
          <input
            type="text"
            value={dest}
            onChange={e => setDest(e.target.value)}
            placeholder="Egypt, Kenya, Morocco..."
            className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold-400 transition-colors bg-cream/40"
          />
        </div>

        <button
          type="submit"
          className="block w-full text-center bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Planning
        </button>
      </form>

      {/* Traveller social proof — larger avatars, bolder count */}
      <div className="mt-5 pt-4 border-t border-line flex items-center gap-3">
        <div className="flex -space-x-2.5">
          {[
            stockImage('1518882570151-157128e78fa1'),
            stockImage('1573497019418-b400bb3ab074'),
            stockImage('1713845784497-fe3d7ed176d8'),
            stockImage('1593351799227-75df2026356b'),
          ].map((src, i) => (
            <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-sand shadow-sm">
              <Image src={src} alt="" width={36} height={36} className="object-cover"/>
            </div>
          ))}
        </div>
        <p className="font-sans text-[14px] text-charcoal/55 leading-snug">
          <strong className="font-bold text-charcoal/80 text-[14px]">4.6k+</strong>
          <span className="block text-[14px]">travellers exploring Africa with intention</span>
        </p>
      </div>
    </div>
  )
}
