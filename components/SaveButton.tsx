'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function SaveButton({ slug }: { slug: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (status !== 'authenticated') { setChecked(true); return }
    fetch('/api/user/saved')
      .then(r => r.json())
      .then((data: { saved?: { attractionSlug: string }[] }) => {
        if (data.saved) setSaved(data.saved.some(s => s.attractionSlug === slug))
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [slug, status])

  async function toggle() {
    if (status !== 'authenticated') {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      await fetch('/api/user/saved', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      setSaved(!saved)
    } finally {
      setLoading(false)
    }
  }

  if (!checked) {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-crimson/40 text-cream font-display font-bold text-[12px] uppercase tracking-[0.1em] py-3.5 rounded-xl">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center justify-center gap-2 w-full font-display font-bold text-[12px] uppercase tracking-[0.1em] py-3.5 rounded-xl transition-all disabled:opacity-60 ${
        saved
          ? 'bg-gold-400 text-ink hover:bg-gold-300'
          : 'bg-crimson hover:bg-crimson/90 text-cream'
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
      {loading ? 'Saving...' : saved ? 'Saved' : 'Save Attraction'}
    </button>
  )
}
