import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { findTripInviteByToken } from '@/lib/tripInvite'
import { Flag } from '@/components/Flag'
import { JoinTripButton } from '@/components/JoinTripButton'

// Session 4.3 — "They click, see the trip, and can join it." Deliberately
// public/viewable while signed out — the plan's decided spec throughout
// Phase 4 has been "no wall at the front door," and someone deciding
// whether to join a friend's trip needs to actually see it first. The
// wall (an account is required) only shows up on the "Join" action itself,
// same shape as the trip planner's "Save this trip".

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Pulled out of the component body: Date.now() is an impure call, and
// React's purity rule flags calling one directly during render (a Server
// Component still renders exactly once per request, but the rule doesn't
// special-case that) — a plain helper function isn't render, so it's fine.
function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now()
}

export const metadata: Metadata = {
  title: 'Join a Trip – MyAfroWaka',
  robots: { index: false, follow: false },
}

export default async function JoinTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await findTripInviteByToken(token)

  if (!invite || !invite.trip) {
    return (
      <div className="min-h-screen bg-cream dark-flip-bg flex items-center justify-center px-5">
        <div className="max-w-md text-center">
          <h1 className="font-display font-bold text-2xl text-charcoal dark-flip-text mb-3">This invite link isn&rsquo;t valid.</h1>
          <p className="font-sans text-sm text-charcoal/55 dark-flip-muted mb-6">It may have been mistyped, or the trip no longer exists.</p>
          <Link href="/plan-a-trip" className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson hover:text-crimson/70 transition-colors">
            Plan your own trip instead &#8594;
          </Link>
        </div>
      </div>
    )
  }

  const expired = isExpired(invite.expiresAt)
  const isUsed = invite.status !== 'pending'
  const trip = invite.trip
  const days = (trip.days ?? []).filter(d => (d.items?.length ?? 0) > 0)
  const totalItems = days.reduce((n, d) => n + (d.items?.length ?? 0), 0)

  return (
    <div className="min-h-screen bg-cream dark-flip-bg">
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-16">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-3">You&rsquo;re Invited</p>
        <div className="flex items-center gap-2.5 mb-2">
          <Flag code={trip.country?.countryCode} className="text-xl" />
          <h1 className="font-display font-extrabold text-charcoal dark-flip-text"
            style={{ fontSize: 'clamp(26px, 4vw, 40px)', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
            {trip.name}
          </h1>
        </div>
        <p className="font-sans text-charcoal/55 dark-flip-muted mb-1">
          {trip.country?.name}
          {(trip.dates?.from || trip.dates?.to) && ` · ${[formatDate(trip.dates?.from), formatDate(trip.dates?.to)].filter(Boolean).join(' to ')}`}
        </p>
        {invite.invitedByName && (
          <p className="font-sans text-sm text-charcoal/45 dark-flip-muted mb-8">
            Invited by {invite.invitedByName}
          </p>
        )}

        {invite.note && (
          <div className="bg-gold-50 dark:bg-gold-900/15 border-l-4 border-gold-400 rounded-xl px-5 py-4 mb-8">
            <p className="font-sans text-sm italic text-charcoal dark-flip-text">&ldquo;{invite.note}&rdquo;</p>
          </div>
        )}

        {days.length === 0 ? (
          <p className="font-sans text-sm text-charcoal/45 dark-flip-muted mb-8">The itinerary is just getting started.</p>
        ) : (
          <div className="space-y-3 mb-8">
            <p className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted">
              {totalItems} item{totalItems !== 1 ? 's' : ''} planned so far
            </p>
            {days.map((day, i) => (
              <div key={day.date ?? i} className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl p-4">
                <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-1.5">{formatDate(day.date)}</p>
                <ul className="space-y-1">
                  {(day.items ?? []).map((item, j) => (
                    <li key={j} className="font-sans text-sm text-charcoal/65 dark-flip-muted flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-charcoal/25 dark-flip-muted shrink-0"/>
                      {item.name ?? 'Untitled'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="bg-ink rounded-2xl p-6">
          {expired ? (
            <p className="font-sans text-sm text-cream/70">This invite link has expired. Ask {invite.invitedByName ?? 'the trip owner'} to send a new one.</p>
          ) : isUsed ? (
            <p className="font-sans text-sm text-cream/70">This invite has already been used.</p>
          ) : (
            <JoinTripButton token={token} />
          )}
        </div>
      </div>
    </div>
  )
}
