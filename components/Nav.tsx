'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const REGIONS = [
  { name: 'East Africa',          href: '/search?region=East+Africa' },
  { name: 'West Africa',          href: '/search?region=West+Africa' },
  { name: 'Southern Africa',      href: '/search?region=Southern+Africa' },
  { name: 'North Africa',         href: '/search?region=North+Africa' },
  { name: 'Central Africa',       href: '/search?region=Central+Africa' },
  { name: 'Indian Ocean Islands', href: '/search?region=Indian+Ocean+Islands' },
]

export default function Nav() {
  const [scrolled,    setScrolled]    = useState(false)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [regionsOpen, setRegionsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setRegionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const linkClass = 'px-3 py-2 font-sans text-sm text-charcoal/70 hover:text-charcoal transition-colors rounded-lg hover:bg-sand/60'

  return (
    <header className={`sticky top-0 z-50 transition-all duration-200 ${
      scrolled
        ? 'bg-cream/98 backdrop-blur-md shadow-[0_1px_0_0_#D9CDB6]'
        : 'bg-cream border-b border-line'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
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
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          <Link href="/search" className={linkClass}>Destinations</Link>

          {/* Regions dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setRegionsOpen(v => !v)}
              className={`${linkClass} flex items-center gap-1`}
            >
              Regions
              <svg
                className={`w-3.5 h-3.5 text-charcoal/40 transition-transform duration-150 ${regionsOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {regionsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white border border-line rounded-2xl py-2 z-50"
                style={{ boxShadow: 'var(--shadow-lift)' }}
              >
                {REGIONS.map(r => (
                  <Link
                    key={r.name}
                    href={r.href}
                    onClick={() => setRegionsOpen(false)}
                    className="block px-4 py-2.5 font-sans text-sm text-charcoal/70 hover:text-ochre-600 hover:bg-cream transition-colors"
                  >
                    {r.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/about"   className={linkClass}>About</Link>
          <Link href="/contact" className={linkClass}>Contact</Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/search"
            className="hidden md:flex p-2 text-charcoal/50 hover:text-charcoal transition-colors rounded-lg hover:bg-sand/60"
            aria-label="Search"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          <Link
            href="/search"
            className="hidden md:inline-flex items-center bg-crimson hover:bg-crimson-600 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.12em] px-5 py-2.5 rounded-full transition-colors whitespace-nowrap"
          >
            Plan a Trip
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 text-charcoal rounded-lg hover:bg-sand/60"
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
        <div className="md:hidden border-t border-line bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
            <Link href="/search" onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-3.5 font-sans text-sm text-charcoal/80 hover:text-charcoal border-b border-line/50"
            >
              Destinations
            </Link>

            <div className="py-1.5 border-b border-line/50">
              <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40">Regions</p>
              {REGIONS.map(r => (
                <Link key={r.name} href={r.href} onClick={() => setMobileOpen(false)}
                  className="block px-5 py-2.5 font-sans text-sm text-charcoal/60 hover:text-ochre-600"
                >
                  {r.name}
                </Link>
              ))}
            </div>

            <Link href="/about" onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-3.5 font-sans text-sm text-charcoal/80 hover:text-charcoal border-b border-line/50"
            >
              About
            </Link>
            <Link href="/contact" onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-3.5 font-sans text-sm text-charcoal/80 hover:text-charcoal border-b border-line/50"
            >
              Contact
            </Link>

            <div className="py-4">
              <Link
                href="/search"
                onClick={() => setMobileOpen(false)}
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
