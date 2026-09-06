'use client'
import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/i18n/navigation'
import { DEFAULT_COLLECTION, normalizeCollectionName } from '@/lib/collections'

type SavedRecord = { attractionSlug: string; collectionName: string }

// Batch 1 (owner's "Honeymoon collection" request, 2026-09-06) — the
// button itself still does exactly what it always did: one click saves
// to General, one click again removes it everywhere, no new friction for
// anyone who never touches collections. The chevron next to it is new —
// it opens a real "save to…" picker (existing collections + make a new
// one), the same pattern Pinterest boards and Kayak's Wishlist use (see
// the UX Overhaul Roadmap artifact, section 5), so the same attraction
// can live in more than one named list at once.
export function SaveButton({ slug }: { slug: string }) {
  const { status } = useSession()
  const router = useRouter()
  const [allSaved, setAllSaved] = useState<SavedRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchDone, setFetchDone] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Derived, not stored — an unauthenticated visitor is "checked" the
  // moment `status` resolves, with no state write needed; only the real
  // fetch for a signed-in user needs to report back asynchronously.
  const checked = status === 'unauthenticated' || fetchDone

  const thisSlugCollections = allSaved.filter(s => s.attractionSlug === slug).map(s => s.collectionName)
  const saved = thisSlugCollections.length > 0
  const allCollectionNames = Array.from(new Set(allSaved.map(s => s.collectionName)))
  if (!allCollectionNames.includes(DEFAULT_COLLECTION)) allCollectionNames.unshift(DEFAULT_COLLECTION)

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/user/saved')
      .then(r => r.json())
      .then((data: { saved?: SavedRecord[] }) => {
        if (data.saved) setAllSaved(data.saved)
        setFetchDone(true)
      })
      .catch(() => setFetchDone(true))
  }, [status])

  useEffect(() => {
    if (!pickerOpen) return
    function onClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [pickerOpen])

  async function toggleDefault() {
    if (status !== 'authenticated') { router.push('/login'); return }
    setLoading(true)
    try {
      if (saved) {
        // Quick-unsave removes every collection this attraction is in —
        // matches the button's own pre-collections behaviour exactly.
        await fetch('/api/user/saved', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        })
        setAllSaved(prev => prev.filter(s => s.attractionSlug !== slug))
      } else {
        await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, collectionName: DEFAULT_COLLECTION }),
        })
        setAllSaved(prev => [...prev, { attractionSlug: slug, collectionName: DEFAULT_COLLECTION }])
      }
    } finally {
      setLoading(false)
    }
  }

  async function toggleCollection(collectionName: string) {
    const inThisOne = thisSlugCollections.includes(collectionName)
    setLoading(true)
    try {
      if (inThisOne) {
        await fetch('/api/user/saved', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, collectionName }),
        })
        setAllSaved(prev => prev.filter(s => !(s.attractionSlug === slug && s.collectionName === collectionName)))
      } else {
        await fetch('/api/user/saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, collectionName }),
        })
        setAllSaved(prev => [...prev, { attractionSlug: slug, collectionName }])
      }
    } finally {
      setLoading(false)
    }
  }

  async function addNewCollection() {
    const name = normalizeCollectionName(newName)
    setNewName('')
    await toggleCollection(name)
  }

  if (!checked) {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-crimson/40 text-cream font-display font-bold text-[14px] uppercase tracking-[0.1em] py-3.5 rounded-xl">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={toggleDefault}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 font-display font-bold text-[14px] uppercase tracking-[0.1em] py-3.5 rounded-xl transition-all disabled:opacity-60 ${
            saved ? 'bg-gold-400 text-ink hover:bg-gold-300' : 'bg-crimson hover:bg-crimson/90 text-cream'
          }`}
        >
          <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          {loading ? 'Saving...' : saved ? 'Saved' : 'Save Attraction'}
        </button>
        <button
          type="button"
          aria-label="Save to a specific collection"
          aria-expanded={pickerOpen}
          onClick={() => {
            if (status !== 'authenticated') { router.push('/login'); return }
            setPickerOpen(o => !o)
          }}
          className={`shrink-0 w-12 flex items-center justify-center rounded-xl border transition-colors ${
            saved ? 'border-gold-400 text-gold-400 hover:bg-gold-400/10' : 'border-crimson text-crimson hover:bg-crimson/10'
          }`}
        >
          <svg className={`w-4 h-4 transition-transform ${pickerOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </div>

      {pickerOpen && (
        <div className="absolute z-30 top-full mt-2 left-0 right-0 bg-white dark-flip-card border border-line dark-flip-border rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] overflow-hidden">
          <p className="px-4 pt-3 pb-2 font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/55 dark-flip-muted">Save to a collection</p>
          <div className="max-h-52 overflow-y-auto">
            {allCollectionNames.map(name => {
              const inIt = thisSlugCollections.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleCollection(name)}
                  disabled={loading}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left font-sans text-[15px] text-charcoal dark-flip-text hover:bg-sand dark-flip-surf transition-colors disabled:opacity-60"
                >
                  <span className="truncate">{name}</span>
                  <span className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center ${inIt ? 'bg-crimson border-crimson text-cream' : 'border-line dark-flip-border'}`}>
                    {inIt && (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-line dark-flip-border">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) addNewCollection() }}
              placeholder="New collection, e.g. Honeymoon"
              maxLength={60}
              className="flex-1 min-w-0 font-sans text-[14px] px-3 py-2 rounded-lg border border-line dark-flip-border bg-transparent text-charcoal dark-flip-text placeholder-charcoal/40 focus:outline-none focus:border-crimson"
            />
            <button
              type="button"
              onClick={addNewCollection}
              disabled={!newName.trim() || loading}
              className="shrink-0 font-sans text-[14px] font-semibold uppercase tracking-[0.06em] text-crimson px-3 py-2 rounded-lg hover:bg-crimson/10 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
