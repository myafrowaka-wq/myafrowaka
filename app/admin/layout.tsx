import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

const NAV = [
  { label: 'Overview',    href: '/admin',             icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { label: 'Attractions', href: '/admin/attractions',  icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { label: 'Users',       href: '/admin/users',        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login?next=/admin')

  const role = session.user?.role
  if (role !== 'admin' && role !== 'contributor') redirect('/')

  const user = session.user!

  return (
    <div className="min-h-screen bg-[#0E1C10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 items-start">

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 space-y-3">

            {/* Brand bar */}
            <div className="flex items-center gap-2.5 px-2 mb-6">
              <Image src="/logo-white.png" alt="MyAfroWaka" width={200} height={52} className="h-6 w-auto opacity-70"/>
              <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-cream/30 border border-cream/15 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>

            {/* Nav */}
            <nav className="space-y-0.5">
              {NAV.map(item => {
                if (item.label === 'Users' && role !== 'admin') return null
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans text-[13px] text-cream/50 hover:text-cream hover:bg-white/8 transition-all group">
                    <svg className="w-4 h-4 shrink-0 group-hover:text-gold-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon}/>
                    </svg>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-white/8 pt-3 mt-3 space-y-0.5">
              <Link href="/studio" target="_blank"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans text-[13px] text-cream/35 hover:text-cream/70 hover:bg-white/5 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                Sanity Studio
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans text-[13px] text-cream/35 hover:text-cream/70 hover:bg-white/5 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7"/>
                </svg>
                Back to Site
              </Link>
            </div>

            {/* User */}
            <div className="border-t border-white/8 pt-4 mt-2 flex items-center gap-2.5 px-1">
              {user.image ? (
                <Image src={user.image} alt={user.name ?? ''} width={28} height={28} className="rounded-full shrink-0"/>
              ) : (
                <div className="w-7 h-7 rounded-full bg-crimson/30 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-[11px] text-cream">{(user.name ?? 'U').charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="font-sans text-[11px] text-cream/60 truncate">{user.name}</p>
                <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-gold-400/70">{role}</p>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}
