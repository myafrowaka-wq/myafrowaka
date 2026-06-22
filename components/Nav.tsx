'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from 'next-themes'

// ─── data ─────────────────────────────────────────────────────────────────────

const REGIONS = [
  {
    region: 'East Africa', color: '#3F6A3D', href: '/search?region=East+Africa',
    countries: ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda', 'Rwanda', 'Mozambique'],
    image: 'https://picsum.photos/seed/east-africa-nav/400/260',
  },
  {
    region: 'West Africa', color: '#B55D39', href: '/search?region=West+Africa',
    countries: ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Mali', 'Benin'],
    image: 'https://picsum.photos/seed/west-africa-nav/400/260',
  },
  {
    region: 'North Africa', color: '#A22E29', href: '/search?region=North+Africa',
    countries: ['Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Libya'],
    image: 'https://picsum.photos/seed/north-africa-nav/400/260',
  },
  {
    region: 'Southern Africa', color: '#29251A', href: '/search?region=Southern+Africa',
    countries: ['South Africa', 'Zimbabwe', 'Zambia', 'Botswana', 'Namibia'],
    image: 'https://picsum.photos/seed/southern-africa-nav/400/260',
  },
  {
    region: 'Central Africa', color: '#B28E38', href: '/search?region=Central+Africa',
    countries: ['DR Congo', 'Cameroon', 'Gabon', 'Republic of Congo'],
    image: 'https://picsum.photos/seed/central-africa-nav/400/260',
  },
  {
    region: 'Indian Ocean Islands', color: '#3B403E', href: '/search?region=Indian+Ocean+Islands',
    countries: ['Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Zanzibar'],
    image: 'https://picsum.photos/seed/indian-ocean-nav/400/260',
  },
]

const EXPERIENCES = [
  { label: 'Safari Adventures',    href: '/search?q=safari',   icon: '🦁', desc: 'Big Five, Great Migration, private reserves' },
  { label: 'Cultural Experiences', href: '/search?q=culture',  icon: '🏛️', desc: 'Traditions, ceremonies, local life' },
  { label: 'Beach Getaways',       href: '/search?q=beach',    icon: '🏖️', desc: 'Indian Ocean, Atlantic coastlines' },
  { label: 'Food and Drink',       href: '/search?q=food',     icon: '🍲', desc: 'Jollof, tagines, nyama choma' },
  { label: 'Historical Sites',     href: '/search?q=history',  icon: '🏺', desc: 'Ancient kingdoms, World Heritage sites' },
  { label: 'Hiking and Nature',    href: '/search?q=hiking',   icon: '🥾', desc: 'Simien, Rwenzori, Table Mountain' },
  { label: 'City Breaks',          href: '/search?q=city',     icon: '🏙️', desc: 'Nairobi, Cape Town, Accra, Lagos' },
  { label: 'Wildlife',             href: '/search?q=wildlife', icon: '🐘', desc: 'Gorillas, elephants, marine life' },
]

const LANGUAGES = [
  { code: 'EN', label: 'English',   flag: '🇬🇧' },
  { code: 'FR', label: 'Français',  flag: '🇫🇷' },
  { code: 'PT', label: 'Português', flag: '🇵🇹' },
  { code: 'SW', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'AR', label: 'عربي',      flag: '🇪🇬' },
]

type PanelKey = 'destinations' | 'experiences' | 'media' | null

// ─── theme toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 rounded-full flex items-center justify-center text-cream/60 hover:text-cream hover:bg-white/10 transition-all"
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

// ─── component ────────────────────────────────────────────────────────────────

export default function Nav() {
  const [panel, setPanel]         = useState<PanelKey>(null)
  const [langOpen, setLangOpen]   = useState(false)
  const [mobile, setMobile]       = useState(false)
  const [mobileAcc, setMobileAcc] = useState<string | null>(null)
  const [lang, setLang]           = useState('EN')

  const openTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef     = useRef<HTMLElement>(null)

  const hoverOpen  = (key: PanelKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    openTimer.current = setTimeout(() => setPanel(key), 60)
  }
  const hoverClose = () => {
    if (openTimer.current) clearTimeout(openTimer.current)
    closeTimer.current = setTimeout(() => setPanel(null), 180)
  }
  const keepOpen = () => { if (closeTimer.current) clearTimeout(closeTimer.current) }

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setPanel(null); setLangOpen(false); setMobile(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const close = () => { setPanel(null); setLangOpen(false); setMobile(false) }

  const ni = 'flex items-center gap-1 px-3 py-2 text-[13px] font-sans font-medium text-cream/75 hover:text-cream transition-colors rounded-lg hover:bg-white/8 whitespace-nowrap cursor-pointer'

  const chevron = (active: boolean) => (
    <svg className={`w-3 h-3 mt-0.5 transition-transform duration-150 ${active ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  )

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-[#1C3D20]" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.28)' }}>

      {/* ── Main bar ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[66px] flex items-center justify-between gap-4">

        {/* Logo — keep brand colours, no filter */}
        <Link href="/" onClick={close} className="shrink-0">
          <Image src="/logo.png" alt="MyAfroWaka" width={176} height={46} priority className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0">
          <div className="relative" onMouseEnter={() => hoverOpen('destinations')} onMouseLeave={hoverClose}>
            <button className={ni}>Destinations {chevron(panel === 'destinations')}</button>
          </div>
          <div className="relative" onMouseEnter={() => hoverOpen('experiences')} onMouseLeave={hoverClose}>
            <button className={ni}>Experiences {chevron(panel === 'experiences')}</button>
          </div>
          <Link href="/search" onClick={close} className={ni}>Plan a Trip</Link>
          <div className="relative" onMouseEnter={() => hoverOpen('media')} onMouseLeave={hoverClose}>
            <button className={ni}>Guides {chevron(panel === 'media')}</button>
          </div>
          <Link href="/about"   onClick={close} className={ni}>About</Link>
          <Link href="/contact" onClick={close} className={ni}>Contact</Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1 shrink-0">
          <Link href="/search" aria-label="Search"
            className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-cream/60 hover:text-cream hover:bg-white/10 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </Link>

          {/* Language */}
          <div className="hidden lg:block relative">
            <button onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono text-cream/60 hover:text-cream hover:bg-white/10 rounded-full transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"/>
              </svg>
              {lang} {chevron(langOpen)}
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-[#1E1B14] border border-line dark:border-white/10 rounded-2xl py-2 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-sans hover:bg-cream dark:hover:bg-white/5 transition-colors ${lang === l.code ? 'text-ochre-600 font-medium' : 'text-charcoal/70 dark:text-cream/65'}`}>
                    <span>{l.flag}</span><span>{l.label}</span>
                    {lang === l.code && <svg className="w-3.5 h-3.5 ml-auto text-ochre-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </button>
                ))}
                {lang !== 'EN' && <p className="mx-4 mt-2 pt-2 border-t border-line dark:border-white/10 font-mono text-[9px] uppercase tracking-[0.12em] text-charcoal/30">Translation coming soon</p>}
              </div>
            )}
          </div>

          <div className="hidden lg:flex"><ThemeToggle /></div>

          <Link href="/search" onClick={close}
            className="hidden lg:inline-flex items-center bg-crimson hover:bg-crimson-600 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.13em] px-5 py-2.5 rounded-full transition-colors ml-2 whitespace-nowrap">
            Plan a Trip
          </Link>

          <button onClick={() => setMobile(v => !v)} aria-label="Menu"
            className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-cream hover:bg-white/10 transition-colors ml-1">
            {mobile ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* ══ MEGA — DESTINATIONS ══════════════════════════════════════════════ */}
      {panel === 'destinations' && (
        <div
          className="absolute top-full left-0 w-full bg-white dark:bg-[#181510] border-b border-line dark:border-white/8 mega-panel"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
          onMouseEnter={keepOpen} onMouseLeave={hoverClose}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-12 gap-8">

              {/* 6 region columns */}
              <div className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-6">
                {REGIONS.map(r => (
                  <div key={r.region}>
                    <Link href={r.href} onClick={close} className="group flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}/>
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/40 dark:text-cream/35 group-hover:text-ochre-600 transition-colors">{r.region}</span>
                    </Link>
                    <ul className="space-y-2">
                      {r.countries.map(c => (
                        <li key={c}>
                          <Link href={`/search?q=${encodeURIComponent(c)}`} onClick={close}
                            className="text-[13px] font-sans text-charcoal/65 dark:text-cream/60 hover:text-ochre-600 dark:hover:text-ochre-400 transition-colors">
                            {c}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={r.href} onClick={close} className="text-[11px] font-mono text-ochre-500 hover:text-ochre-600 transition-colors mt-0.5 inline-block">
                          More &rarr;
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>

              {/* Featured */}
              <div className="col-span-3 border-l border-line dark:border-white/8 pl-8 flex flex-col">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/35 dark:text-cream/30 mb-4">Featured</p>
                <Link href="/search?q=Egypt" onClick={close} className="group relative rounded-2xl overflow-hidden flex-1 min-h-[200px] block">
                  <Image src="https://picsum.photos/seed/egypt-mega-feat/400/280" alt="Egypt" fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold-400 mb-1">North Africa</p>
                    <p className="font-display text-lg text-cream leading-tight">Egypt</p>
                    <p className="font-sans text-[11px] text-cream/55 mt-0.5">14 verified guides</p>
                  </div>
                </Link>
                <Link href="/search" onClick={close}
                  className="mt-4 block text-center bg-crimson hover:bg-crimson-600 text-cream font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-3 rounded-xl transition-colors">
                  All 557 attractions &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEGA — EXPERIENCES ═══════════════════════════════════════════════ */}
      {panel === 'experiences' && (
        <div
          className="absolute top-full left-0 w-full bg-white dark:bg-[#181510] border-b border-line dark:border-white/8 mega-panel"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
          onMouseEnter={keepOpen} onMouseLeave={hoverClose}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-8 grid grid-cols-4 gap-3">
                {EXPERIENCES.map(e => (
                  <Link key={e.label} href={e.href} onClick={close}
                    className="group flex items-start gap-3 p-3 rounded-xl hover:bg-cream dark:hover:bg-white/5 border border-transparent hover:border-line dark:hover:border-white/8 transition-colors">
                    <span className="text-2xl mt-0.5 shrink-0">{e.icon}</span>
                    <div>
                      <p className="text-[13px] font-sans font-medium text-charcoal/80 dark:text-cream/75 group-hover:text-ochre-600 dark:group-hover:text-ochre-400 transition-colors leading-tight">{e.label}</p>
                      <p className="font-sans text-[11px] text-charcoal/40 dark:text-cream/35 mt-1 leading-snug">{e.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="col-span-4 border-l border-line dark:border-white/8 pl-8">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-charcoal/35 dark:text-cream/30 mb-4">Top Experience</p>
                <Link href="/search?q=safari" onClick={close} className="group relative block rounded-2xl overflow-hidden h-48 mb-4">
                  <Image src="https://picsum.photos/seed/safari-mega-feat/400/300" alt="Safari" fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"/>
                  <div className="absolute bottom-0 p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold-400 mb-1">Most Popular</p>
                    <p className="font-display text-base text-cream">Safari Adventures</p>
                  </div>
                </Link>
                <p className="font-sans text-[12px] text-charcoal/50 dark:text-cream/40 leading-relaxed">
                  From dawn game drives in the Maasai Mara to gorilla treks in Bwindi, Africa&apos;s wildlife is unlike anywhere else.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEGA — GUIDES ════════════════════════════════════════════════════ */}
      {panel === 'media' && (
        <div
          className="absolute top-full left-0 w-full bg-white dark:bg-[#181510] border-b border-line dark:border-white/8 mega-panel"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
          onMouseEnter={keepOpen} onMouseLeave={hoverClose}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="grid grid-cols-3 gap-6">
              {[
                { title: 'Pyramids of Giza: The Complete Guide', tag: 'Egypt', slug: 'pyramids-of-giza', img: 'https://picsum.photos/seed/giza-mega-guide/280/180' },
                { title: 'Bwindi: Mountain Gorilla Trekking Guide', tag: 'Uganda', slug: 'bwindi-impenetrable-national-park', img: 'https://picsum.photos/seed/bwindi-mega-guide/280/180' },
                { title: 'Table Mountain: Cape Town Complete Guide', tag: 'South Africa', slug: 'table-mountain', img: 'https://picsum.photos/seed/table-mtn-mega/280/180' },
              ].map(a => (
                <Link key={a.slug} href={`/attractions/${a.slug}`} onClick={close}
                  className="group flex gap-4 p-3 rounded-xl hover:bg-cream dark:hover:bg-white/5 transition-colors">
                  <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={a.img} alt={a.title} fill className="object-cover"/>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-ochre-500 mb-1">{a.tag}</p>
                    <p className="text-[13px] font-sans text-charcoal/75 dark:text-cream/70 group-hover:text-ochre-600 dark:group-hover:text-ochre-400 transition-colors leading-snug">{a.title}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-line dark:border-white/8 flex justify-between items-center">
              <p className="font-sans text-sm text-charcoal/40 dark:text-cream/35">557 destination guides, written by Africans.</p>
              <Link href="/search" onClick={close} className="font-mono text-[10px] uppercase tracking-[0.12em] text-ochre-500 hover:text-ochre-600 transition-colors">
                Browse all &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE DRAWER ════════════════════════════════════════════════════ */}
      {mobile && (
        <div className="lg:hidden border-t border-white/10 bg-[#172F19] max-h-[80vh] overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Mobile search */}
            <form action="/search" method="GET" className="py-4">
              <div className="flex bg-white/10 rounded-xl overflow-hidden">
                <input name="q" type="search" placeholder="Search destinations..."
                  className="flex-1 bg-transparent text-cream placeholder-cream/35 text-sm font-sans px-4 py-3 focus:outline-none"/>
                <button type="submit" className="px-4 text-cream/60">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </div>
            </form>

            {/* Accordion */}
            {[
              {
                key: 'destinations', label: 'Destinations',
                children: REGIONS.map(r => (
                  <Link key={r.region} href={r.href} onClick={close}
                    className="flex items-center gap-3 pl-6 pr-4 py-3 text-sm text-cream/60 hover:text-cream transition-colors border-b border-white/5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }}/>{r.region}
                  </Link>
                )),
              },
              {
                key: 'experiences', label: 'Experiences',
                children: EXPERIENCES.slice(0, 6).map(e => (
                  <Link key={e.label} href={e.href} onClick={close}
                    className="flex items-center gap-3 pl-6 pr-4 py-3 text-sm text-cream/60 hover:text-cream transition-colors border-b border-white/5">
                    <span>{e.icon}</span>{e.label}
                  </Link>
                )),
              },
            ].map(item => (
              <div key={item.key} className="border-b border-white/10">
                <button onClick={() => setMobileAcc(mobileAcc === item.key ? null : item.key)}
                  className="w-full flex items-center justify-between px-2 py-4 text-sm font-sans font-medium text-cream/85">
                  {item.label} {chevron(mobileAcc === item.key)}
                </button>
                {mobileAcc === item.key && <div className="border-t border-white/8">{item.children}</div>}
              </div>
            ))}

            {[
              { label: 'Plan a Trip', href: '/search'  },
              { label: 'About Us',   href: '/about'   },
              { label: 'Contact',    href: '/contact' },
            ].map(i => (
              <Link key={i.label} href={i.href} onClick={close}
                className="flex px-2 py-4 text-sm font-sans font-medium text-cream/85 border-b border-white/10">{i.label}</Link>
            ))}

            <div className="flex items-center justify-between px-2 py-4">
              <div className="flex items-center gap-2">
                <ThemeToggle/>
                <span className="text-cream/40 text-[11px] font-mono">Dark mode</span>
              </div>
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="bg-white/10 text-cream text-[11px] font-mono border border-white/15 rounded-full px-3 py-1.5 focus:outline-none">
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} className="text-charcoal bg-white">{l.flag} {l.code}</option>
                ))}
              </select>
            </div>

            <div className="py-4">
              <Link href="/search" onClick={close}
                className="block text-center bg-crimson hover:bg-crimson-600 text-cream text-[11px] font-mono font-bold uppercase tracking-[0.14em] py-4 rounded-xl transition-colors">
                Plan a Trip
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
