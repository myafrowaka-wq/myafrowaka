'use client'

import { useState } from 'react'

// Session 5.1 — the explicit click that actually unsubscribes someone. See
// lib/newsletter.ts's unsubscribe() for why the page this sits on only
// ever displays a confirmation prompt and never acts on its own GET.
export function NewsletterUnsubscribeButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleUnsubscribe() {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not process this. Please try again.')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setError('Could not process this. Please try again.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="text-center">
        <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text mb-1.5">You&rsquo;re unsubscribed.</p>
        <p className="font-sans text-sm text-charcoal/60 dark-flip-muted">You won&rsquo;t hear from us again unless you sign up a second time.</p>
      </div>
    )
  }

  return (
    <div>
      <button type="button" onClick={handleUnsubscribe} disabled={state === 'loading'}
        className="w-full bg-charcoal hover:bg-ink disabled:opacity-60 disabled:cursor-not-allowed text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-4 rounded-xl transition-all">
        {state === 'loading' ? 'Unsubscribing...' : 'Unsubscribe me'}
      </button>
      {error && <p className="font-sans text-[14px] text-crimson mt-3 text-center">{error}</p>}
    </div>
  )
}
