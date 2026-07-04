'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Metadata } from 'next'

// Note: metadata can't be exported from a client component.
// SEO is handled by the parent layout's default metadata.

const INTERESTS = ['Safari', 'Culture', 'Beach', 'History', 'Hiking', 'Food']

export default function PlanATripPage() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [from, setFrom]               = useState('')
  const [to, setTo]                   = useState('')
  const [travelers, setTravelers]     = useState('')
  const [budget, setBudget]           = useState('')
  const [interests, setInterests]     = useState<string[]>([])

  function toggleInterest(v: string) {
    setInterests(prev => prev.includes(v) ? prev.filter(i => i !== v) : [...prev, v])
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Build search URL with the collected data
    const params = new URLSearchParams()
    if (destination.trim()) params.set('q', destination.trim())
    if (interests.length > 0) params.set('exp', interests[0])

    // Save the full plan to sessionStorage so a future "save plan" feature can use it
    try {
      sessionStorage.setItem('trip_plan', JSON.stringify({ destination, from, to, travelers, budget, interests }))
    } catch { /* non-fatal */ }

    router.push(`/search${params.toString() ? '?' + params.toString() : ''}`)
  }

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">

      {/* Hero */}
      <div className="relative overflow-hidden min-h-[380px] flex items-end">
        <Image
          src="https://images.unsplash.com/photo-2mz1kYGlBZc?auto=format&fit=crop&w=1920&q=85"
          alt="Plan your Africa trip"
          fill priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/60 to-ink/97"/>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 w-full pb-14 pt-28 text-center">
          <p className="font-inter text-[9px] uppercase tracking-[0.22em] text-gold-400 mb-3">Start Here</p>
          <h1
            className="font-display font-extrabold text-cream mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 62px)', lineHeight: '0.95', letterSpacing: '-0.025em' }}
          >
            Plan Your Africa Trip
          </h1>
          <p className="font-sans text-cream/60 leading-relaxed" style={{ fontSize: 'clamp(14px, 1.4vw, 17px)' }}>
            Tell us what you are looking for. We will find the right destinations, experiences, and guides.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Destination */}
          <div>
            <label htmlFor="destination" className="font-display font-semibold text-[13px] text-charcoal dark-flip-text block mb-2">
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
              <label htmlFor="from" className="font-display font-semibold text-[13px] text-charcoal dark-flip-text block mb-2">From</label>
              <input
                id="from"
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="to" className="font-display font-semibold text-[13px] text-charcoal dark-flip-text block mb-2">To</label>
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
            <label htmlFor="travelers" className="font-display font-semibold text-[13px] text-charcoal dark-flip-text block mb-2">
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
            <label htmlFor="budget" className="font-display font-semibold text-[13px] text-charcoal dark-flip-text block mb-2">
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
            <p className="font-display font-semibold text-[13px] text-charcoal dark-flip-text mb-3">
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
              className="w-full bg-crimson hover:bg-crimson-600 text-cream font-display font-bold text-[13px] uppercase tracking-[0.12em] py-4 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              Find Attractions
            </button>
            <p className="font-sans text-[12px] text-charcoal/45 dark-flip-muted text-center mt-3 leading-relaxed">
              You will be taken to the attraction search with your preferences applied.
              <Link href="/login" className="text-crimson hover:text-crimson/70 transition-colors ml-1">
                Sign in
              </Link>
              {' '}to save a full itinerary.
            </p>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-line dark-flip-border text-center">
          <p className="font-sans text-sm text-charcoal/45 dark-flip-muted mb-4">
            Want to browse on your own first?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/search"
              className="font-inter text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
              Browse all attractions
            </Link>
            <span className="text-charcoal/20">|</span>
            <Link href="/guides"
              className="font-inter text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
              Read travel guides
            </Link>
            <span className="text-charcoal/20">|</span>
            <Link href="/blog"
              className="font-inter text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
              Stories from the continent
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
