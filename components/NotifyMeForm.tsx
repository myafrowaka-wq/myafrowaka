'use client'

import { useState } from 'react'

export function NotifyMeForm({ eventName, eventSlug }: { eventName: string; eventSlug: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/notify-event-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, eventName, eventSlug }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-moss-500/10 border border-moss-500/25 rounded-xl px-5 py-4">
        <p className="font-display font-bold text-[15px] text-moss-600 dark:text-moss-300">You&rsquo;re on the list.</p>
        <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted mt-1">We&rsquo;ll email you the moment real dates are confirmed for {eventName}.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 border border-line dark-flip-border bg-white dark-flip-card rounded-xl px-4 py-3 text-sm font-sans text-charcoal dark-flip-text placeholder:text-charcoal/30 focus:outline-none focus:border-gold-400 transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-action hover:bg-action-hover disabled:opacity-60 text-cream font-display font-bold text-[14px] uppercase tracking-[0.1em] px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
        >
          {status === 'sending' ? 'Sending...' : 'Notify Me'}
        </button>
      </div>
      {status === 'error' && (
        <p className="font-sans text-[14px] text-crimson mt-2">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
