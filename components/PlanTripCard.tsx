'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export function PlanTripCard() {
  const [showModal, setShowModal] = useState(false)
  const [dest, setDest] = useState('')
  const [tripType, setTripType] = useState('')
  const [month, setMonth] = useState('Jan')
  const [duration, setDuration] = useState('1 week')

  function handleFind(e: React.FormEvent) {
    e.preventDefault()
    setShowModal(true)
  }

  return (
    <>
      <div className="bg-white/96 backdrop-blur-sm rounded-3xl p-7 shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
        <p className="font-display font-bold text-[16px] text-charcoal/85 mb-5" style={{ letterSpacing: '-0.012em' }}>
          Plan Your Trip
        </p>

        <form onSubmit={handleFind} className="space-y-0">
          <div className="mb-4">
            <label className="font-sans text-[11px] font-semibold text-charcoal/65 block mb-1.5">Where to?</label>
            <input
              type="text"
              value={dest}
              onChange={e => setDest(e.target.value)}
              placeholder="Egypt, Kenya, Morocco..."
              className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold-400 transition-colors bg-cream/40"
            />
          </div>
          <div className="mb-4">
            <label className="font-sans text-[11px] font-semibold text-charcoal/65 block mb-1.5">Type of trip</label>
            <input
              type="text"
              value={tripType}
              onChange={e => setTripType(e.target.value)}
              placeholder="Safari, beach, cultural..."
              className="w-full border border-line rounded-xl px-4 py-3 text-sm font-sans text-charcoal placeholder-charcoal/30 focus:outline-none focus:border-gold-400 transition-colors bg-cream/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="font-sans text-[11px] font-semibold text-charcoal/65 block mb-1.5">Month</label>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full border border-line rounded-xl px-3 py-3 text-sm font-sans text-charcoal/80 bg-cream/40 focus:outline-none focus:border-gold-400 appearance-none"
              >
                {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="font-sans text-[11px] font-semibold text-charcoal/65 block mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full border border-line rounded-xl px-3 py-3 text-sm font-sans text-charcoal/80 bg-cream/40 focus:outline-none focus:border-gold-400 appearance-none"
              >
                {['3-5 days','1 week','2 weeks','3+ weeks'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="block w-full text-center bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Find My Destination
          </button>
        </form>

        {/* Traveller social proof — larger avatars, bolder count */}
        <div className="mt-5 pt-4 border-t border-line flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-sand shadow-sm">
                <Image
                  src={`https://picsum.photos/seed/traveller-avatar-${n}/72/72`}
                  alt="" width={36} height={36} className="object-cover"/>
              </div>
            ))}
          </div>
          <p className="font-sans text-[13px] text-charcoal/55 leading-snug">
            <strong className="font-bold text-charcoal/80 text-[14px]">Travellers</strong>
            <span className="block text-[11px]">exploring Africa with intention</span>
          </p>
        </div>
      </div>

      {/* Auth gate modal */}
      {showModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm"/>
          <div
            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-[0_32px_80px_rgba(0,0,0,0.5)] popup-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sand hover:bg-line flex items-center justify-center text-charcoal/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <div className="w-12 h-12 bg-ochre-50 rounded-2xl flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-ochre-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
            </div>

            <h3 className="font-display font-bold text-2xl text-charcoal mb-2 leading-snug">
              Your personalised itinerary awaits.
            </h3>
            <p className="font-sans text-sm text-charcoal/60 leading-relaxed mb-6">
              Create a free account to get a custom day-by-day itinerary for{dest ? ` ${dest}` : ' your destination'}, complete with verified attraction recommendations and proximity-based scheduling.
            </p>

            <div className="space-y-3">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full bg-ink text-cream font-display font-bold text-[13px] py-3.5 rounded-xl transition-all hover:bg-charcoal hover:scale-[1.01]"
              >
                Sign in to plan your trip
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </Link>
              <Link
                href="/login?tab=signup"
                className="flex items-center justify-center w-full border border-line text-charcoal/70 hover:text-charcoal font-display font-semibold text-[13px] py-3.5 rounded-xl transition-all hover:border-charcoal/35"
              >
                Create a free account
              </Link>
            </div>

            <p className="font-mono text-[9px] text-charcoal/25 text-center mt-5">
              Free forever. No credit card required.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
