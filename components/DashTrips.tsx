'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Flag } from '@/components/Flag'

// Session 4.2 — rebuilt for the real day-by-day itinerary (see
// sanity/schemaTypes/savedTrip.ts and app/api/user/trips/route.ts). The
// old shape (destination string, travelers, budget, interests) is gone —
// zero real savedTrip documents existed under it, confirmed directly
// against the dataset before rebuilding, so there was nothing to migrate.

interface TripItem { kind: 'attraction' | 'event'; name?: string; slug?: string; note?: string }
interface TripDay { date?: string; items?: TripItem[] }
interface Trip {
  _id: string
  name: string
  country?: { name: string; slug: string; countryCode?: string } | null
  dates?: { from?: string; to?: string }
  days?: TripDay[]
  updatedAt?: string
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function DashTrips() {
  const [trips, setTrips]       = useState<Trip[]>([])
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

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
      {trips.map(trip => {
        const days = (trip.days ?? []).filter(d => (d.items?.length ?? 0) > 0)
        const totalItems = days.reduce((n, d) => n + (d.items?.length ?? 0), 0)
        const isOpen = expanded === trip._id

        return (
          <div key={trip._id}
            className="bg-cream dark-flip-card border border-line dark-flip-border rounded-2xl overflow-hidden hover:border-gold-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all sm:col-span-1">

            <div className="bg-ink px-5 py-4 flex items-center gap-2.5">
              <Flag code={trip.country?.countryCode} />
              <div className="min-w-0">
                <p className="font-sans text-[14px] uppercase tracking-[0.2em] text-gold-400/80 mb-0.5">{trip.country?.name}</p>
                <p className="font-display font-bold text-cream truncate"
                  style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', letterSpacing: '-0.012em' }}>
                  {trip.name}
                </p>
              </div>
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

              <p className="font-sans text-[14px] text-charcoal/45 dark-flip-muted">
                {totalItems > 0
                  ? `${totalItems} item${totalItems !== 1 ? 's' : ''} across ${days.length} day${days.length !== 1 ? 's' : ''}`
                  : 'No items added yet'}
              </p>

              {days.length > 0 && (
                <button type="button" onClick={() => setExpanded(isOpen ? null : trip._id)}
                  className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
                  {isOpen ? 'Hide itinerary' : 'View itinerary'}
                </button>
              )}

              {isOpen && (
                <div className="pt-2 space-y-3 border-t border-line dark-flip-border mt-2">
                  {days.map((day, i) => (
                    <div key={day.date ?? i}>
                      <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-1">
                        {formatDate(day.date)}
                      </p>
                      <ul className="space-y-1">
                        {(day.items ?? []).map((item, j) => (
                          <li key={j} className="font-sans text-[14px] text-charcoal/55 dark-flip-muted flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-charcoal/25 dark-flip-muted shrink-0"/>
                            {item.slug ? (
                              <Link href={item.kind === 'event' ? `/events/${item.slug}` : `/attractions/${item.slug}`}
                                className="hover:text-crimson transition-colors truncate">
                                {item.name ?? 'Untitled'}
                              </Link>
                            ) : (
                              <span className="truncate">{item.name ?? 'Untitled'}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-line dark-flip-border mt-3">
                <Link href={trip.country ? `/destinations/${trip.country.slug}` : '/search'}
                  className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
                  Country guide &#8594;
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
        )
      })}
    </div>
  )
}
