'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Link, useRouter } from '@/i18n/navigation'
import { Flag } from '@/components/Flag'
import { eventDateDisplay } from '@/lib/eventDateDisplay'
import { eventOverlapsRange } from '@/lib/eventFilters'
import { EVENT_CATEGORY_COLOR, EVENT_CATEGORY_COLOR_FALLBACK } from '@/lib/regionColors'
import type { MapPin } from '@/components/ItineraryMap'

// Batch 4 — Leaflet touches `window` on load, so it can never render on
// the server; ssr:false is required here, not just a performance choice.
const ItineraryMap = dynamic(() => import('@/components/ItineraryMap').then(m => m.ItineraryMap), { ssr: false })
import {
  loadTripDraft, saveTripDraft, clearTripDraft, dateRange,
  EMPTY_DRAFT, type TripDraft, type TripDraftItem,
} from '@/lib/tripStorage'
import { AffiliateLinkList, type AffiliateLinkData } from '@/components/AffiliateLinkList'
import { FlightPriceChip } from '@/components/FlightPriceChip'

// Session 4.2 — the real trip planner. Fully usable while signed out: every
// change is written straight to localStorage (lib/tripStorage.ts), so
// there is nothing to lose. The only wall is "Save this trip" — clicking
// it while signed out sends the visitor to /login?next=/plan-a-trip and
// leaves the draft untouched, so it's exactly where they left it when they
// come back signed in.

export interface PlannerCountry {
  name: string; slug: string; countryCode?: string; continentRegion?: string
  overview?: string; whenToGo?: string; knownFor?: string
  affiliateLinks?: AffiliateLinkData[]
  nearestAirportIATA?: string
}
export interface PlannerAttraction {
  name: string; slug: string; type?: string[]; editorialSummary?: string
  latitude?: number; longitude?: number
  country?: { name: string; slug: string; countryCode?: string } | null
  city?: { name: string } | null
}
export interface PlannerEvent {
  name: string; slug: string; category?: string
  dateType?: string; startDate?: string; endDate?: string
  estimatedTiming?: string; verificationStatus?: string
  country?: { name: string; slug: string; countryCode?: string; continentRegion?: string } | null
  city?: { name: string } | null
}

interface Props {
  countries: PlannerCountry[]
  attractions: PlannerAttraction[]
  events: PlannerEvent[]
}

function formatDay(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function TripPlanner({ countries, attractions, events }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status, update: updateSession } = useSession()

  const [draft, setDraft] = useState<TripDraft>(EMPTY_DRAFT)
  const [hydrated, setHydrated] = useState(false)
  const [countryQuery, setCountryQuery] = useState('')
  const [addingToDate, setAddingToDate] = useState<string | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')
  const [pickerKind, setPickerKind] = useState<'all' | 'attraction' | 'event'>('all')
  // Batch 4 (itinerary reordering) — the dragged item's origin, so a drop
  // anywhere else in the itinerary knows what it's moving. Plain up/down
  // and "move to day" controls exist alongside this for keyboard users
  // and for anyone whose browser/input device doesn't do drag-and-drop.
  const [dragItem, setDragItem] = useState<{ date: string; key: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Hydrate from localStorage once, on mount only — starting from
  // EMPTY_DRAFT on the server render avoids a hydration mismatch.
  useEffect(() => {
    const stored = loadTripDraft()
    const countryHint = searchParams.get('country')
    if (!stored.countrySlug && countryHint) {
      const match = countries.find(c => c.slug === countryHint || c.name.toLowerCase() === countryHint.toLowerCase())
      if (match) stored.countrySlug = match.slug
    }
    // "Plan a trip around this event" (event template, Session 3.3) sends
    // ?eventSlug=&country= — country is already handled above, this is the
    // fallback for a link carrying only eventSlug.
    const eventSlugHint = searchParams.get('eventSlug')
    if (!stored.countrySlug && eventSlugHint) {
      const linked = events.find(e => e.slug === eventSlugHint)
      if (linked?.country?.slug) stored.countrySlug = linked.country.slug
    }
    // localStorage genuinely doesn't exist during the server render, so
    // this can't be a lazy useState initializer or it would just reproduce
    // the same EMPTY_DRAFT hydration-mismatch problem it's avoiding — a
    // one-time post-mount effect is the correct tool here, not a
    // avoidable synchronize-props-to-state effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(stored)
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist every change — but not before hydration, or we'd overwrite a
  // real stored draft with EMPTY_DRAFT during the one render before it loads.
  useEffect(() => {
    if (hydrated) saveTripDraft(draft)
  }, [draft, hydrated])

  // A sign-in redirected here from /login by a Server Action's redirect(),
  // which is a client-side route transition, not a hard page load — so
  // next-auth's SessionProvider (mounted once, higher up the tree) never
  // re-fetches and useSession() keeps reporting the pre-sign-in state.
  // Found live: the button below kept saying "Sign in to save this trip"
  // after actually signing in and landing back here. update() forces one
  // real refetch so the button (and anything else reading `status`) is
  // correct within a moment of arriving, not stuck on stale state.
  useEffect(() => {
    updateSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close the item picker on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setAddingToDate(null)
      }
    }
    if (addingToDate) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [addingToDate])

  const selectedCountry = useMemo(
    () => countries.find(c => c.slug === draft.countrySlug) ?? null,
    [countries, draft.countrySlug]
  )

  const linkedEvent = useMemo(() => {
    const slug = searchParams.get('eventSlug')
    return slug ? events.find(e => e.slug === slug) ?? null : null
  }, [searchParams, events])

  const linkedEventOnTrip = linkedEvent
    ? draft.days.some(d => d.items.some(i => i.kind === 'event' && i.slug === linkedEvent.slug))
    : false

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase()
    if (!q) return countries
    return countries.filter(c => c.name.toLowerCase().includes(q))
  }, [countries, countryQuery])

  const days = useMemo(() => dateRange(draft.from, draft.to), [draft.from, draft.to])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, TripDraftItem[]>()
    for (const day of draft.days) map.set(day.date, day.items)
    return map
  }, [draft.days])

  // Batch 4 (map view) — only attractions carry coordinates today (events
  // don't yet), so this only ever pins what it can actually place
  // correctly rather than guessing. `days` gives the 1-indexed day number
  // that colours the route on the map.
  const mapPins = useMemo<MapPin[]>(() => {
    const pins: MapPin[] = []
    days.forEach((date, i) => {
      for (const item of itemsByDate.get(date) ?? []) {
        if (item.kind !== 'attraction') continue
        const a = attractions.find(x => x.slug === item.slug)
        if (a?.latitude == null || a?.longitude == null) continue
        pins.push({ key: item.key, name: a.name, lat: a.latitude, lng: a.longitude, day: i + 1 })
      }
    })
    return pins
  }, [days, itemsByDate, attractions])

  const countryAttractions = useMemo(
    () => draft.countrySlug ? attractions.filter(a => a.country?.slug === draft.countrySlug) : [],
    [attractions, draft.countrySlug]
  )
  const countryEvents = useMemo(
    () => draft.countrySlug ? events.filter(e => e.country?.slug === draft.countrySlug) : [],
    [events, draft.countrySlug]
  )

  // The differentiator: verified events with a confirmed date actually
  // overlapping the chosen range. Deliberately not "any event in this
  // country" — an unconfirmed date is a maybe, and this section makes a
  // "this is happening while you're there" claim, so it only surfaces
  // events eventOverlapsRange() is willing to make that claim about.
  const overlappingEvents = useMemo(
    () => draft.from && draft.to ? countryEvents.filter(e => eventOverlapsRange(e, draft.from, draft.to)) : [],
    [countryEvents, draft.from, draft.to]
  )

  function selectCountry(slug: string) {
    // Every added item belongs to whichever country was selected when it
    // was added — an attraction/event only exists in one country. Without
    // clearing days here, picking a different country after adding items
    // would silently leave those old items sitting in the itinerary,
    // referencing the *previous* country, with nothing on screen
    // distinguishing them from items that actually belong to the new one —
    // and if saved, a trip whose country and itinerary genuinely disagree.
    setDraft(prev => ({ ...prev, countrySlug: slug, days: [] }))
    setCountryQuery('')
  }

  function addItem(date: string, kind: 'attraction' | 'event', slug: string) {
    setDraft(prev => {
      const existingDay = prev.days.find(d => d.date === date)
      const key = `${kind}-${slug}`
      if (existingDay?.items.some(i => i.key === key)) return prev // already added
      const newItem: TripDraftItem = { key, kind, slug }
      const days = existingDay
        ? prev.days.map(d => d.date === date ? { ...d, items: [...d.items, newItem] } : d)
        : [...prev.days, { date, items: [newItem] }]
      return { ...prev, days }
    })
    setAddingToDate(null)
    setPickerQuery('')
  }

  function removeItem(date: string, key: string) {
    setDraft(prev => ({
      ...prev,
      days: prev.days.map(d => d.date === date ? { ...d, items: d.items.filter(i => i.key !== key) } : d),
    }))
  }

  // Batch 4 — moves one item to a specific position on any day, within
  // the same day or across days. Used by drag-and-drop, the up/down
  // buttons, and the "move to day" select — one function, three inputs,
  // so the three interactions can never drift out of sync with each other.
  // `toIndex` is the target position as seen in the CURRENT (pre-removal)
  // list for `toDate` — when the move is within the same day and the item
  // started earlier in the list, removing it first shifts everything
  // after it left by one, so that's corrected for here rather than at
  // every call site.
  function moveItem(fromDate: string, key: string, toDate: string, toIndex: number) {
    setDraft(prev => {
      const fromDay = prev.days.find(d => d.date === fromDate)
      const sourceIdx = fromDay?.items.findIndex(i => i.key === key) ?? -1
      if (sourceIdx === -1) return prev
      const moved = fromDay!.items[sourceIdx]

      let days = prev.days.map(d => d.date === fromDate ? { ...d, items: d.items.filter(i => i.key !== key) } : d)
      if (!days.some(d => d.date === toDate)) days = [...days, { date: toDate, items: [] }]

      const adjustedIndex = fromDate === toDate && sourceIdx < toIndex ? toIndex - 1 : toIndex
      days = days.map(d => {
        if (d.date !== toDate) return d
        const items = [...d.items]
        items.splice(Math.max(0, Math.min(adjustedIndex, items.length)), 0, moved)
        return { ...d, items }
      })
      return { ...prev, days }
    })
  }

  function itemDisplay(item: TripDraftItem): { name: string; sub?: string } | null {
    if (item.kind === 'attraction') {
      const a = attractions.find(x => x.slug === item.slug)
      return a ? { name: a.name, sub: a.type?.[0] } : null
    }
    const e = events.find(x => x.slug === item.slug)
    return e ? { name: e.name, sub: e.category } : null
  }

  const pickerResults = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase()
    const attractionResults = pickerKind === 'event' ? [] : countryAttractions
      .filter(a => !q || a.name.toLowerCase().includes(q))
      .map(a => ({ kind: 'attraction' as const, slug: a.slug, name: a.name, sub: a.type?.[0] }))
    const eventResults = pickerKind === 'attraction' ? [] : countryEvents
      .filter(e => !q || e.name.toLowerCase().includes(q))
      .map(e => ({ kind: 'event' as const, slug: e.slug, name: e.name, sub: e.category }))
    return [...attractionResults, ...eventResults].slice(0, 30)
  }, [countryAttractions, countryEvents, pickerKind, pickerQuery])

  const totalItems = draft.days.reduce((n, d) => n + d.items.length, 0)
  const canSave = Boolean(draft.tripName.trim() && draft.countrySlug)

  async function handleSave() {
    if (!canSave) return
    saveTripDraft(draft)

    // Deliberately doesn't gate on the client's `status` here — the
    // useSession() value can be stale for a moment right after a sign-in
    // redirect (see the updateSession() effect above), and gating on it
    // would send an already-signed-in visitor back to /login. The API
    // route does the real, current auth check server-side; a 401 there is
    // the trustworthy signal that a sign-in is actually needed.
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch('/api/user/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.tripName.trim(),
          countrySlug: draft.countrySlug,
          from: draft.from,
          to: draft.to,
          days: draft.days,
        }),
      })
      if (res.status === 401) {
        router.push('/login?next=/plan-a-trip')
        return
      }
      const json = await res.json()
      if (!res.ok) {
        setSaveError(json.error ?? 'Could not save your trip. Please try again.')
        setSaving(false)
        return
      }
      clearTripDraft()
      router.push('/user-dashboard#trips')
    } catch {
      setSaveError('Could not save your trip. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14">

        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-3">Plan Your Trip</p>
        <h1 className="font-display font-extrabold text-charcoal dark-flip-text mb-3"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.025em', lineHeight: '1.05' }}>
          Build your Africa itinerary
        </h1>
        <p className="font-sans text-charcoal/55 dark-flip-muted leading-relaxed mb-6" style={{ fontSize: '15px' }}>
          Pick a country, choose your dates, and we&rsquo;ll show you what&rsquo;s really happening there while you visit. Everything here stays in your browser until you save it: sign in only when you&rsquo;re ready to keep it.
        </p>

        {/* Arrived from an event page's "Plan a Trip Around This Event" —
            the old planner (a redirect-to-/search form) dropped this
            context entirely; the real one keeps it and offers to add the
            event straight onto the trip once there's a day to put it on. */}
        {linkedEvent && (
          <div className="bg-gold-50 dark:bg-gold-900/15 border border-gold-200 dark:border-gold-800/30 rounded-2xl p-4 mb-8 flex items-center justify-between gap-3 flex-wrap">
            <p className="font-sans text-[14px] text-charcoal dark-flip-text">
              Planning around{' '}
              <Link href={`/events/${linkedEvent.slug}`} className="font-semibold text-crimson hover:text-crimson/70 transition-colors underline underline-offset-2">
                {linkedEvent.name}
              </Link>
            </p>
            {linkedEventOnTrip ? (
              <span className="font-sans text-[14px] uppercase tracking-[0.1em] text-moss-600 dark:text-moss-300">Added to your trip</span>
            ) : draft.countrySlug && linkedEvent.country?.slug !== draft.countrySlug ? (
              // Someone switched to a different country than the event
              // belongs to — adding it now would create exactly the
              // cross-country item corruption selectCountry() guards
              // against, so there's nothing useful to offer here.
              <span className="font-sans text-[14px] text-charcoal/45 dark-flip-muted">Not in {selectedCountry?.name ?? 'this country'}</span>
            ) : days.length > 0 ? (
              <button type="button"
                onClick={() => addItem(linkedEvent.startDate && days.includes(linkedEvent.startDate) ? linkedEvent.startDate : days[0], 'event', linkedEvent.slug)}
                className="font-sans text-[14px] uppercase tracking-[0.1em] text-crimson hover:text-crimson/70 transition-colors">
                Add to trip
              </button>
            ) : (
              <span className="font-sans text-[14px] text-charcoal/45 dark-flip-muted">Choose your dates to add it</span>
            )}
          </div>
        )}

        {/* ── 1. Country ────────────────────────────────────────────────── */}
        <section className="mb-8">
          <h2 className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted mb-3">
            1. Where in Africa?
          </h2>

          {selectedCountry ? (
            <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <Flag code={selectedCountry.countryCode} className="text-xl" />
                  <p className="font-display font-bold text-charcoal dark-flip-text" style={{ fontSize: '18px', letterSpacing: '-0.012em' }}>
                    {selectedCountry.name}
                  </p>
                </div>
                <button type="button" onClick={() => {
                  if (totalItems > 0 && !window.confirm('Changing country will clear the items you\'ve already added to this trip. Continue?')) return
                  setDraft(prev => ({ ...prev, countrySlug: null, days: [] }))
                }}
                  className="font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/65 dark-flip-muted hover:text-crimson transition-colors">
                  Change
                </button>
              </div>
              {selectedCountry.overview && (
                <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted leading-relaxed mb-3">{selectedCountry.overview}</p>
              )}
              {selectedCountry.whenToGo && (
                <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted leading-relaxed">
                  <span className="font-semibold text-charcoal/70 dark-flip-text">When to go: </span>
                  {selectedCountry.whenToGo}
                </p>
              )}
              <Link href={`/destinations/${selectedCountry.slug}`}
                className="inline-block mt-3 font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
                Full guide to {selectedCountry.name} &#8594;
              </Link>
            </div>
          ) : null}

          {/* Where to stay — real affiliate links tagged to this country
              (Session 5.2). Renders nothing until the owner actually adds
              one in Studio; no placeholder "Book now" link. */}
          {selectedCountry?.affiliateLinks && selectedCountry.affiliateLinks.length > 0 && (
            <div className="mt-4">
              <AffiliateLinkList links={selectedCountry.affiliateLinks} title={`Where to Stay in ${selectedCountry.name}`} />
            </div>
          )}

          {/* Batch 3 — "suggested airlines and the cheapest rate" from the
              owner's own Lagos trip-journey walkthrough. Real pricing
              needs an owner-created Travelpayouts account (see
              lib/flightPricing.ts); this renders honestly either way. */}
          {selectedCountry && (
            <div className="mt-4">
              <FlightPriceChip destinationIATA={selectedCountry.nearestAirportIATA} destinationName={selectedCountry.name} />
            </div>
          )}

          {!selectedCountry && (
            <div className="relative">
              <input
                type="text" value={countryQuery} onChange={e => setCountryQuery(e.target.value)}
                placeholder="Search countries..."
                className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 dark:placeholder-cream/25 font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
              />
              <div className="mt-2 max-h-72 overflow-y-auto border border-line dark-flip-border rounded-xl divide-y divide-line dark-flip-border">
                {filteredCountries.length === 0 ? (
                  <p className="font-sans text-sm text-charcoal/65 dark-flip-muted px-4 py-4">No countries match &ldquo;{countryQuery}&rdquo;.</p>
                ) : filteredCountries.map(c => (
                  <button key={c.slug} type="button" onClick={() => selectCountry(c.slug)}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-sand dark-flip-surf transition-colors">
                    <Flag code={c.countryCode} />
                    <span className="font-sans text-sm text-charcoal dark-flip-text">{c.name}</span>
                    <span className="font-sans text-[14px] text-charcoal/65 dark-flip-muted ml-auto">{c.continentRegion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 2. Dates ──────────────────────────────────────────────────── */}
        {selectedCountry && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted mb-3">
              2. When are you going?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="trip-from" className="font-sans text-[14px] text-charcoal/55 dark-flip-muted block mb-1.5">From</label>
                <input id="trip-from" type="date" value={draft.from}
                  onChange={e => setDraft(prev => ({ ...prev, from: e.target.value }))}
                  className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"/>
              </div>
              <div>
                <label htmlFor="trip-to" className="font-sans text-[14px] text-charcoal/55 dark-flip-muted block mb-1.5">To</label>
                <input id="trip-to" type="date" value={draft.to} min={draft.from || undefined}
                  onChange={e => setDraft(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"/>
              </div>
            </div>
            {draft.from && draft.to && days.length === 0 && (
              <p className="font-sans text-[14px] text-crimson mt-2">Your end date needs to be on or after your start date.</p>
            )}
          </section>
        )}

        {/* ── 3. What's happening ──────────────────────────────────────── */}
        {selectedCountry && days.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted mb-3">
              What&rsquo;s happening while you&rsquo;re there
            </h2>
            {overlappingEvents.length === 0 ? (
              <div className="border border-dashed border-line dark-flip-border rounded-2xl p-6 text-center">
                <p className="font-sans text-sm text-charcoal/45 dark-flip-muted leading-relaxed">
                  No verified events found in {selectedCountry.name} for these exact dates yet. As we verify more of the calendar, real matches will show up here automatically.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {overlappingEvents.map(ev => {
                  const accent = ev.category ? (EVENT_CATEGORY_COLOR[ev.category] ?? EVENT_CATEGORY_COLOR_FALLBACK) : EVENT_CATEGORY_COLOR_FALLBACK
                  const { text: dateText } = eventDateDisplay(ev)
                  const alreadyOnTrip = draft.days.some(d => d.items.some(i => i.kind === 'event' && i.slug === ev.slug))
                  return (
                    <div key={ev.slug} className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-sans text-[14px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-full text-cream"
                          style={{ backgroundColor: accent }}>
                          {ev.category ?? 'Event'}
                        </span>
                      </div>
                      <Link href={`/events/${ev.slug}`} className="font-display font-bold text-[14px] text-charcoal dark-flip-text hover:text-crimson transition-colors block mb-1">
                        {ev.name}
                      </Link>
                      <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted mb-3">{dateText}</p>
                      {alreadyOnTrip ? (
                        <span className="font-sans text-[14px] uppercase tracking-[0.1em] text-moss-600 dark:text-moss-300">On your trip</span>
                      ) : (
                        <button type="button"
                          onClick={() => addItem(ev.startDate && days.includes(ev.startDate) ? ev.startDate : days[0], 'event', ev.slug)}
                          className="font-sans text-[14px] uppercase tracking-[0.1em] text-crimson hover:text-crimson/70 transition-colors">
                          Add to trip
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* ── 4. Day by day ─────────────────────────────────────────────── */}
        {selectedCountry && days.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted mb-3">
              3. Your day-by-day itinerary
            </h2>

            {/* Batch 4 — map view. Colour-coded by day, drawn with a
                dashed route line so a multi-stop day reads as a route, not
                a scatter of pins. Add/remove/reorder items above and this
                updates immediately, no separate refresh step. */}
            <div className="mb-4">
              <ItineraryMap pins={mapPins} />
            </div>

            <div className="space-y-3">
              {days.map((date, i) => {
                const items = itemsByDate.get(date) ?? []
                return (
                  <div key={date} className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl overflow-hidden">
                    <div className="bg-sand dark-flip-surf px-5 py-3 flex items-center justify-between">
                      <p className="font-display font-bold text-[14px] text-charcoal dark-flip-text">
                        Day {i + 1} <span className="font-normal text-charcoal/45 dark-flip-muted">· {formatDay(date)}</span>
                      </p>
                      <div className="relative">
                        <button type="button" onClick={() => setAddingToDate(addingToDate === date ? null : date)}
                          className="font-sans text-[14px] uppercase tracking-[0.1em] text-crimson hover:text-crimson/70 transition-colors">
                          + Add
                        </button>
                        {addingToDate === date && (
                          <div ref={pickerRef} className="absolute right-0 top-full mt-2 w-80 max-w-[80vw] bg-white dark-flip-card border border-line dark-flip-border rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] z-20 overflow-hidden">
                            <div className="p-3 border-b border-line dark-flip-border space-y-2">
                              <input
                                autoFocus type="text" value={pickerQuery} onChange={e => setPickerQuery(e.target.value)}
                                placeholder={`Search in ${selectedCountry.name}...`}
                                className="w-full border border-line dark-flip-border bg-cream dark-flip-surf text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gold-400"
                              />
                              <div className="flex gap-1.5">
                                {(['all', 'attraction', 'event'] as const).map(k => (
                                  <button key={k} type="button" onClick={() => setPickerKind(k)}
                                    className={`font-sans text-[14px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border transition-colors ${
                                      pickerKind === k ? 'bg-ink text-cream border-ink' : 'border-line dark-flip-border text-charcoal/50 dark-flip-muted'
                                    }`}>
                                    {k === 'all' ? 'All' : k === 'attraction' ? 'Attractions' : 'Events'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                              {pickerResults.length === 0 ? (
                                <p className="font-sans text-sm text-charcoal/65 dark-flip-muted px-4 py-6 text-center">
                                  Nothing published for {selectedCountry.name} matches yet.
                                </p>
                              ) : pickerResults.map(r => (
                                <button key={`${r.kind}-${r.slug}`} type="button" onClick={() => addItem(date, r.kind, r.slug)}
                                  className="w-full text-left px-4 py-2.5 hover:bg-sand dark-flip-surf transition-colors flex items-center justify-between gap-2">
                                  <span className="font-sans text-sm text-charcoal dark-flip-text truncate">{r.name}</span>
                                  {r.sub && <span className="font-sans text-[14px] text-charcoal/65 dark-flip-muted shrink-0">{r.sub}</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="p-5"
                      onDragOver={e => { if (dragItem) e.preventDefault() }}
                      onDrop={e => {
                        e.preventDefault()
                        if (dragItem) moveItem(dragItem.date, dragItem.key, date, items.length)
                        setDragItem(null)
                      }}
                    >
                      {items.length === 0 ? (
                        <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted">
                          Nothing added yet{dragItem ? ' — drop here to move it to this day' : '.'}
                        </p>
                      ) : (
                        <ul className="space-y-2">
                          {items.map((item, idx) => {
                            const display = itemDisplay(item)
                            if (!display) return null
                            return (
                              <li
                                key={item.key}
                                draggable
                                onDragStart={() => setDragItem({ date, key: item.key })}
                                onDragEnd={() => setDragItem(null)}
                                onDragOver={e => { if (dragItem) e.preventDefault() }}
                                onDrop={e => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  if (dragItem) moveItem(dragItem.date, dragItem.key, date, idx)
                                  setDragItem(null)
                                }}
                                className={`flex items-center gap-2 bg-sand dark-flip-surf border border-line dark-flip-border rounded-xl px-2 py-2.5 cursor-grab active:cursor-grabbing transition-opacity ${
                                  dragItem?.key === item.key ? 'opacity-40' : ''
                                }`}
                              >
                                <span className="shrink-0 text-charcoal/35 dark-flip-muted px-1" aria-hidden>
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="9" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-sans text-sm text-charcoal dark-flip-text truncate">{display.name}</p>
                                  <p className="font-sans text-[14px] uppercase tracking-[0.08em] text-charcoal/65 dark-flip-muted">
                                    {item.kind === 'event' ? 'Event' : (display.sub ?? 'Attraction')}
                                  </p>
                                </div>

                                {/* Keyboard/touch-friendly alternative to drag-and-drop —
                                    reorder within the day, or relocate to another day
                                    entirely. Every button here routes through the same
                                    moveItem() the drag handlers use. */}
                                <div className="shrink-0 flex items-center gap-0.5">
                                  <button type="button" onClick={() => moveItem(date, item.key, date, idx - 1)}
                                    disabled={idx === 0}
                                    aria-label={`Move ${display.name} earlier`}
                                    className="p-1 text-charcoal/45 dark-flip-muted hover:text-crimson disabled:opacity-25 disabled:hover:text-charcoal/45 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7"/></svg>
                                  </button>
                                  <button type="button" onClick={() => moveItem(date, item.key, date, idx + 2)}
                                    disabled={idx === items.length - 1}
                                    aria-label={`Move ${display.name} later`}
                                    className="p-1 text-charcoal/45 dark-flip-muted hover:text-crimson disabled:opacity-25 disabled:hover:text-charcoal/45 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                                  </button>
                                  {days.length > 1 && (
                                    <select
                                      aria-label={`Move ${display.name} to a different day`}
                                      value={date}
                                      onChange={e => moveItem(date, item.key, e.target.value, (itemsByDate.get(e.target.value) ?? []).length)}
                                      className="font-sans text-[14px] bg-transparent border border-line dark-flip-border rounded-lg px-1.5 py-1 text-charcoal/65 dark-flip-muted focus:outline-none focus:border-crimson"
                                    >
                                      {days.map((d, di) => (
                                        <option key={d} value={d}>Day {di + 1}</option>
                                      ))}
                                    </select>
                                  )}
                                  <button type="button" onClick={() => removeItem(date, item.key)}
                                    aria-label={`Remove ${display.name}`}
                                    className="shrink-0 p-1 text-charcoal/65 dark-flip-muted hover:text-crimson transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                                  </button>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 5. Name and save ─────────────────────────────────────────── */}
        {selectedCountry && (
          <section className="bg-ink rounded-2xl p-6">
            <label htmlFor="trip-name" className="font-display font-semibold text-[14px] text-cream/80 block mb-2">
              Name this trip
            </label>
            <input id="trip-name" type="text" value={draft.tripName} maxLength={80}
              onChange={e => setDraft(prev => ({ ...prev, tripName: e.target.value }))}
              placeholder={`e.g. "${selectedCountry.name} in ${draft.from ? new Date(draft.from + 'T00:00:00').toLocaleDateString('en-GB', { month: 'long' }) : 'August'}"`}
              className="w-full border border-white/15 bg-white/8 text-cream placeholder-cream/25 font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors mb-4"
            />
            {totalItems > 0 && (
              <p className="font-sans text-[14px] text-cream/50 mb-4">{totalItems} item{totalItems !== 1 ? 's' : ''} across {draft.days.filter(d => d.items.length > 0).length} day{draft.days.filter(d => d.items.length > 0).length !== 1 ? 's' : ''}.</p>
            )}
            {saveError && <p className="font-sans text-[14px] text-crimson mb-3">{saveError}</p>}
            <button type="button" onClick={handleSave} disabled={!canSave || saving}
              className="w-full bg-action hover:bg-action-hover disabled:opacity-50 disabled:cursor-not-allowed text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-4 rounded-xl transition-all">
              {saving ? 'Saving...' : status === 'authenticated' ? 'Save this trip' : 'Sign in to save this trip'}
            </button>
            {status !== 'authenticated' && (
              <p className="font-sans text-[14px] text-cream/55 text-center mt-3 leading-relaxed">
                Nothing is lost: your trip stays right here in this browser. We only ask you to sign in the moment you want to save it.
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
