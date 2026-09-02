'use client'

import { useState } from 'react'

// Session 5.1 — the full-preference signup form on /newsletter. Same
// vocabulary as sanity/schemaTypes/userRole.ts's travelStyle (see
// newsletterSubscriber.ts's own comment for why this reuses it as
// multi-select "interests" rather than inventing a second list).
const INTERESTS = [
  'Solo Travelers', 'Couples', 'Families', 'Backpackers',
  'Photographers', 'Culture Enthusiasts', 'Luxury Travelers', 'Adventure Seekers',
]

interface Country { _id: string; name: string; slug: string; countryCode?: string }

export function NewsletterSignupForm({ countries, source = 'newsletter-page' }: {
  countries: Country[]
  source?: 'newsletter-page' | 'popup'
}) {
  const [email, setEmail] = useState('')
  const [homeCountryId, setHomeCountryId] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [devLink, setDevLink] = useState('')

  function toggleInterest(v: string) {
    setInterests(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          homeCountryId: homeCountryId || undefined,
          interests: interests.length > 0 ? interests : undefined,
          source,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        setState('error')
        return
      }
      if (json.devLink) setDevLink(json.devLink)
      setState('done')
    } catch {
      setError('Something went wrong. Please try again.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-6 text-center">
        <div className="w-10 h-10 bg-moss-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <p className="font-display font-bold text-charcoal dark-flip-text text-[15px] mb-1">Almost there.</p>
        <p className="font-sans text-sm text-charcoal/60 dark-flip-muted">
          {/* Deliberately true whether this is a brand-new signup or
              someone already confirmed resubmitting the form — the API
              response is identical in both cases on purpose (so a public
              form can't be used to probe which emails are already
              subscribed), so this copy can't claim "we just sent an
              email" without risking a lie in the second case. */}
          If {email} isn&rsquo;t already confirmed, check your inbox for a confirmation link. Nothing goes out until you click it.
        </p>
        {devLink && (
          <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted mt-4 border-t border-line dark-flip-border pt-4">
            No email provider configured yet, confirm directly:{' '}
            <a href={devLink} className="text-crimson hover:text-crimson/70 underline break-all">{devLink}</a>
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-6 space-y-5">
      <div>
        <label htmlFor="nwl-email" className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted block mb-2">
          Email
        </label>
        <input
          id="nwl-email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full border border-line dark-flip-border bg-cream dark-flip-surf text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-gold-400"
        />
      </div>

      {countries.length > 0 && (
        <div>
          <label htmlFor="nwl-country" className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted block mb-2">
            Home country <span className="normal-case text-charcoal/65 dark-flip-muted">(optional)</span>
          </label>
          <select
            id="nwl-country"
            value={homeCountryId}
            onChange={e => setHomeCountryId(e.target.value)}
            className="w-full border border-line dark-flip-border bg-cream dark-flip-surf text-charcoal dark-flip-text font-sans text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-gold-400"
          >
            <option value="">Prefer not to say</option>
            {countries.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-2">
          What are you into? <span className="normal-case text-charcoal/65 dark-flip-muted">(optional, pick any)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map(v => (
            <button
              key={v}
              type="button"
              onClick={() => toggleInterest(v)}
              aria-pressed={interests.includes(v)}
              className={`font-sans text-[14px] px-3 py-1.5 rounded-full border transition-colors ${
                interests.includes(v)
                  ? 'bg-crimson/10 border-crimson/40 text-crimson'
                  : 'bg-cream dark-flip-surf border-line dark-flip-border text-charcoal/60 dark-flip-muted hover:border-gold-300'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="font-sans text-[14px] text-crimson">{error}</p>}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full bg-ink hover:bg-charcoal disabled:opacity-60 disabled:cursor-not-allowed text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-3.5 rounded-xl transition-colors"
      >
        {state === 'loading' ? 'Sending confirmation...' : 'Subscribe'}
      </button>
      <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted text-center">
        We&rsquo;ll email you a confirmation link. Unsubscribe any time from the link in every email.
      </p>
    </form>
  )
}
