'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { UserRole } from '@/types/next-auth'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NavItem {
  id: string
  label: string
  href: string
  minRole: UserRole | null
  badge?: string | number
  icon: ReactNode
}

interface Props {
  role: UserRole
  userName: string
  userEmail: string
  initials: string
  savedCount: number
  signOutAction: () => Promise<void>
}

// ── Role order ─────────────────────────────────────────────────────────────────

const ROLE_ORDER: UserRole[] = ['visitor', 'subscriber', 'moderator', 'contributor', 'author-editor', 'admin']

function atLeast(userRole: UserRole, minRole: UserRole): boolean {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(minRole)
}

const ROLE_META: Record<string, { label: string; color: string }> = {
  subscriber:      { label: 'Subscriber',   color: 'bg-white/10 text-cream/70'      },
  moderator:       { label: 'Moderator',    color: 'bg-purple-500/20 text-purple-300' },
  contributor:     { label: 'Contributor',  color: 'bg-gold-400/20 text-gold-300'   },
  'author-editor': { label: 'Author',       color: 'bg-gold-400/30 text-gold-200'   },
  admin:           { label: 'Admin',        color: 'bg-crimson/30 text-crimson-300' },
  visitor:         { label: 'Visitor',      color: 'bg-white/8 text-cream/50'       },
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const icons = {
  overview: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>
  ),
  saved: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
  ),
  corrections: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  ),
  submit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 4v16m8-8H4"/>
    </svg>
  ),
  articles: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
    </svg>
  ),
  signout: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardSidebar({ role, userName, userEmail, initials, savedCount, signOutAction }: Props) {
  const rm = ROLE_META[role] ?? ROLE_META.subscriber

  const navItems: NavItem[] = [
    { id: 'overview',     label: 'Overview',          href: '#overview',     minRole: null,            icon: icons.overview,     badge: undefined       },
    { id: 'saved',        label: 'Saved Attractions', href: '#saved',        minRole: null,            icon: icons.saved,        badge: savedCount > 0 ? savedCount : undefined },
    { id: 'corrections',  label: 'Corrections',       href: '#corrections',  minRole: 'moderator',     icon: icons.corrections,  badge: undefined       },
    { id: 'submit',       label: 'Submit',            href: '#submit',       minRole: 'contributor',   icon: icons.submit,       badge: undefined       },
    { id: 'articles',     label: 'Articles',          href: '#articles',     minRole: 'author-editor', icon: icons.articles,     badge: undefined       },
    { id: 'users',        label: 'Users',             href: '#users',        minRole: 'admin',         icon: icons.users,        badge: undefined       },
  ]

  const visibleItems = navItems.filter(item =>
    item.minRole === null || atLeast(role, item.minRole)
  )

  return (
    <>
      {/* ── Mobile: horizontal scrollable pill bar ──────────────────── */}
      <div className="lg:hidden bg-ink border-b border-white/8">
        <div className="flex gap-1.5 overflow-x-auto px-4 py-3 scrollbar-hide">
          {visibleItems.map(item => (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center gap-1.5 shrink-0 bg-white/8 hover:bg-white/14 text-cream/65 hover:text-cream border border-white/10 font-mono text-[8px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full transition-all"
            >
              <span className="w-3 h-3 text-gold-400">{item.icon}</span>
              {item.label}
              {item.badge != null && (
                <span className="bg-crimson text-cream text-[7px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>

      {/* ── Desktop: vertical sidebar ───────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-ink min-h-screen sticky top-0 self-start h-screen overflow-y-auto">

        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-white/8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
              <Image src="/icon.png" alt="MyAfroWaka" width={28} height={28} className="w-full h-full object-cover"/>
            </div>
            <div>
              <p className="font-display font-bold text-cream text-[13px] leading-none group-hover:text-gold-300 transition-colors" style={{ letterSpacing: '-0.015em' }}>
                MyAfroWaka
              </p>
              <p className="font-mono text-[7px] uppercase tracking-[0.18em] text-cream/30 mt-0.5">Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5">
          <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-cream/20 px-2 mb-3">Navigation</p>
          <div className="space-y-0.5">
            {visibleItems.map(item => (
              <a
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-white/8 text-cream/55 hover:text-cream transition-all"
              >
                <span className="w-4 h-4 text-cream/35 group-hover:text-gold-400 transition-colors shrink-0">
                  {item.icon}
                </span>
                <span className="font-sans text-[13px] flex-1">{item.label}</span>
                {item.badge != null && (
                  <span className="bg-crimson text-cream font-mono text-[8px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-white/8 my-5"/>
          <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-cream/20 px-2 mb-3">Browse</p>
          <div className="space-y-0.5">
            {[
              { label: 'All Attractions', href: '/search' },
              { label: 'Travel Guides',   href: '/guides' },
              { label: 'The Journal',     href: '/blog'   },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-white/8 text-cream/40 hover:text-cream/70 transition-all"
              >
                <span className="font-sans text-[12px]">{link.label}</span>
              </Link>
            ))}
          </div>

          {atLeast(role, 'admin') && (
            <>
              <div className="border-t border-white/8 my-5"/>
              <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-crimson/50 px-2 mb-3">Admin</p>
              <div className="space-y-0.5">
                {[
                  { label: 'New Article',    href: '/user-dashboard/admin/new-post'       },
                  { label: 'Add Attraction', href: '/user-dashboard/admin/new-attraction' },
                  { label: 'Sanity Studio',  href: '/studio'                              },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-crimson/10 text-cream/40 hover:text-crimson/80 transition-all"
                  >
                    <span className="font-sans text-[12px]">{link.label}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* User card */}
        <div className="px-3 pb-5 border-t border-white/8 pt-4">
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gold-400/20 border border-gold-400/25 flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-gold-300 text-[11px]">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-cream text-[12px] truncate" style={{ letterSpacing: '-0.01em' }}>
                  {userName || 'User'}
                </p>
                <p className="font-mono text-[9px] text-cream/30 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Role badge */}
            <span className={`inline-block font-mono text-[8px] uppercase tracking-[0.14em] px-2.5 py-1 rounded-full mb-3 ${rm.color}`}>
              {rm.label}
            </span>

            {/* Sign out */}
            <form action={signOutAction}>
              <button type="submit"
                className="w-full flex items-center gap-2 text-cream/35 hover:text-cream/70 transition-colors group py-1">
                <span className="w-4 h-4 group-hover:text-crimson transition-colors">{icons.signout}</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em]">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
