'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Trip {
  _id: string
  destination: string
  dates?: { from?: string; to?: string }
  travelers?: string
  budget?: string
  interests?: string[]
  savedAt: string
}

const TRAVELER_LABELS: Record<string, string> = {
  solo:   'Solo',
  couple: 'Couple',
  small:  'Small group (3–5)',
  large:  'Large group (6+)',
  family: 'Family with children',
}

const BUDGET_LABELS: Record<string, string> = {
  budget:  'Budget (under $500)',
  mid:     'Mid-range ($500–$2,000)',
  comfort: 'Comfortable ($2,000–$5,000)',
  luxury:  'Luxury ($5,000+)',
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function DashTrips() {
  const [trips, setTrips]       = useState<Trip[]>([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/user/trips')
      .then(r => r.json())
      .then(data => { setTrips(data.trips ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function deleteTrip(id: string) {
    setDeleting(id)
    const res = await fetch('/api/user/trips', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) setTrips(prev => prev.filter(t => t._id !== id))
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl p-5 animate-pulse h-40"/>
        ))}
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="border border-dashed border-line dark-flip-border rounded-2xl p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mx-auto mb-4 text-gold-600 dark:text-gold-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
        </div>
        <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-1.5">
          No trips planned yet
        </p>
        <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted mb-5 max-w-xs mx-auto leading-relaxed">
          Use the trip planner to map out your next African adventure. Saved plans appear here.
        </p>
        <Link href="/plan-a-trip"
          className="inline-flex items-center gap-2 bg-ink hover:bg-charcoal text-cream font-sans text-[14px] uppercase tracking-[0.14em] px-5 py-2.5 rounded-full transition-colors">
          Plan a Trip
        </Link>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {trips.map(trip => (
        <div key={trip._id}
          className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl overflow-hidden hover:border-gold-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all">

          {/* Header bar */}
          <div className="bg-ink px-5 py-4">
            <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400/80 mb-1">Planned Trip</p>
            <p className="font-display font-bold text-cream"
              style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', letterSpacing: '-0.012em' }}>
              {trip.destination}
            </p>
          </div>

          <div className="p-5 space-y-2.5">
            {(trip.dates?.from || trip.dates?.to) && (
              <div className="flex items-start gap-2.5">
                <svg className="w-3.5 h-3.5 text-charcoal/25 dark-flip-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span className="font-sans text-[14px] text-charcoal/65 dark-flip-muted">
                  {[formatDate(trip.dates?.from), formatDate(trip.dates?.to)].filter(Boolean).join(' to ')}
                </span>
              </div>
            )}
            {trip.travelers && (
              <div className="flex items-start gap-2.5">
                <svg className="w-3.5 h-3.5 text-charcoal/25 dark-flip-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="font-sans text-[14px] text-charcoal/65 dark-flip-muted">
                  {TRAVELER_LABELS[trip.travelers] ?? trip.travelers}
                </span>
              </div>
            )}
            {trip.budget && (
              <div className="flex items-start gap-2.5">
                <svg className="w-3.5 h-3.5 text-charcoal/25 dark-flip-muted shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-sans text-[14px] text-charcoal/65 dark-flip-muted">
                  {BUDGET_LABELS[trip.budget] ?? trip.budget}
                </span>
              </div>
            )}
            {trip.interests && trip.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {trip.interests.map(i => (
                  <span key={i} className="font-sans text-[14px] uppercase tracking-[0.12em] bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 px-2.5 py-0.5 rounded-full">
                    {i}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-line dark-flip-border mt-3">
              <Link href={`/search?q=${encodeURIComponent(trip.destination)}`}
                className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
                Find attractions &#8594;
              </Link>
              <button
                onClick={() => deleteTrip(trip._id)}
                disabled={deleting === trip._id}
                className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/55 hover:text-crimson transition-colors disabled:opacity-40">
                {deleting === trip._id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
