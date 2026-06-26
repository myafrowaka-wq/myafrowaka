'use client'

import { useState } from 'react'

const REASONS = [
  'General Enquiry',
  'Partnership / Sponsorship',
  'Attraction Data Correction',
  'Press / Media',
  'Tourism Board Enquiry',
  'Tip a Destination',
  'Other',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [status, setStatus]     = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const form = e.currentTarget
    const data = {
      name:    (form.elements.namedItem('name')    as HTMLInputElement).value.trim(),
      email:   (form.elements.namedItem('email')   as HTMLInputElement).value.trim(),
      subject: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
    }

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })
      const json = await res.json()

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMsg(json.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again or email us directly.')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-3xl bg-sand dark-flip-surf border border-line dark-flip-border p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-moss/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-moss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 className="font-display font-bold text-charcoal dark-flip-text mb-2"
          style={{ fontSize: 'clamp(18px, 2vw, 24px)', letterSpacing: '-0.015em' }}>
          Message received.
        </h2>
        <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted max-w-sm mx-auto leading-relaxed">
          We will be in touch within 2 business days. Check your inbox for a confirmation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {errorMsg && (
        <div className="bg-crimson/8 border border-crimson/25 rounded-xl px-4 py-3">
          <p className="font-sans text-[13px] text-crimson">{errorMsg}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
            Your Name
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Amara Okafor"
            className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 dark:placeholder:text-cream/25 focus:outline-none focus:border-gold-400 transition-colors"
          />
        </div>
        <div>
          <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 dark:placeholder:text-cream/25 focus:outline-none focus:border-gold-400 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
          Reason for Contact
        </label>
        <div className="relative">
          <select
            name="subject"
            className="w-full appearance-none border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text focus:outline-none focus:border-gold-400 transition-colors pr-10"
          >
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/35 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>

      <div>
        <label className="font-display font-semibold text-[13px] text-charcoal/70 dark-flip-muted block mb-2">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell us what is on your mind. Specific is always better."
          className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3.5 font-sans text-sm text-charcoal dark-flip-text placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400 resize-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2.5 bg-crimson hover:bg-crimson-600 disabled:opacity-60 disabled:cursor-not-allowed text-cream font-display font-bold text-[12px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all btn-magnetic shadow-[0_4px_24px_rgba(162,46,41,0.25)]"
      >
        {status === 'loading' ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send Message
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </>
        )}
      </button>

      <p className="font-sans text-[12px] text-charcoal/35 dark-flip-muted">
        Your message goes directly to the editorial team. We do not use auto-replies.
      </p>
    </form>
  )
}
