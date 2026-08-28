'use client'

import { useState, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { stockImage } from '@/lib/stockImageCredits'

// Note: metadata can't be exported from a client component.
// SEO is handled by the parent layout's default metadata.

const INTERESTS = ['Safari', 'Culture', 'Beach', 'History', 'Hiking', 'Food']

function PlanATripInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()

  // "Plan a trip around this event" (Session 3.3) arrives here as
  // ?destination=<country/city>&event=<name>&eventSlug=<slug> — pre-fills
  // the one field this page can honestly pre-fill today. This is NOT the
  // real Phase 4 trip planner the plan describes ("drops the event
  // straight into the trip planner") — that planner doesn't exist yet, so
  // rather than fake an integration to something unbuilt, this pre-fills
  // the real intent-capture flow that already exists and routes to search.
  const eventName = searchParams.get('event') ?? ''
  const eventSlug = searchParams.get('eventSlug') ?? ''

  const [destination, setDestination] = useState(searchParams.get('destination') ?? '')
  const [from, setFrom]               = useState('')
  const [to, setTo]                   = useState('')
  const [travelers, setTravelers]     = useState('')
  const [budget, setBudget]           = useState('')
  const [interests, setInterests]     = useState<string[]>([])
  const [saving, setSaving]           = useState(false)

  function toggleInterest(v: string) {
    setInterests(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    // If signed in, save the plan to dashboard
    if (status === 'authenticated' && destination.trim()) {
      try {
        await fetch('/api/user/trips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination, from, to, travelers, budget, interests }),
        })
      } catch { /* non-fatal — we still proceed to search */ }
    }

    // Build search URL with the collected data
    const params = new URLSearchParams()
    if (destination.trim()) params.set('q', destination.trim())
    if (interests.length > 0) params.set('exp', interests[0])

    router.push(`/search${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[380px] flex items-end">
        <Image
          src={stockImage('1577455486223-089171b4572f')}
          alt="Plan your Africa trip"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/60 to-ink/97"/>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 w-full pb-14 pt-28 text-center">
          <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-gold-400 mb-3">Start Here</p>
          <h1
            className="font-display font-extrabold text-cream mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 62px)', lineHeight: '0.95', letterSpacing: '-0.025em' }}
          >
            Plan Your Africa Trip
          </h1>
          <p className="font-sans text-cream/60 leading-relaxed" style={{ fontSize: 'clamp(14px, 1.4vw, 17px)' }}>
            Tell us what you are looking for. We will find the right destinations, experiences, and guides.
          </p>
          {eventName && (
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-gold-400">Planning around</span>
              {eventSlug ? (
                <Link href={`/events/${eventSlug}`} className="font-sans text-[14px] text-cream hover:text-gold-300 transition-colors underline underline-offset-2">
                  {eventName}
                </Link>
              ) : (
                <span className="font-sans text-[14px] text-cream">{eventName}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Destination */}
          <div>
            <label htmlFor="destination" className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">
              Where in Africa do you want to go?
            </label>
            <input
              id="destination"
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Kenya, West Africa, Morocco..."
              className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 dark:placeholder-cream/25 font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          {/* Travel dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="from" className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">From</label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="to" className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">To</label>
              <input
                id="to"
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
          </div>

          {/* Travelers */}
          <div>
            <label htmlFor="travelers" className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">
              How many travelers?
            </label>
            <select
              id="travelers"
              value={travelers}
              onChange={e => setTravelers(e.target.value)}
              className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
            >
              <option value="">Select</option>
              <option value="solo">Just me</option>
              <option value="couple">Couple (2)</option>
              <option value="small">Small group (3 to 5)</option>
              <option value="large">Large group (6+)</option>
              <option value="family">Family with children</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="font-display font-semibold text-[14px] text-charcoal dark-flip-text block mb-2">
              Budget range (per person)
            </label>
            <select
              id="budget"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
            >
              <option value="">Select</option>
              <option value="budget">Budget (under $500)</option>
              <option value="mid">Mid-range ($500 to $2,000)</option>
              <option value="comfort">Comfortable ($2,000 to $5,000)</option>
              <option value="luxury">Luxury ($5,000+)</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-3">
              What interests you most?
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERESTS.map(interest => (
                <label key={interest} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={() => toggleInterest(interest)}
                    className="w-4 h-4 rounded border-line accent-crimson cursor-pointer"
                  />
                  <span className="font-sans text-sm text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                    {interest}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-action hover:bg-action-hover disabled:opacity-70 disabled:cursor-not-allowed text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {saving ? 'Saving Plan...' : (status === 'authenticated' ? 'Save Plan and Find Attractions' : 'Find Attractions')}
            </button>
            <p className="font-sans text-[14px] text-charcoal/45 dark-flip-muted text-center mt-3 leading-relaxed">
              {status === 'authenticated'
                ? 'Your trip plan will be saved to your dashboard.'
                : <>
                    You will be taken to attraction search with your preferences applied.{' '}
                    <Link href="/login" className="text-crimson hover:text-crimson/70 transition-colors">
                      Sign in
                    </Link>
                    {' '}to save a full itinerary to your dashboard.
                  </>
              }
            </p>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-line dark-flip-border text-center">
          <p className="font-sans text-sm text-charcoal/45 dark-flip-muted mb-4">
            Want to browse on your own first?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/search"
              className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
              Browse all attractions
            </Link>
            <span className="text-charcoal/20">|</span>
            <Link href="/guides"
              className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
              Read travel guides
            </Link>
            <span className="text-charcoal/20">|</span>
            <Link href="/blog"
              className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
              Stories from the continent
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PlanATripPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream dark-flip-bg" />}>
      <PlanATripInner />
    </Suspense>
  )
}
