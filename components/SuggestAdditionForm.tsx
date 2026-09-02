'use client'

import { useState, useEffect } from 'react'

// Session 4.3 — "Everyone on a trip can suggest additions." Shown to a
// trip's members (not the owner, who can just add directly). Fetches the
// trip's date range and that country's published attractions/events
// lazily, only once this form is actually opened.

interface PickableItem { kind: string; name: string; slug: string }

function formatDay(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function SuggestAdditionForm({ tripId, onClose, onSuggested }: { tripId: string; onClose: () => void; onSuggested: () => void }) {
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState<string[]>([])
  const [items, setItems] = useState<PickableItem[]>([])
  const [date, setDate] = useState('')
  const [selected, setSelected] = useState<PickableItem | null>(null)
  const [query, setQuery] = useState('')
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    fetch(`/api/user/trips/${tripId}/suggest`)
      .then(r => r.json())
      .then(data => {
        setDays(data.days ?? [])
        setItems(data.items ?? [])
        setDate((data.days ?? [])[0] ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [tripId])

  const filtered = items.filter(i => !query || i.name.toLowerCase().includes(query.toLowerCase())).slice(0, 20)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !selected) { setError('Pick a day and an item.'); return }
    setSending(true)
    setError('')
    try {
      const res = await fetch(`/api/user/trips/${tripId}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, kind: selected.kind, slug: selected.slug, note: note.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Could not send that suggestion.'); setSending(false); return }
      setSent(true)
      onSuggested()
    } catch {
      setError('Could not send that suggestion.')
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl p-5 mt-3">
        <p className="font-sans text-sm text-moss-600 dark:text-moss-300 mb-3">Suggestion sent: the trip owner will see it for approval.</p>
        <button type="button" onClick={onClose} className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">Done</button>
      </div>
    )
  }

  if (loading) {
    return <div className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl p-5 mt-3 h-24 animate-pulse" />
  }

  return (
    <form onSubmit={handleSubmit} className="bg-sand dark-flip-surf border border-line dark-flip-border rounded-2xl p-5 mt-3 space-y-3">
      <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text">Suggest an addition</p>

      {days.length === 0 ? (
        <p className="font-sans text-sm text-charcoal/45 dark-flip-muted">This trip doesn&rsquo;t have dates set yet.</p>
      ) : (
        <select value={date} onChange={e => setDate(e.target.value)}
          aria-label="Day to add this suggestion to"
          className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text font-sans text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold-400">
          {days.map(d => <option key={d} value={d}>{formatDay(d)}</option>)}
        </select>
      )}

      {selected ? (
        <div className="flex items-center justify-between bg-white dark-flip-card border border-line dark-flip-border rounded-lg px-3 py-2.5">
          <span className="font-sans text-sm text-charcoal dark-flip-text">{selected.name}</span>
          <button type="button" onClick={() => setSelected(null)} className="font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/65 dark-flip-muted hover:text-crimson transition-colors">Change</button>
        </div>
      ) : (
        <>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search attractions and events..."
            className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold-400"/>
          <div className="max-h-40 overflow-y-auto border border-line dark-flip-border rounded-lg divide-y divide-line dark-flip-border">
            {filtered.length === 0 ? (
              <p className="font-sans text-sm text-charcoal/65 dark-flip-muted px-3 py-4 text-center">Nothing published matches yet.</p>
            ) : filtered.map(i => (
              <button key={`${i.kind}-${i.slug}`} type="button" onClick={() => setSelected(i)}
                className="w-full text-left px-3 py-2 hover:bg-white dark-flip-card transition-colors font-sans text-sm text-charcoal dark-flip-text">
                {i.name}
              </button>
            ))}
          </div>
        </>
      )}

      <input type="text" value={note} onChange={e => setNote(e.target.value)} maxLength={300} placeholder="Why this one? (optional)"
        className="w-full border border-line dark-flip-border bg-white dark-flip-card text-charcoal dark-flip-text placeholder-charcoal/30 font-sans text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold-400"/>

      {error && <p className="font-sans text-[14px] text-crimson">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={sending || !selected || !date}
          className="bg-ink hover:bg-charcoal disabled:opacity-50 text-cream font-sans text-[14px] uppercase tracking-[0.12em] px-5 py-2.5 rounded-full transition-colors">
          {sending ? 'Sending...' : 'Suggest it'}
        </button>
        <button type="button" onClick={onClose} className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/50 dark-flip-muted hover:text-charcoal/75 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
