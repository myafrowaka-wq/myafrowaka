'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const REGIONS = [
  { name: 'East Africa',          href: '/search?region=East+Africa',          color: '#3F6A3D' },
  { name: 'West Africa',          href: '/search?region=West+Africa',          color: '#B55D39' },
  { name: 'North Africa',         href: '/search?region=North+Africa',         color: '#A22E29' },
  { name: 'Southern Africa',      href: '/search?region=Southern+Africa',      color: '#29251A' },
  { name: 'Central Africa',       href: '/search?region=Central+Africa',       color: '#B28E38' },
  { name: 'Indian Ocean Islands', href: '/search?region=Indian+Ocean+Islands', color: '#3B403E' },
]

const EXPERIENCES = [
  { label: 'Safari Adventures',    href: '/search?q=safari',    icon: '🦁' },
  { label: 'Cultural Experiences', href: '/search?q=culture',   icon: '🏛️' },
  { label: 'Beach Getaways',       href: '/search?q=beach',     icon: '🏖️' },
  { label: 'Food & Drinks',        href: '/search?q=food',      icon: '🍲' },
  { label: 'Historical Sites',     href: '/search?q=history',   icon: '🏺' },
  { label: 'Hiking & Nature',      href: '/search?q=hiking',    icon: '🥾' },
]

type DropdownKey = 'destinations' | 'experiences' | null

export default function Nav() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [dropdown,    setDropdown]    = useState<DropdownKey>(null)
  const [mobileExp,   setMobileExp]   = useState(false)
  const [mobileDest,  setMobileDest]  = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setDropdown(null)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const toggleDropdown = (key: DropdownKey) =>
    setDropdown(prev => (prev === key ? null : key))

  const close = () => { setDropdown(null); setMobileOpen(false) }

  const linkCls = 'flex items-center gap-1 px-3 py-2 font-sans text-[13px] text-charcoal/70 hover:text-charcoal transition-colors rounded-lg hover:bg-sand/60 whitespace-nowrap'
  const chevron = (open: boolean) => (
    <svg
      className={`w-3 h-3 text-charcoal/40 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-cream/98 backdrop-blur-md shadow-[0_1px_0_0_#D9CDB6]'
          : 'bg-cream border-b border-line'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="shrink-0" onClick={close}>
          <Image
            src="/logo.png"
            alt="MyAfroWaka — Africa Explained by Africans"
            width={180}
            height={47}
            priority
            className="h-9 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">

          {/* Destinations */}
          <div className="relative">
            <button onClick={() => toggleDropdown('destinations')} className={linkCls}>
              Destinations {chevron(dropdown === 'destinations')}
            </button>
            {dropdown === 'destinations' && (
              <div
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-line rounded-2xl py-3 z-50"
                style={{ boxShadow: 'var(--shadow-lift)' }}
              >
                <p className="px-4 pb-2 font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/35">
                  Browse by Region
                </p>
                {REGIONS.map(r => (
                  <Link
                    key={r.name} href={r.href} onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-sans text-charcoal/70 hover:text-charcoal hover:bg-cream transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </Link>
                ))}
                <div className="mx-4 mt-2 pt-2 border-t border-line">
                  <Link
                    href="/search" onClick={close}
                    className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-600 hover:text-ochre-700 transition-colors"
                  >
                    View all 557 attractions &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Experiences */}
          <div className="relative">
            <button onClick={() => toggleDropdown('experiences')} className={linkCls}>
              Experiences {chevron(dropdown === 'experiences')}
            </button>
            {dropdown === 'experiences' && (
              <div
                className="absolute top-full left-0 mt-2 w-56 bg-white border border-line rounded-2xl py-3 z-50"
                style={{ boxShadow: 'var(--shadow-lift)' }}
              >
                {EXPERIENCES.map(e => (
                  <Link
                    key={e.label} href={e.href} onClick={close}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-sans text-charcoal/70 hover:text-charcoal hover:bg-cream transition-colors"
                  >
                    <span className="text-base">{e.icon}</span>
                    {e.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/search"  onClick={close} className={linkCls}>Plan Your Trip</Link>
          <Link href="/about"   onClick={close} className={linkCls}>About Us</Link>
          <Link href="/contact" onClick={close} className={linkCls}>Contact</Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/search"
            className="hidden lg:flex p-2 text-charcoal/50 hover:text-charcoal transition-colors rounded-lg hover:bg-sand/60"
            aria-label="Search"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <Link
            href="/search"
            className="hidden lg:inline-flex items-center bg-crimson hover:bg-crimson-600 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.12em] px-5 py-2.5 rounded-full transition-colors whitespace-nowrap"
          >
            Plan a Trip
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden p-2 text-charcoal rounded-lg hover:bg-sand/60"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-line bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">

            {/* Destinations accordion */}
            <button
              onClick={() => setMobileDest(v => !v)}
              className="w-full flex items-center justify-between px-3 py-3.5 font-sans text-sm text-charcoal/80 border-b border-line/50"
            >
              <span>Destinations</span>
              {chevron(mobileDest)}
            </button>
            {mobileDest && (
              <div className="py-1.5 border-b border-line/50">
                {REGIONS.map(r => (
                  <Link
                    key={r.name} href={r.href} onClick={close}
                    className="flex items-center gap-3 px-5 py-2.5 font-sans text-sm text-charcoal/60 hover:text-ochre-600"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    {r.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Experiences accordion */}
            <button
              onClick={() => setMobileExp(v => !v)}
              className="w-full flex items-center justify-between px-3 py-3.5 font-sans text-sm text-charcoal/80 border-b border-line/50"
            >
              <span>Experiences</span>
              {chevron(mobileExp)}
            </button>
            {mobileExp && (
              <div className="py-1.5 border-b border-line/50">
                {EXPERIENCES.map(e => (
                  <Link
                    key={e.label} href={e.href} onClick={close}
                    className="flex items-center gap-3 px-5 py-2.5 font-sans text-sm text-charcoal/60 hover:text-ochre-600"
                  >
                    <span>{e.icon}</span>{e.label}
                  </Link>
                ))}
              </div>
            )}

            <Link href="/search"  onClick={close} className="flex px-3 py-3.5 font-sans text-sm text-charcoal/80 border-b border-line/50">Plan Your Trip</Link>
            <Link href="/about"   onClick={close} className="flex px-3 py-3.5 font-sans text-sm text-charcoal/80 border-b border-line/50">About Us</Link>
            <Link href="/contact" onClick={close} className="flex px-3 py-3.5 font-sans text-sm text-charcoal/80 border-b border-line/50">Contact</Link>

            <div className="py-4">
              <Link
                href="/search" onClick={close}
                className="block text-center bg-crimson hover:bg-crimson-600 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.12em] py-3.5 rounded-full transition-colors"
              >
                Plan a Trip
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
