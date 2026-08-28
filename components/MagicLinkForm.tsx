'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'sent' | 'error'

// Session 4.1 — real email sign-in for visitors without a Google account.
// No password: this posts to /api/auth/magic-link, which emails a one-time
// sign-in link (or, with no Resend key configured yet, hands the link back
// directly for local testing — see that route for why).
export function MagicLinkForm() {
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<Status>('idle')
  const [errMsg, setErrMsg]   = useState('')
  const [devLink, setDevLink] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrMsg('')
    setDevLink('')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      if (!res.ok) {
        setStatus('error')
        setErrMsg(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      if (json.devLink) setDevLink(json.devLink)
      setStatus('sent')
    } catch {
      setStatus('error')
      setErrMsg('Something went wrong. Please try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-moss-50 border border-moss-200 rounded-xl px-5 py-4">
        <p className="font-display font-semibold text-[15px] text-moss-700">Check your email</p>
        <p className="font-sans text-[14px] text-moss-700/80 mt-1 leading-relaxed">
          We sent a sign-in link to <span className="font-semibold">{email}</span>. It expires in 15 minutes and works once.
        </p>
        {devLink && (
          <div className="mt-3 pt-3 border-t border-moss-200">
            <p className="font-sans text-[14px] uppercase tracking-[0.12em] text-moss-700/60 mb-1.5">
              No email service configured yet — use this link directly:
            </p>
            <a href={devLink} className="font-sans text-[14px] text-moss-700 underline break-all hover:text-moss-600">
              {devLink}
            </a>
          </div>
        )}
        <button type="button" onClick={() => setStatus('idle')}
          className="font-sans text-[14px] uppercase tracking-[0.1em] text-moss-700/70 hover:text-moss-700 mt-3 transition-colors">
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="email" required value={email} placeholder="your@email.com"
          onChange={e => setEmail(e.target.value)}
          className="flex-1 border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder:text-charcoal/30 dark:placeholder:text-cream/25 font-sans text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-gold-400 transition-colors"
        />
        <button type="submit" disabled={status === 'loading'}
          className="shrink-0 bg-ink hover:bg-charcoal disabled:opacity-60 disabled:cursor-not-allowed text-cream font-display font-bold text-[14px] uppercase tracking-[0.1em] px-6 py-3.5 rounded-xl transition-all whitespace-nowrap">
          {status === 'loading' ? 'Sending...' : 'Send sign-in link'}
        </button>
      </div>
      {status === 'error' && (
        <p className="font-sans text-[14px] text-crimson mt-2.5">{errMsg}</p>
      )}
      <p className="font-sans text-[14px] text-charcoal/40 dark-flip-muted mt-2.5 leading-relaxed">
        No password to remember. We&rsquo;ll email you a link that signs you in — first time or returning.
      </p>
    </form>
  )
}
