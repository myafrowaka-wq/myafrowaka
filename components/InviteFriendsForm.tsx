'use client'

import { useState } from 'react'

// Session 4.3 — "Press 'Invite friends.' Enter up to five emails with a
// personal note." Lives inline on the trip card in DashTrips.tsx rather
// than a separate route — inviting people is something you do right where
// the trip already is, not a destination of its own.

const MAX_EMAILS = 5

export function InviteFriendsForm({ tripId, onClose }: { tripId: string; onClose: () => void }) {
  const [emails, setEmails] = useState<string[]>([''])
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<{ email: string; sent: boolean; devLink?: string }[] | null>(null)

  function updateEmail(i: number, value: string) {
    setEmails(prev => prev.map((e, idx) => idx === i ? value : e))
  }

  function addEmailField() {
    if (emails.length < MAX_EMAILS) setEmails(prev => [...prev, ''])
  }

  function removeEmailField(i: number) {
    setEmails(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = emails.map(e => e.trim()).filter(Boolean)
    if (cleaned.length === 0) { setError('Add at least one email.'); return }
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/user/trips/${tripId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: cleaned, note: note.trim() }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not send invites. Please try again.')
        setSending(false)
        return
      }
      setResults(json.results)
    } catch {
      setError('Could not send invites. Please try again.')
    }
    setSending(false)
  }

  if (results) {
    const anyDevLinks = results.some(r => r.devLink)
    return (
      <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl p-5 mt-3">
        <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-3">
          {anyDevLinks ? 'Invites created' : 'Invites sent'}
        </p>
        <ul className="space-y-2 mb-3">
          {results.map(r => (
            <li key={r.email} className="font-sans text-sm text-charcoal/70 dark-flip-muted">
              <span className="font-semibold">{r.email}</span>
              {r.devLink ? (
                <>
                  {' — no email service configured yet, use this link directly: '}
                  <a href={r.devLink} className="text-crimson underline break-all">{r.devLink}</a>
                </>
              ) : (
                ' — sent'
              )}
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose}
          className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
          Done
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSend} className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl p-5 mt-3 space-y-3">
      <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text">Invite friends</p>
      {emails.map((email, i) => (
        <div key={i} className="flex gap-2">
          <input type="email" value={email} onChange={e => updateEmail(i, e.target.value)}
            placeholder="friend@example.com"
            className="flex-1 border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold-400 transition-colors"/>
          {emails.length > 1 && (
            <button type="button" onClick={() => removeEmailField(i)} aria-label="Remove email"
              className="shrink-0 text-charcoal/30 dark-flip-muted hover:text-crimson transition-colors px-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      ))}
      {emails.length < MAX_EMAILS && (
        <button type="button" onClick={addEmailField}
          className="font-sans text-[14px] uppercase tracking-[0.1em] text-crimson hover:text-crimson/70 transition-colors">
          + Add another
        </button>
      )}
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={500}
        placeholder="Add a personal note (optional)"
        className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold-400 transition-colors resize-none"/>
      {error && <p className="font-sans text-[14px] text-crimson">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={sending}
          className="bg-ink hover:bg-charcoal disabled:opacity-60 text-cream font-sans text-[14px] uppercase tracking-[0.12em] px-5 py-2.5 rounded-full transition-colors">
          {sending ? 'Sending...' : 'Send invites'}
        </button>
        <button type="button" onClick={onClose}
          className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/50 dark-flip-muted hover:text-charcoal/75 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
