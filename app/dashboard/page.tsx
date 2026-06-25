import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login?next=/dashboard')
  const user = session.user!

  const firstName = (user.name ?? 'Traveller').split(' ')[0]

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl p-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-3">Welcome back</p>
        <h1 className="font-display font-extrabold text-charcoal dark-flip-text mb-2"
          style={{ fontSize: 'clamp(24px, 3vw, 38px)', letterSpacing: '-0.02em', lineHeight: '1' }}>
          {firstName}.
        </h1>
        <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted">
          Your Africa travel hub. Save attractions, plan trips, and track everywhere you want to go.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/dashboard/saved"
          className="bg-ink rounded-3xl p-7 text-cream group hover:scale-[1.01] transition-all">
          <div className="w-10 h-10 rounded-xl bg-gold-400/15 flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <p className="font-display font-bold text-[17px] mb-1" style={{ letterSpacing: '-0.01em' }}>Saved Attractions</p>
          <p className="font-sans text-[12px] text-cream/45">All the places you have marked to visit.</p>
        </Link>

        <Link href="/dashboard/trips"
          className="bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl p-7 group hover:border-crimson transition-all">
          <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center mb-5">
            <svg className="w-5 h-5 text-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
          </div>
          <p className="font-display font-bold text-[17px] text-charcoal dark-flip-text mb-1 group-hover:text-crimson transition-colors" style={{ letterSpacing: '-0.01em' }}>Trip Planner</p>
          <p className="font-sans text-[12px] text-charcoal/45 dark-flip-muted">Build and organise your Africa itineraries.</p>
        </Link>
      </div>

      {/* Profile */}
      <div className="bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl p-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-charcoal/35 dark-flip-muted mb-6">Your Profile</p>
        <div className="flex items-center gap-5">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ''} width={72} height={72}
              className="rounded-full ring-2 ring-gold-400/20 shrink-0"/>
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-crimson/15 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-3xl text-crimson">{(user.name ?? 'U').charAt(0)}</span>
            </div>
          )}
          <div>
            <p className="font-display font-bold text-[18px] text-charcoal dark-flip-text mb-1" style={{ letterSpacing: '-0.012em' }}>
              {user.name}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-charcoal/40 dark-flip-muted">
              {user.email}
            </p>
          </div>
        </div>
        <p className="font-sans text-[12px] text-charcoal/40 dark-flip-muted mt-6 leading-relaxed">
          Profile information is pulled from your Google account. To update your name or photo, update your Google profile.
        </p>
      </div>

      {/* Discover CTA */}
      <div className="relative overflow-hidden rounded-3xl">
        <Image
          src="https://picsum.photos/seed/dashboard-africa-discover/1200/300"
          alt="Discover Africa"
          width={1200} height={300}
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-ink/75 flex items-center px-8">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-400 mb-2">Keep Exploring</p>
            <p className="font-display font-bold text-cream text-lg mb-4" style={{ letterSpacing: '-0.012em' }}>
              Africa has more to show you.
            </p>
            <Link href="/search"
              className="inline-flex items-center gap-2 bg-crimson hover:bg-crimson/90 text-cream font-display font-bold text-[11px] uppercase tracking-[0.1em] px-6 py-2.5 rounded-full transition-all">
              Browse All Attractions
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
