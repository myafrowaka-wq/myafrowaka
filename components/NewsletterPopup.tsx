'use client'

import { useState, useEffect, useRef } from 'react'

// Session 5.1 — "Fix the fake popup. Right now it lies to people." Two real
// changes from the old version: it actually calls /api/newsletter/subscribe
// instead of faking success on a setTimeout, and it no longer interrupts
// someone five seconds into a page — it waits for either exit intent (the
// mouse leaving through the top of the viewport, the classic signal someone
// is about to leave) or real engagement (scrolled past 60% of the page AND
// spent at least 15 seconds on it), whichever comes first.

const DISMISS_KEY = 'nwl-dismissed'
const SUBSCRIBED_KEY = 'nwl-subscribed'
const ENGAGEMENT_SCROLL_THRESHOLD = 0.6
const ENGAGEMENT_MIN_SECONDS = 15

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const shownRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DISMISS_KEY) || localStorage.getItem(SUBSCRIBED_KEY)) return

    const mountedAt = Date.now()

    function show() {
      if (shownRef.current) return
      shownRef.current = true
      setVisible(true)
      cleanup()
    }

    function onMouseOut(e: MouseEvent) {
      // Exit intent: the cursor leaving through the top edge of the
      // viewport with nowhere else to go (relatedTarget null means it left
      // the document entirely, not just moved onto another element).
      if (e.clientY <= 0 && e.relatedTarget === null) show()
    }

    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const depth = window.scrollY / scrollable
      const secondsOnPage = (Date.now() - mountedAt) / 1000
      if (depth >= ENGAGEMENT_SCROLL_THRESHOLD && secondsOnPage >= ENGAGEMENT_MIN_SECONDS) show()
    }

    function cleanup() {
      document.removeEventListener('mouseout', onMouseOut)
      window.removeEventListener('scroll', onScroll)
    }

    document.addEventListener('mouseout', onMouseOut)
    window.addEventListener('scroll', onScroll, { passive: true })
    return cleanup
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
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
        body: JSON.stringify({ email: email.trim(), source: 'popup' }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        setState('error')
        return
      }
      setState('done')
      localStorage.setItem(SUBSCRIBED_KEY, '1')
    } catch {
      setError('Something went wrong. Please try again.')
      setState('error')
    }
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Newsletter signup"
      className="fixed bottom-6 right-6 z-[200] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/10 popup-slide-up"
    >
      {/* Dark header strip */}
      <div className="bg-ink px-6 pt-5 pb-4 relative">
        <button
          onClick={dismiss}
          aria-label="Close newsletter popup"
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center text-cream/50 hover:text-cream transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="font-sans text-[14px] uppercase tracking-[0.18em] text-gold-400">MyAfroWaka</span>
        </div>
        <h3 className="font-display font-bold text-[18px] text-cream leading-snug pr-6">
          Real Africa, Not the Ten-City Version
        </h3>
        <p className="font-sans text-[14px] text-cream/55 mt-1.5 leading-relaxed">
          Verified events, honest country guides, hidden gems. A few times a month, never on a schedule for its own sake.
        </p>
      </div>

      {/* Form section */}
      <div className="bg-cream px-6 py-5">
        {state === 'done' ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 bg-moss-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="font-display font-bold text-charcoal text-[15px]">Almost there.</p>
            {/* Same "if not already" phrasing as NewsletterSignupForm.tsx —
                the API response is identical whether this created a new
                pending signup or found an already-confirmed subscriber, on
                purpose, so this copy can't claim an email just went out
                without risking a lie in the second case. */}
            <p className="font-sans text-[14px] text-charcoal/55 mt-1">If you&rsquo;re not already confirmed, check your inbox for a link.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={state === 'loading'}
              className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm font-sans text-charcoal placeholder-charcoal/35 focus:outline-none focus:border-ochre-400 transition-colors disabled:opacity-60"
            />
            {error && <p className="font-sans text-[14px] text-crimson">{error}</p>}
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full bg-ochre-500 hover:bg-ochre-600 disabled:opacity-60 text-cream font-display font-bold text-[14px] uppercase tracking-[0.10em] py-3 rounded-xl transition-colors"
            >
              {state === 'loading' ? 'Sending...' : 'Subscribe Free'}
            </button>
          </form>
        )}
        <p className="font-sans text-[14px] text-charcoal/30 text-center mt-3">
          Confirm by email first. Unsubscribe any time.
        </p>
      </div>
    </div>
  )
}
