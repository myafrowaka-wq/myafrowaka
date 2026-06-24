'use client'

import { useState, useEffect } from 'react'

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('nwl-dismissed')) return
    const t = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem('nwl-dismissed', '1')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setTimeout(dismiss, 2200)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Newsletter signup"
      className="fixed bottom-6 right-6 z-[200] w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.35)] border border-white/10 popup-slide-up"
    >
      {/* Dark header strip */}
      <div className="bg-[#1A1813] px-6 pt-5 pb-4 relative">
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
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold-400">MyAfroWaka</span>
        </div>
        <h3 className="font-display font-bold text-[18px] text-cream leading-snug pr-6">
          Africa in Your Inbox Every Week
        </h3>
        <p className="font-sans text-[12px] text-cream/55 mt-1.5 leading-relaxed">
          Hidden gems, visa updates, and expert travel guides. One email, no spam.
        </p>
      </div>

      {/* Form section */}
      <div className="bg-[#F7F2E9] px-6 py-5">
        {submitted ? (
          <div className="text-center py-2">
            <div className="w-10 h-10 bg-moss-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <p className="font-display font-bold text-charcoal text-[15px]">You are in.</p>
            <p className="font-sans text-[12px] text-charcoal/55 mt-1">First guide arriving soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-white border border-line rounded-xl px-4 py-2.5 text-sm font-sans text-charcoal placeholder-charcoal/35 focus:outline-none focus:border-ochre-400 transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-ochre-500 hover:bg-ochre-600 text-cream font-display font-bold text-[12px] uppercase tracking-[0.10em] py-3 rounded-xl transition-colors"
            >
              Subscribe Free
            </button>
          </form>
        )}
        <p className="font-mono text-[9px] text-charcoal/30 text-center mt-3">
          No spam. Unsubscribe any time.
        </p>
      </div>
    </div>
  )
}
