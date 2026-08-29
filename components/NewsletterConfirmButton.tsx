'use client'

import { useState } from 'react'

// Session 5.1 — the explicit click that actually confirms a subscription.
// Same "don't act on a bare GET" shape as components/JoinTripButton.tsx:
// the page this sits on only ever displays the invite/subscription, this
// button is the one thing that changes anything.
export function NewsletterConfirmButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleConfirm() {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/newsletter/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not confirm this subscription. Please try again.')
        setState('error')
        return
      }
      setState('done')
    } catch {
      setError('Could not confirm this subscription. Please try again.')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="text-center">
        <p className="font-display font-bold text-[15px] text-charcoal dark-flip-text mb-1.5">You&rsquo;re confirmed.</p>
        <p className="font-sans text-sm text-charcoal/60 dark-flip-muted">Welcome — real guides and verified events, nothing else.</p>
      </div>
    )
  }

  return (
    <div>
      <button type="button" onClick={handleConfirm} disabled={state === 'loading'}
        className="w-full bg-action hover:bg-action-hover disabled:opacity-60 disabled:cursor-not-allowed text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-4 rounded-xl transition-all">
        {state === 'loading' ? 'Confirming...' : 'Confirm subscription'}
      </button>
      {error && <p className="font-sans text-[14px] text-crimson mt-3 text-center">{error}</p>}
    </div>
  )
}
