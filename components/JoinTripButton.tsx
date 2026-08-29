'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useSession } from 'next-auth/react'

// Session 4.3 — "Joining requires an account." Same shape as the trip
// planner's "Save this trip" (Session 4.2): the join action never gates on
// the client's useSession() status directly (it can be stale for a moment
// right after a sign-in redirect — a real bug found and fixed in 4.2), it
// always POSTs and lets the server's real, current auth check decide,
// redirecting to /login only on an actual 401.
export function JoinTripButton({ token }: { token: string }) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  // Deliberately `[]`, not `[updateSession]` — next-auth's SessionProvider
  // recreates its `update` function every time `loading` toggles (it's
  // inside a useMemo keyed on [session, loading]), and update() itself
  // flips loading true→false as it runs. Depending on the function
  // reference would re-fire this effect every time that reference changes,
  // which is every time update() finishes — a real infinite refetch loop,
  // not a hypothetical one. Same one-time-on-mount shape as the equivalent
  // effect in components/TripPlanner.tsx.
  useEffect(() => {
    updateSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleJoin() {
    setJoining(true)
    setError('')
    try {
      const res = await fetch(`/api/trips/join/${token}`, { method: 'POST' })
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/trips/join/${token}`)}`)
        return
      }
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Could not join this trip. Please try again.')
        setJoining(false)
        return
      }
      router.push('/user-dashboard#trips')
    } catch {
      setError('Could not join this trip. Please try again.')
      setJoining(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={handleJoin} disabled={joining}
        className="w-full bg-action hover:bg-action-hover disabled:opacity-60 disabled:cursor-not-allowed text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-4 rounded-xl transition-all">
        {joining ? 'Joining...' : 'Join this trip'}
      </button>
      {error && <p className="font-sans text-[14px] text-crimson mt-3">{error}</p>}
      <p className="font-sans text-[14px] text-cream/45 text-center mt-3 leading-relaxed">
        You&rsquo;ll be asked to sign in first if you haven&rsquo;t already — it&rsquo;s free and takes a moment.
      </p>
    </div>
  )
}
