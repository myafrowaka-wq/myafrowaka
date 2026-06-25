import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

const NAV_ITEMS = [
  { label: 'Overview',           href: '/dashboard',        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Saved Attractions',  href: '/dashboard/saved',  icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  { label: 'Trip Planner',       href: '/dashboard/trips',  icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login?next=/dashboard')

  const user = session.user!

  return (
    <div className="min-h-screen bg-sand dark-flip-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-12 items-start">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-4">

            {/* User card */}
            <div className="bg-ink rounded-3xl p-6 text-cream">
              <div className="flex items-center gap-4 mb-5">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name ?? 'User'}
                    width={52} height={52}
                    className="rounded-full shrink-0 ring-2 ring-gold-400/30"
                  />
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full bg-crimson/20 flex items-center justify-center shrink-0">
                    <span className="font-display font-bold text-xl text-crimson">
                      {(user.name ?? 'U').charAt(0)}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display font-bold text-[15px] truncate" style={{ letterSpacing: '-0.01em' }}>
                    {user.name}
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-cream/40 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <form action="/api/auth/signout" method="POST">
                <button type="submit"
                  className="w-full font-mono text-[9px] uppercase tracking-[0.14em] text-cream/35 hover:text-cream/70 transition-colors py-2 border border-cream/10 hover:border-cream/25 rounded-xl">
                  Sign Out
                </button>
              </form>
            </div>

            {/* Nav */}
            <nav className="bg-cream dark-flip-card border border-line dark-flip-border rounded-3xl p-3">
              {NAV_ITEMS.map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl font-sans text-[13px] text-charcoal/65 dark-flip-muted hover:bg-sand dark-flip-surf hover:text-charcoal dark-flip-text transition-all group">
                  <svg className="w-4 h-4 shrink-0 text-charcoal/30 group-hover:text-gold-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon}/>
                  </svg>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Back to site */}
            <Link href="/search"
              className="flex items-center gap-2 justify-center font-mono text-[9px] uppercase tracking-[0.14em] text-charcoal/30 dark-flip-muted hover:text-charcoal/60 transition-colors py-3">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Browse Attractions
            </Link>
          </aside>

          {/* Main */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
