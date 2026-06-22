'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'

// ─── mega menu data ──────────────────────────────────────────────────────────

const DESTINATIONS_MEGA = [
  {
    region: 'East Africa',
    color:  '#3F6A3D',
    href:   '/search?region=East+Africa',
    countries: ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda', 'Rwanda'],
  },
  {
    region: 'West Africa',
    color:  '#B55D39',
    href:   '/search?region=West+Africa',
    countries: ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Mali'],
  },
  {
    region: 'North Africa',
    color:  '#A22E29',
    href:   '/search?region=North+Africa',
    countries: ['Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Libya'],
  },
  {
    region: 'Southern Africa',
    color:  '#29251A',
    href:   '/search?region=Southern+Africa',
    countries: ['South Africa', 'Zimbabwe', 'Zambia', 'Botswana', 'Namibia'],
  },
  {
    region: 'Central Africa',
    color:  '#B28E38',
    href:   '/search?region=Central+Africa',
    countries: ['DR Congo', 'Cameroon', 'Gabon', 'Republic of Congo'],
  },
  {
    region: 'Indian Ocean Islands',
    color:  '#3B403E',
    href:   '/search?region=Indian+Ocean+Islands',
    countries: ['Madagascar', 'Mauritius', 'Seychelles', 'Comoros'],
  },
]

const EXPERIENCES_MEGA = [
  { label: 'Safari Adventures',    href: '/search?q=safari',   icon: '🦁' },
  { label: 'Cultural Experiences', href: '/search?q=culture',  icon: '🏛️' },
  { label: 'Beach Getaways',       href: '/search?q=beach',    icon: '🏖️' },
  { label: 'Food & Drinks',        href: '/search?q=food',     icon: '🍲' },
  { label: 'Historical Sites',     href: '/search?q=history',  icon: '🏺' },
  { label: 'Hiking & Nature',      href: '/search?q=hiking',   icon: '🥾' },
  { label: 'City Escapes',         href: '/search?q=city',     icon: '🏙️' },
  { label: 'Wildlife & Nature',    href: '/search?q=wildlife', icon: '🐘' },
]

const MEDIA_MEGA = [
  { label: 'Destination Guides',   href: '/search',            icon: '📖' },
  { label: 'Heritage & Culture',   href: '/search?q=culture',  icon: '🏛️' },
  { label: 'Safari Reports',       href: '/search?q=safari',   icon: '🦒' },
  { label: 'Travel Planning Tips', href: '/about',             icon: '✈️' },
]

const LANGUAGES = [
  { code: 'EN', label: 'English',    flag: '🇬🇧' },
  { code: 'FR', label: 'Français',   flag: '🇫🇷' },
  { code: 'PT', label: 'Português',  flag: '🇵🇹' },
  { code: 'SW', label: 'Kiswahili',  flag: '🇰🇪' },
  { code: 'AR', label: 'عربي',       flag: '🇪🇬' },
]

type Dropdown = 'destinations' | 'experiences' | 'media' | 'lang' | 'mobile-dest' | 'mobile-exp' | null

// ─── theme toggle ────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle dark mode"
      className="w-8 h-8 rounded-full flex items-center justify-center text-cream/70 hover:text-cream hover:bg-white/10 transition-colors"
    >
      {theme === 'dark' ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 001.06 1.06l1.59-1.59a.75.75 0 00-1.061-1.061l-1.59 1.59z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd"/>
        </svg>
      )}
    </button>
  )
}

// ─── component ───────────────────────────────────────────────────────────────

export default function Nav() {
  const [open, setOpen]         = useState<Dropdown>(null)
  const [mobileOpen, setMobile] = useState(false)
  const [lang, setLang]         = useState('EN')
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpen(null)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const toggle = (key: Dropdown) => setOpen(p => p === key ? null : key)
  const close  = () => { setOpen(null); setMobile(false) }

  const chevron = (up: boolean) => (
    <svg className={`w-3 h-3 transition-transform duration-150 ${up ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )

  /* Nav item class (white text on dark bg) */
  const ni = 'flex items-center gap-1 px-3 py-2 text-[13px] font-sans text-cream/75 hover:text-cream transition-colors rounded-lg hover:bg-white/8 whitespace-nowrap'

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50"
      style={{ backgroundColor: '#1C3D20' }}
    >
      {/* ── Main bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[66px] flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" onClick={close} className="shrink-0">
          <Image
            src="/logo.png"
            alt="MyAfroWaka"
            width={176}
            height={46}
            priority
            className="h-9 w-auto brightness-0 invert"
          />
        </Link>

        {/* Desktop nav items */}
        <nav className="hidden lg:flex items-center gap-0.5">

          {/* DESTINATIONS */}
          <div className="relative">
            <button onClick={() => toggle('destinations')} className={ni}>
              Destinations {chevron(open === 'destinations')}
            </button>
          </div>

          {/* EXPERIENCES */}
          <div className="relative">
            <button onClick={() => toggle('experiences')} className={ni}>
              Experiences {chevron(open === 'experiences')}
            </button>
          </div>

          <Link href="/search"  onClick={close} className={ni}>Plan Your Trip</Link>

          {/* MEDIA */}
          <div className="relative">
            <button onClick={() => toggle('media')} className={ni}>
              Media {chevron(open === 'media')}
            </button>
          </div>

          <Link href="/about"   onClick={close} className={ni}>About Us</Link>
          <Link href="/contact" onClick={close} className={ni}>Contact</Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Search */}
          <Link href="/search"
            className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-cream/65 hover:text-cream hover:bg-white/10 transition-colors"
            aria-label="Search">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Language switcher */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => toggle('lang')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-mono text-cream/65 hover:text-cream hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
              </svg>
              {lang}
              {chevron(open === 'lang')}
            </button>
            {open === 'lang' && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-[#211E17] border border-line dark:border-white/10 rounded-2xl py-2 shadow-[var(--shadow-lift)]">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setOpen(null) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-sans hover:bg-cream dark:hover:bg-white/5 transition-colors ${lang === l.code ? 'text-ochre-600 font-medium' : 'text-charcoal dark:text-cream/75'}`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && (
                      <svg className="w-3.5 h-3.5 ml-auto text-ochre-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </button>
                ))}
                {lang !== 'EN' && (
                  <p className="mx-4 mt-2 pt-2 border-t border-line dark:border-white/10 font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/35 dark:text-cream/30">
                    Translations coming soon
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <div className="hidden lg:flex">
            <ThemeToggle />
          </div>

          {/* Plan a Trip CTA */}
          <Link
            href="/search"
            className="hidden lg:inline-flex items-center bg-crimson hover:bg-crimson-600 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.14em] px-5 py-2.5 rounded-full transition-colors whitespace-nowrap ml-2"
          >
            Plan a Trip
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobile(v => !v)}
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-cream hover:bg-white/10 transition-colors ml-1"
            aria-label="Menu"
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

      {/* ══ MEGA MENU — DESTINATIONS ══════════════════════════════════ */}
      {open === 'destinations' && (
        <div
          className="absolute top-full left-0 w-full bg-white dark:bg-[#1A1813] border-b border-line dark:border-white/10"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-7 gap-6">

              {/* 6 region columns */}
              {DESTINATIONS_MEGA.map(r => (
                <div key={r.region} className="col-span-1">
                  <Link
                    href={r.href} onClick={close}
                    className="flex items-center gap-2 mb-3 group"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/50 dark:text-cream/45 group-hover:text-ochre-600 transition-colors">
                      {r.region}
                    </span>
                  </Link>
                  <ul className="space-y-1.5">
                    {r.countries.map(c => (
                      <li key={c}>
                        <Link
                          href={`/search?q=${encodeURIComponent(c)}`}
                          onClick={close}
                          className="text-[13px] font-sans text-charcoal/70 dark:text-cream/65 hover:text-ochre-600 dark:hover:text-ochre-400 transition-colors"
                        >
                          {c}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={r.href} onClick={close}
                        className="text-[11px] font-mono text-ochre-500 hover:text-ochre-600 transition-colors"
                      >
                        All {r.region.split(' ')[0]} &rarr;
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}

              {/* Featured column */}
              <div className="col-span-1 pl-6 border-l border-line dark:border-white/10">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark:text-cream/35 mb-3">
                  Top Pick
                </p>
                <Link href="/search?q=Egypt" onClick={close}
                  className="group block rounded-xl overflow-hidden border border-line dark:border-white/10 hover:border-ochre-300 transition-colors">
                  <div className="relative h-28 bg-sand dark:bg-[#211E17]">
                    <Image
                      src="https://images.unsplash.com/photo-ONVA6s03hg8?auto=format&fit=crop&w=300&h=180&q=80"
                      alt="Pyramids of Giza, Egypt"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm text-charcoal dark:text-cream group-hover:text-ochre-600 transition-colors">Egypt</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-charcoal/40 dark:text-cream/35 mt-0.5">North Africa</p>
                  </div>
                </Link>
                <Link href="/search" onClick={close}
                  className="mt-4 block text-center bg-crimson hover:bg-crimson-600 text-cream font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2.5 rounded-full transition-colors">
                  Browse all 557 attractions
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEGA MENU — EXPERIENCES ════════════════════════════════════ */}
      {open === 'experiences' && (
        <div
          className="absolute top-full left-0 w-full bg-white dark:bg-[#1A1813] border-b border-line dark:border-white/10"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-3 grid grid-cols-4 gap-4">
                {EXPERIENCES_MEGA.map(e => (
                  <Link
                    key={e.label} href={e.href} onClick={close}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-cream dark:hover:bg-white/5 transition-colors border border-transparent hover:border-line dark:hover:border-white/10"
                  >
                    <span className="text-2xl shrink-0">{e.icon}</span>
                    <span className="text-[13px] font-sans text-charcoal/75 dark:text-cream/70 group-hover:text-charcoal dark:group-hover:text-cream transition-colors leading-tight">
                      {e.label}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="pl-6 border-l border-line dark:border-white/10">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark:text-cream/35 mb-3">
                  Featured Experience
                </p>
                <Link href="/search?q=safari" onClick={close}
                  className="group block rounded-xl overflow-hidden border border-line dark:border-white/10 hover:border-ochre-300 transition-colors">
                  <div className="relative h-32 bg-sand dark:bg-[#211E17]">
                    <Image
                      src="https://images.unsplash.com/photo-kjOBqwMUnWw?auto=format&fit=crop&w=300&h=200&q=80"
                      alt="Hot air balloon safari over African savannah"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm text-charcoal dark:text-cream group-hover:text-ochre-600 transition-colors">Safari Adventures</p>
                    <p className="font-sans text-[11px] text-charcoal/45 dark:text-cream/40 mt-0.5">East & Southern Africa</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEGA MENU — MEDIA ══════════════════════════════════════════ */}
      {open === 'media' && (
        <div
          className="absolute top-full left-0 w-full bg-white dark:bg-[#1A1813] border-b border-line dark:border-white/10"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-5 gap-8">
              <div className="col-span-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark:text-cream/35 mb-4">
                  Explore Our Content
                </p>
                <div className="space-y-2">
                  {MEDIA_MEGA.map(m => (
                    <Link
                      key={m.label} href={m.href} onClick={close}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-cream dark:hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-[13px] font-sans text-charcoal/75 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream transition-colors">
                        {m.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="col-span-3 pl-8 border-l border-line dark:border-white/10">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-charcoal/40 dark:text-cream/35 mb-4">
                  Latest Published
                </p>
                <div className="space-y-3">
                  {[
                    { title: 'Pyramids of Giza: The Complete Guide', tag: 'North Africa', slug: 'pyramids-of-giza' },
                    { title: 'Bwindi Impenetrable Forest: Mountain Gorilla Guide', tag: 'East Africa', slug: 'bwindi-impenetrable-national-park' },
                    { title: 'Table Mountain: Everything You Need to Know', tag: 'Southern Africa', slug: 'table-mountain' },
                  ].map(a => (
                    <Link
                      key={a.title} href={`/attractions/${a.slug}`} onClick={close}
                      className="flex items-start gap-3 group"
                    >
                      <div className="shrink-0 w-1 h-12 bg-ochre-300 rounded-full mt-1" />
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-ochre-500 mb-0.5">{a.tag}</p>
                        <p className="text-[13px] font-sans text-charcoal/75 dark:text-cream/70 group-hover:text-ochre-600 dark:group-hover:text-ochre-400 transition-colors leading-snug">
                          {a.title}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE DRAWER ══════════════════════════════════════════════ */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/10 bg-[#1C3D20]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">

            <button onClick={() => toggle('mobile-dest')}
              className="w-full flex items-center justify-between px-3 py-3.5 text-sm font-sans text-cream/80 border-b border-white/10">
              <span>Destinations</span>{chevron(open === 'mobile-dest')}
            </button>
            {open === 'mobile-dest' && (
              <div className="py-2 border-b border-white/10">
                {DESTINATIONS_MEGA.map(r => (
                  <Link key={r.region} href={r.href} onClick={close}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-cream/65 hover:text-cream transition-colors">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.region}
                  </Link>
                ))}
              </div>
            )}

            <button onClick={() => toggle('mobile-exp')}
              className="w-full flex items-center justify-between px-3 py-3.5 text-sm font-sans text-cream/80 border-b border-white/10">
              <span>Experiences</span>{chevron(open === 'mobile-exp')}
            </button>
            {open === 'mobile-exp' && (
              <div className="py-2 border-b border-white/10">
                {EXPERIENCES_MEGA.slice(0, 6).map(e => (
                  <Link key={e.label} href={e.href} onClick={close}
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-cream/65 hover:text-cream transition-colors">
                    <span>{e.icon}</span>{e.label}
                  </Link>
                ))}
              </div>
            )}

            {[
              { label: 'Plan Your Trip', href: '/search' },
              { label: 'About Us',       href: '/about'  },
              { label: 'Contact',        href: '/contact'},
            ].map(item => (
              <Link key={item.label} href={item.href} onClick={close}
                className="flex px-3 py-3.5 text-sm font-sans text-cream/80 border-b border-white/10">
                {item.label}
              </Link>
            ))}

            {/* Mobile theme + language */}
            <div className="flex items-center justify-between px-3 py-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <span className="text-cream/50 text-[11px] font-mono">Toggle dark mode</span>
              </div>
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="bg-white/10 text-cream text-[11px] font-mono border border-white/15 rounded-full px-3 py-1.5 focus:outline-none"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="text-charcoal bg-white">
                    {l.flag} {l.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="py-3 pb-4">
              <Link href="/search" onClick={close}
                className="block text-center bg-crimson hover:bg-crimson-600 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.14em] py-3.5 rounded-full transition-colors">
                Plan a Trip
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
