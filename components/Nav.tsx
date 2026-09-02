'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { useTranslations, useLocale } from 'next-intl'
import { REGION_COLOR } from '@/lib/regionColors'
import { stockImage } from '@/lib/stockImageCredits'

// ─── data ─────────────────────────────────────────────────────────────────────
// Central Africa here uses --color-gold-600, one shade darker than the
// #D5A942 the shared REGION_COLOR map uses for the other 5 regions —
// preserved as-is rather than unified, to avoid changing Nav's actual
// rendered colour as a side effect of a token cleanup.

// Session 6.3 (WDOS Content Integrity gate, X-32 — every link resolves) —
// real bug, and a wide-reaching one: this mega-menu renders on every page.
// REGIONS.countries below is just a display list of every country in each
// region, several of which have no published attractions and no overview
// yet, so /destinations/[slug] 404s for them (same honest gate as every
// other fix in this session) — and "Zanzibar" isn't a country document at
// all (it's part of Tanzania). Rather than re-order six lists by hand
// again the next time a country's content status changes, this filters
// against a real, verified-live snapshot of which countries actually
// resolve, so only working links ever render. Re-check trigger: whenever
// a new country gets a real overview or its first published attraction,
// add its slug here.
const READY_COUNTRY_SLUGS = new Set([
  'kenya', 'tanzania', 'ethiopia', 'uganda', 'rwanda',
  'ghana', 'senegal', 'mali',
  'egypt', 'morocco',
  'south-africa', 'zimbabwe', 'botswana', 'namibia',
  'drc',
  'seychelles',
])
// Display names that don't slugify to their real Sanity slug via simple
// lowercase-and-hyphenate (checked against the live dataset, not guessed).
const COUNTRY_SLUG_OVERRIDES: Record<string, string> = { 'DR Congo': 'drc' }
function countrySlug(name: string) {
  return COUNTRY_SLUG_OVERRIDES[name] ?? name.toLowerCase().replace(/\s+/g, '-')
}

const REGIONS = [
  {
    region: 'East Africa', color: REGION_COLOR['East Africa'], href: '/destinations/regions/east-africa',
    countries: ['Kenya', 'Tanzania', 'Ethiopia', 'Uganda', 'Rwanda', 'Mozambique'],
    // Session 6.3 (WDOS Performance gate) — see lib/stockImageCredits.ts's
    // matching comment on COUNTRY_IMAGE_IDS.kenya: the old ID here was a
    // graphic lion-kill photo, not an East Africa tourism scene.
    image: stockImage('hero-savanna-poster'),
  },
  {
    region: 'West Africa', color: REGION_COLOR['West Africa'], href: '/destinations/regions/west-africa',
    countries: ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast', 'Mali', 'Benin'],
    image: stockImage('1727023663928-1772e2c7e679'),
  },
  {
    region: 'North Africa', color: REGION_COLOR['North Africa'], href: '/destinations/regions/north-africa',
    countries: ['Egypt', 'Morocco', 'Tunisia', 'Algeria', 'Libya'],
    image: stockImage('1760681554227-d7aad73cd57f'),
  },
  {
    region: 'Southern Africa', color: REGION_COLOR['Southern Africa'], href: '/destinations/regions/southern-africa',
    countries: ['South Africa', 'Zimbabwe', 'Zambia', 'Botswana', 'Namibia'],
    image: stockImage('1744604030401-b24c5975a574'),
  },
  {
    region: 'Central Africa', color: 'var(--color-gold-600)', href: '/destinations/regions/central-africa',
    countries: ['DR Congo', 'Cameroon', 'Gabon', 'Republic of Congo'],
    image: stockImage('1673624522244-8de0d50b8492'),
  },
  {
    region: 'Indian Ocean Islands', color: REGION_COLOR['Indian Ocean Islands'], href: '/destinations/regions/indian-ocean-islands',
    // "Zanzibar" was removed from this list — it's part of Tanzania, not
    // its own country document, so it never belonged in a country list.
    countries: ['Madagascar', 'Mauritius', 'Seychelles', 'Comoros'],
    image: stockImage('1513415277900-a62401e19be4'),
  },
]

const ATTRACTION_TYPES = [
  { label: 'Safari and Wildlife',    exp: 'Safari'           },
  { label: 'Historical Sites',       exp: 'Historical Sites' },
  { label: 'Beach and Islands',      exp: 'Beach'             },
  { label: 'Mountain and Hiking',    exp: 'Hiking'            },
  { label: 'Cultural Experiences',   exp: 'Culture'           },
  { label: 'Food and Markets',       exp: 'Food'              },
  { label: 'City Breaks',            exp: 'City'              },
  { label: 'UNESCO Heritage Sites',  exp: 'UNESCO'            },
]

// Session 6.3 (WDOS Content Integrity gate, X-32 — every link resolves) —
// real bug, found the same way as app/[locale]/page.tsx's matching
// FALLBACK_GUIDES fix: all 3 slugs were stale and 404'd, which matters
// more here than almost anywhere else on the site since this dropdown
// renders on every single page. Corrected against the live dataset (every
// real attraction slug carries a "-{country}" suffix).
const FEATURED_ATTRACTIONS = [
  { title: 'Pyramids of Giza: The Complete Guide',     tag: 'Egypt',        slug: 'pyramids-of-giza-egypt',              img: stockImage('1736443830251-dda3cb6df76c') },
  { title: 'Bwindi: Mountain Gorilla Trekking Guide',  tag: 'Uganda',       slug: 'bwindi-impenetrable-forest-uganda',   img: stockImage('1673624522244-8de0d50b8492') },
  { title: 'Serengeti: The Great Migration Guide',     tag: 'Tanzania',     slug: 'serengeti-national-park-tanzania',    img: stockImage('1542729841-c5af4aed2152') },
]

const STORY_CATEGORIES = [
  { label: 'Destinations',       href: '/blog?category=Destinations'        },
  { label: 'Culture & Heritage', href: '/blog?category=Culture+%26+Heritage' },
  { label: 'Travel Planning',    href: '/blog?category=Travel+Planning'      },
  { label: 'Food Tourism',       href: '/blog?category=Food+Tourism'         },
  { label: 'Experiences',        href: '/blog?category=Experiences'          },
]

const FEATURED_STORIES = [
  { title: 'What Lagos Rush Hour Teaches You About African City Life', tag: 'Nigeria', slug: 'lagos-rush-hour-city-life', img: stockImage('1618828665011-0abd973f7bb8') },
  { title: 'Slow Travel in Rwanda: The Country That Made You Stop Rushing', tag: 'Rwanda', slug: 'slow-travel-rwanda', img: stockImage('1682773083896-95176d8aecf8') },
]

const PLAN_INTERESTS = ['Safari', 'Culture', 'Beach', 'History', 'Hiking', 'Food']

const LANGUAGES = [
  { code: 'EN', label: 'English',   flag: '🇬🇧' },
  { code: 'FR', label: 'Français',  flag: '🇫🇷' },
  { code: 'PT', label: 'Português', flag: '🇵🇹' },
  { code: 'SW', label: 'Kiswahili', flag: '🇰🇪' },
  { code: 'AR', label: 'Arabic',    flag: '🇪🇬' },
]

// The three primary nav items that actually have real, distinct mega-menu
// content. Events links straight to the real /events discovery tool
// (Session 3.2) rather than opening a dropdown — no submenu content (e.g.
// per-region event picks) exists yet, and forcing a near-empty dropdown
// onto it just for visual uniformity would be its own small dishonesty.
// Plan already works best as a direct, single-purpose CTA to the planner —
// a disclosure toggle there would slow down the site's actual primary
// conversion action for no real benefit.
type PanelKey = 'destinations' | 'attractions' | 'stories' | null

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

// ─── user button ──────────────────────────────────────────────────────────────

function NavUserButton({ close }: { close: () => void }) {
  const { data: session, status } = useSession()
  const t = useTranslations('nav')

  if (status === 'loading') return <div className="hidden lg:block w-8 h-8"/>

  if (status === 'authenticated' && session?.user) {
    const u = session.user
    return (
      <Link href="/user-dashboard" onClick={close}
        className="hidden lg:flex items-center gap-2 hover:bg-white/10 rounded-full pl-0.5 pr-3 py-0.5 transition-all ml-1 group"
        title={`Signed in as ${u.name}`}>
        {u.image ? (
          <Image src={u.image} alt={u.name ?? 'User'} width={30} height={30}
            className="rounded-full ring-2 ring-gold-400/40"/>
        ) : (
          <div className="w-[30px] h-[30px] rounded-full bg-crimson/30 flex items-center justify-center">
            <span className="font-display font-bold text-[14px] text-cream">{(u.name ?? 'U').charAt(0)}</span>
          </div>
        )}
        <span className="font-display font-semibold text-[14px] text-cream/75 group-hover:text-cream transition-colors max-w-[90px] truncate">
          {u.name?.split(' ')[0]}
        </span>
      </Link>
    )
  }

  return (
    <Link href="/login" onClick={close}
      className="hidden lg:flex items-center gap-2 text-cream/80 hover:text-cream hover:bg-white/10 text-[14px] font-display font-semibold px-3 py-2 rounded-lg transition-all ml-1 whitespace-nowrap">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
      </svg>
      {t('signIn')}
    </Link>
  )
}

// ─── focus trap for an open mega-panel ─────────────────────────────────────────
// WAI-ARIA disclosure pattern: Tab/Shift+Tab wrap within the open panel,
// Escape closes it and returns focus to the trigger that opened it.

function trapFocus(container: HTMLElement, e: React.KeyboardEvent) {
  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  if (focusable.length === 0) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (e.key === 'Tab') {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

// ─── component ────────────────────────────────────────────────────────────────

export default function Nav() {
  const t = useTranslations('nav')
  const { data: session, status } = useSession()
  const [panel, setPanel]         = useState<PanelKey>(null)
  const [langOpen, setLangOpen]   = useState(false)
  const [mobile, setMobile]       = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [mobileAcc, setMobileAcc] = useState<string | null>(null)

  // Session 5.3 — the locale is now genuinely part of the URL, resolved by
  // middleware.ts and handed down through the [locale] route segment, so
  // this reads the real active locale directly instead of re-parsing a
  // NEXT_LOCALE cookie that could silently drift from what's actually
  // being rendered.
  const activeLocale = useLocale()
  const lang = activeLocale.toUpperCase()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  function switchLocale(code: string) {
    if (!['EN', 'FR', 'PT'].includes(code)) return
    const qs = searchParams.toString()
    // router.replace's { locale } option actually changes the URL (and the
    // real rendered content behind it) — not a cookie flip that needed a
    // full page reload to take visible effect.
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { locale: code.toLowerCase() })
  }

  const openTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navRef     = useRef<HTMLElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRefs = useRef<Record<string, HTMLButtonElement | HTMLAnchorElement | null>>({})

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
        setPanel(null); setLangOpen(false); setMobile(false); setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const close = () => { setPanel(null); setLangOpen(false); setMobile(false); setMenuOpen(false) }

  const togglePanel = useCallback((key: PanelKey) => {
    if (openTimer.current) clearTimeout(openTimer.current)
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setPanel(p => (p === key ? null : key))
  }, [])

  const closePanelToTrigger = useCallback((key: PanelKey) => {
    setPanel(null)
    triggerRefs.current[key ?? '']?.focus()
  }, [])

  // Arrow-key roving focus across the 5 primary nav items (3 disclosure
  // buttons + Events + Plan), Escape closes whatever panel is open.
  const ALL_TRIGGER_KEYS = ['destinations', 'attractions', 'events', 'stories', 'plan']
  function handleTriggerKeyDown(e: React.KeyboardEvent, key: string) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const i = ALL_TRIGGER_KEYS.indexOf(key)
      const next = e.key === 'ArrowRight'
        ? ALL_TRIGGER_KEYS[(i + 1) % ALL_TRIGGER_KEYS.length]
        : ALL_TRIGGER_KEYS[(i - 1 + ALL_TRIGGER_KEYS.length) % ALL_TRIGGER_KEYS.length]
      triggerRefs.current[next]?.focus()
    } else if (e.key === 'Escape' && panel) {
      e.preventDefault()
      closePanelToTrigger(panel)
    }
  }

  function handlePanelKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      closePanelToTrigger(panel)
      return
    }
    if (panelRef.current) trapFocus(panelRef.current, e)
  }

  const ni = 'flex items-center gap-1 px-3 py-2 text-[18px] font-display font-semibold text-cream hover:text-cream transition-colors rounded-lg hover:bg-white/8 whitespace-nowrap cursor-pointer'

  const chevron = (active: boolean) => (
    <svg className={`w-3 h-3 mt-0.5 transition-transform duration-150 ${active ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
    </svg>
  )

  const viewAllLink = (href: string, label: string) => (
    <Link href={href} onClick={close}
      className="inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.14em] text-ochre-400 hover:text-ochre-300 transition-colors">
      {label}
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
    </Link>
  )

  return (
    <header ref={navRef} className="sticky top-0 z-50 bg-nav-header" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.28)' }}>

      {/* ── Main bar ─────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[66px] flex items-center justify-between gap-4">

        {/* Left cluster: mobile hamburger + desktop hamburger + logo */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">

          {/* Mobile hamburger — LEFT SIDE, only visible on mobile */}
          <button
            onClick={() => { setMobile(v => !v); setMenuOpen(false) }}
            aria-label={mobile ? 'Close menu' : 'Open menu'}
            aria-expanded={mobile}
            className="lg:hidden flex flex-col gap-[5px] items-center justify-center w-10 h-10 rounded-xl text-cream hover:bg-white/10 transition-all"
          >
            {mobile ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <>
                <span className="block h-[2px] w-5 rounded-full bg-cream/70"/>
                <span className="block h-[2px] w-4 rounded-full bg-cream/70"/>
                <span className="block h-[2px] w-5 rounded-full bg-cream/70"/>
              </>
            )}
          </button>

          {/* Desktop hamburger — opens the full overlay menu (About/Contact/Sign in live here now that the primary row is five parents) */}
          <button
            onClick={() => { setMenuOpen(v => !v); setPanel(null) }}
            aria-label={menuOpen ? 'Close menu' : 'Open full menu'}
            aria-expanded={menuOpen}
            className="hidden lg:flex flex-col gap-[5.5px] items-center justify-center w-11 h-11 rounded-xl text-cream hover:bg-white/10 transition-all group"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <>
                <span className="block h-[2px] rounded-full bg-cream/70 group-hover:bg-cream transition-colors" style={{ width: '22px' }}/>
                <span className="block h-[2px] rounded-full bg-cream/70 group-hover:bg-cream transition-colors" style={{ width: '16px' }}/>
                <span className="block h-[2px] rounded-full bg-cream/70 group-hover:bg-cream transition-colors" style={{ width: '20px' }}/>
              </>
            )}
          </button>

          {/* Logo */}
          <Link href="/" onClick={close} className="shrink-0">
            <Image
              src="/logo-white.png"
              alt="MyAfroWaka"
              width={352}
              height={92}
              priority
              quality={90}
              className="h-9 w-auto"
            />
          </Link>
        </div>

        {/* Desktop nav — Destinations | Attractions | Events | Stories | Plan */}
        <nav className="hidden lg:flex items-center gap-0" aria-label="Primary">
          <div className="relative" onMouseEnter={() => hoverOpen('destinations')} onMouseLeave={hoverClose}>
            <button
              ref={el => { triggerRefs.current.destinations = el }}
              className={ni}
              aria-expanded={panel === 'destinations'}
              aria-haspopup="true"
              aria-controls="mega-destinations"
              onClick={() => togglePanel('destinations')}
              onKeyDown={e => handleTriggerKeyDown(e, 'destinations')}
            >
              {t('destinations')} {chevron(panel === 'destinations')}
            </button>
          </div>

          <div className="relative" onMouseEnter={() => hoverOpen('attractions')} onMouseLeave={hoverClose}>
            <button
              ref={el => { triggerRefs.current.attractions = el }}
              className={ni}
              aria-expanded={panel === 'attractions'}
              aria-haspopup="true"
              aria-controls="mega-attractions"
              onClick={() => togglePanel('attractions')}
              onKeyDown={e => handleTriggerKeyDown(e, 'attractions')}
            >
              {t('attractions')} {chevron(panel === 'attractions')}
            </button>
          </div>

          {/* Events: Session 3.2 built the real discovery tool at /events —
              search, six filters, a real results grid. No submenu content
              exists yet (that's a future session), so this stays a plain
              link, but the "Coming Soon" badge is gone: the page itself is
              no longer that, even though the database it searches is
              honestly still empty pending Session 3.4's first 100 events. */}
          <Link
            ref={el => { triggerRefs.current.events = el }}
            href="/events" onClick={close} className={ni}
            onKeyDown={e => handleTriggerKeyDown(e, 'events')}
          >
            {t('events')}
          </Link>

          <div className="relative" onMouseEnter={() => hoverOpen('stories')} onMouseLeave={hoverClose}>
            <button
              ref={el => { triggerRefs.current.stories = el }}
              className={ni}
              aria-expanded={panel === 'stories'}
              aria-haspopup="true"
              aria-controls="mega-stories"
              onClick={() => togglePanel('stories')}
              onKeyDown={e => handleTriggerKeyDown(e, 'stories')}
            >
              {t('stories')} {chevron(panel === 'stories')}
            </button>
          </div>

          {/* Plan: a direct CTA, not a disclosure toggle — it already works
              as the site's primary conversion action, and turning it into
              a dropdown would slow that down for no real gain. */}
          <Link
            ref={el => { triggerRefs.current.plan = el }}
            href="/plan-a-trip" onClick={close}
            onKeyDown={e => handleTriggerKeyDown(e, 'plan')}
            className="inline-flex items-center bg-action hover:bg-action-hover text-cream font-display font-bold uppercase tracking-[0.10em] rounded-full transition-colors whitespace-nowrap text-[14px] px-5 py-2.5 ml-2"
          >
            {t('planATrip')}
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Desktop-only: search icon, language, theme, sign in */}
          <Link href="/search" aria-label="Search"
            className="hidden lg:flex w-8 h-8 rounded-full items-center justify-center text-cream/60 hover:text-cream hover:bg-white/10 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </Link>

          <div className="hidden lg:block relative">
            <button onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-display font-semibold text-cream/60 hover:text-cream hover:bg-white/10 rounded-full transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"/>
              </svg>
              {lang} {chevron(langOpen)}
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-ink-surf border border-line dark:border-white/10 rounded-2xl py-2 shadow-[0_8px_40px_rgba(0,0,0,0.18)]">
                {LANGUAGES.map(l => {
                  const supported = ['EN', 'FR', 'PT'].includes(l.code)
                  return (
                    <button key={l.code}
                      onClick={() => {
                        if (supported) {
                          switchLocale(l.code)
                          setLangOpen(false)
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-sans transition-colors ${supported ? 'hover:bg-cream dark:hover:bg-white/5 cursor-pointer' : 'opacity-40 cursor-not-allowed'} ${lang === l.code ? 'text-ochre-600 dark:text-ochre-400 font-semibold' : 'text-charcoal/70 dark:text-cream/65'}`}>
                      <span>{l.label}</span>
                      {!supported && <span className="ml-auto font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/65 dark:text-cream/55">Soon</span>}
                      {lang === l.code && supported && <svg className="w-3.5 h-3.5 ml-auto text-ochre-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="hidden lg:flex"><ThemeToggle /></div>

          <NavUserButton close={close} />
        </div>
      </div>

      {/* ══ DESKTOP FULL MENU OVERLAY (hamburger) — About, Contact, Sign in ═══ */}
      {menuOpen && (
        <div
          className="hidden lg:block absolute top-full left-0 w-full bg-nav-mega z-50 overlay-panel overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 66px)', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}
          onKeyDown={e => { if (e.key === 'Escape') close() }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display font-bold text-3xl text-cream">{t('exploreAfrica')}</h2>
              <button onClick={close} className="w-10 h-10 rounded-full border border-white/15 hover:border-white/35 flex items-center justify-center text-cream/50 hover:text-cream transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-10">

              {/* Column 1: Destinations */}
              <div>
                <p className="font-display font-bold text-lg text-cream mb-6">{t('destinations')}</p>
                <div className="space-y-5">
                  {REGIONS.map(r => (
                    <div key={r.region}>
                      <Link href={r.href} onClick={close} className="group flex items-center gap-2.5 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }}/>
                        <span className="font-display font-semibold text-[15px] text-cream/90 group-hover:text-gold-300 transition-colors">{r.region}</span>
                      </Link>
                      {r.countries.filter(c => READY_COUNTRY_SLUGS.has(countrySlug(c))).length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-5">
                          {r.countries.filter(c => READY_COUNTRY_SLUGS.has(countrySlug(c))).slice(0, 3).map(c => (
                            <Link key={c} href={`/destinations/${countrySlug(c)}`} onClick={close}
                              className="font-sans text-[14px] text-cream/55 hover:text-cream/80 transition-colors">
                              {c}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link href="/search" onClick={close}
                  className="mt-7 inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.14em] text-ochre-400 hover:text-ochre-300 transition-colors">
                  {t('viewAllCountries')}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
              </div>

              {/* Column 2: Site */}
              <div>
                <p className="font-display font-bold text-lg text-cream mb-6">{t('site')}</p>
                <div className="space-y-2">
                  {[
                    { label: t('about'),        href: '/about'   },
                    { label: t('contact'),      href: '/contact' },
                    { label: t('travelGuides'), href: '/guides'  },
                    { label: t('search'),       href: '/search'  },
                  ].map(l => (
                    <Link key={l.href} href={l.href} onClick={close}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-cream/75 hover:text-cream hover:bg-white/5 transition-colors font-sans text-[14px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 opacity-60"/>
                      {l.label}
                    </Link>
                  ))}
                  {status !== 'authenticated' && (
                    <Link href="/login" onClick={close}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-cream/75 hover:text-cream hover:bg-white/5 transition-colors font-sans text-[14px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 opacity-60"/>
                      {t('signIn')}
                    </Link>
                  )}
                </div>
              </div>

              {/* Column 3: Latest Guides */}
              <div>
                <p className="font-display font-bold text-lg text-cream mb-6">{t('latestGuides')}</p>
                <div className="space-y-4">
                  {FEATURED_ATTRACTIONS.map(a => (
                    <Link key={a.slug} href={`/attractions/${a.slug}`} onClick={close}
                      className="group flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0">
                        {/* Session 6.3 — image-redundant-alt: a.title is a visible caption right next to this thumbnail. */}
                        <Image src={a.img} alt="" fill className="object-cover"/>
                      </div>
                      <div>
                        <p className="font-sans text-[14px] uppercase tracking-[0.1em] text-ochre-400 mb-1">{a.tag}</p>
                        <p className="font-display font-semibold text-[14px] text-cream/80 group-hover:text-cream transition-colors leading-snug">{a.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/search" onClick={close}
                  className="mt-5 inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.14em] text-ochre-400 hover:text-ochre-300 transition-colors">
                  {t('browseAllGuides')}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEGA — DESTINATIONS ══════════════════════════════════════════════════ */}
      {panel === 'destinations' && (
        <div
          id="mega-destinations" ref={panelRef} role="region" aria-label={t('destinations')}
          className="hidden lg:block absolute top-full left-0 w-full bg-white dark:bg-nav-dropdown border-b border-line dark:border-white/8 mega-panel"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
          onMouseEnter={keepOpen} onMouseLeave={hoverClose} onKeyDown={handlePanelKeyDown}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-6">
                {REGIONS.map(r => (
                  <div key={r.region}>
                    <Link href={r.href} onClick={close} className="group flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}/>
                      <span className="font-display font-bold text-[14px] uppercase tracking-[0.12em] text-charcoal/50 dark:text-cream/55 group-hover:text-ochre-600 transition-colors">{r.region}</span>
                    </Link>
                    <ul className="space-y-2">
                      {r.countries.filter(c => READY_COUNTRY_SLUGS.has(countrySlug(c))).map(c => (
                        <li key={c}>
                          <Link href={`/destinations/${countrySlug(c)}`} onClick={close}
                            className="font-sans text-[14px] text-charcoal/70 dark:text-cream/65 hover:text-ochre-600 dark:hover:text-ochre-400 transition-colors">
                            {c}
                          </Link>
                        </li>
                      ))}
                      <li>
                        {/* Session 6.3 — dark:text-ochre-400: plain ochre-500 measures
                            3.98:1 against this mega-panel's dark:bg-nav-dropdown,
                            failing WCAG AA's 4.5:1 for normal text; ochre-400 is the
                            project's existing dark-mode-safe ochre step (see Nav's own
                            dark:hover:text-ochre-400 a few lines up) and clears 5.2:1 here. */}
                        <Link href={r.href} onClick={close} className="font-sans text-[14px] text-ochre-500 dark:text-ochre-400 hover:text-ochre-600 dark:hover:text-ochre-300 transition-colors mt-0.5 inline-block">
                          {t('more')} &rarr;
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
              <div className="col-span-3 border-l border-line dark:border-white/8 pl-8 flex flex-col">
                <p className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark:text-cream/55 mb-4">{t('featured')}</p>
                <Link href="/destinations/egypt" onClick={close} className="group relative rounded-2xl overflow-hidden flex-1 min-h-[200px] block">
                  <Image src={stockImage('1640005438758-861043e64aa5')} alt="Egypt" fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-sans text-[14px] uppercase tracking-[0.12em] text-gold-400 mb-1">North Africa</p>
                    <p className="font-display font-bold text-lg text-cream leading-tight">Egypt</p>
                    <p className="font-sans text-[14px] text-cream/55 mt-0.5">North Africa</p>
                  </div>
                </Link>
                <Link href="/search" onClick={close}
                  className="mt-4 block text-center bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.10em] px-4 py-3 rounded-xl transition-colors">
                  {t('browseAllAttractions')} &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEGA — ATTRACTIONS ═══════════════════════════════════════════════════ */}
      {panel === 'attractions' && (
        <div
          id="mega-attractions" ref={panelRef} role="region" aria-label={t('attractions')}
          className="hidden lg:block absolute top-full left-0 w-full bg-white dark:bg-nav-dropdown border-b border-line dark:border-white/8 mega-panel"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
          onMouseEnter={keepOpen} onMouseLeave={hoverClose} onKeyDown={handlePanelKeyDown}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-12 gap-8">

              {/* Col 1: Browse by type */}
              <div className="col-span-3">
                <p className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark:text-cream/55 mb-5">Browse by Type</p>
                <ul className="space-y-2">
                  {ATTRACTION_TYPES.map(item => (
                    <li key={item.exp}>
                      <Link href={`/search?exp=${encodeURIComponent(item.exp)}`} onClick={close}
                        className="flex items-center gap-2 font-sans text-[14px] text-charcoal/70 dark:text-cream/65 hover:text-crimson dark:hover:text-crimson-300 transition-colors py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 opacity-60"/>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Col 2: Browse by region */}
              <div className="col-span-3 border-l border-line dark:border-white/8 pl-8">
                <p className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark:text-cream/55 mb-5">Browse by Region</p>
                <ul className="space-y-2">
                  {REGIONS.map(r => (
                    <li key={r.region}>
                      <Link href={r.href} onClick={close}
                        className="font-sans text-[14px] text-charcoal/70 dark:text-cream/65 hover:text-crimson dark:hover:text-crimson-300 transition-colors block py-0.5">
                        {r.region}
                      </Link>
                    </li>
                  ))}
                </ul>
                {viewAllLink('/search', 'All attractions')}
              </div>

              {/* Col 3+4: Featured guides */}
              <div className="col-span-6 border-l border-line dark:border-white/8 pl-8">
                <p className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark:text-cream/55 mb-5">Featured Guides</p>
                <div className="space-y-3">
                  {FEATURED_ATTRACTIONS.map(a => (
                    <Link key={a.slug} href={`/attractions/${a.slug}`} onClick={close}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-sand dark:hover:bg-white/5 transition-colors">
                      <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0">
                        {/* Session 6.3 — image-redundant-alt: a.title is a visible caption right next to this thumbnail. */}
                        <Image src={a.img} alt="" fill className="object-cover"/>
                      </div>
                      <div>
                        {/* Session 6.3 — dark:text-crimson-300 matches this exact
                            mega-panel's own hover:dark:text-crimson-300 convention
                            a few lines up; plain text-crimson measures 2.57:1
                            against this panel's dark:bg-nav-dropdown (#181510),
                            badly failing WCAG AA, and isn't reached by globals.css's
                            .dark-flip-* crimson override since this panel uses its
                            own bg-nav-dropdown rather than that convention. */}
                        <p className="font-sans text-[14px] uppercase tracking-[0.1em] text-crimson dark:text-crimson-300 mb-1">{a.tag}</p>
                        <p className="font-display font-semibold text-[14px] text-charcoal/80 dark:text-cream/75 group-hover:text-crimson transition-colors leading-snug">{a.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-line dark:border-white/8 flex items-center justify-between">
                  <p className="font-sans text-[14px] text-charcoal/65 dark:text-cream/55">Destination guides, written from inside Africa.</p>
                  {/* Session 6.3 — see the region-list "more" link's matching comment above: same bug, same fix. */}
                  <Link href="/search" onClick={close}
                    className="inline-flex items-center gap-1.5 font-sans text-[14px] uppercase tracking-[0.12em] text-ochre-500 dark:text-ochre-400 hover:text-ochre-600 dark:hover:text-ochre-300 transition-colors">
                    Browse all
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MEGA — STORIES ═══════════════════════════════════════════════════════ */}
      {panel === 'stories' && (
        <div
          id="mega-stories" ref={panelRef} role="region" aria-label={t('stories')}
          className="hidden lg:block absolute top-full left-0 w-full bg-white dark:bg-nav-dropdown border-b border-line dark:border-white/8 mega-panel"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
          onMouseEnter={keepOpen} onMouseLeave={hoverClose} onKeyDown={handlePanelKeyDown}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-12 gap-8">

              {/* Col 1: Categories */}
              <div className="col-span-4">
                <p className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark:text-cream/55 mb-5">Browse by Category</p>
                <ul className="space-y-2">
                  {STORY_CATEGORIES.map(c => (
                    <li key={c.href}>
                      <Link href={c.href} onClick={close}
                        className="flex items-center gap-2 font-sans text-[14px] text-charcoal/70 dark:text-cream/65 hover:text-crimson dark:hover:text-crimson-300 transition-colors py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 opacity-60"/>
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                {viewAllLink('/blog', 'All stories')}
              </div>

              {/* Col 2+3: Featured stories */}
              <div className="col-span-8 border-l border-line dark:border-white/8 pl-8">
                <p className="font-display font-bold text-[14px] uppercase tracking-[0.14em] text-charcoal/65 dark:text-cream/55 mb-5">Latest From the Journal</p>
                <div className="grid grid-cols-2 gap-3">
                  {FEATURED_STORIES.map(s => (
                    <Link key={s.slug} href={`/blog/${s.slug}`} onClick={close}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-sand dark:hover:bg-white/5 transition-colors">
                      <div className="relative w-20 h-14 rounded-xl overflow-hidden shrink-0">
                        {/* Session 6.3 — image-redundant-alt: s.title is a visible caption right next to this thumbnail. */}
                        <Image src={s.img} alt="" fill className="object-cover"/>
                      </div>
                      <div>
                        {/* Session 6.3 — see the Attractions mega-panel's matching comment above: same bug, same fix. */}
                        <p className="font-sans text-[14px] uppercase tracking-[0.1em] text-crimson dark:text-crimson-300 mb-1">{s.tag}</p>
                        <p className="font-display font-semibold text-[14px] text-charcoal/80 dark:text-cream/75 group-hover:text-crimson transition-colors leading-snug">{s.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-line dark:border-white/8">
                  <p className="font-sans text-[14px] text-charcoal/65 dark:text-cream/55">Perspectives, dispatches, and stories from across the continent.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MOBILE DRAWER ══════════════════════════════════════════════════════ */}
      {mobile && (
        <div className="lg:hidden border-t border-white/10 bg-nav-mobile max-h-[80vh] overflow-y-auto"
          onKeyDown={e => { if (e.key === 'Escape') close() }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

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

            {/* Destinations accordion */}
            <div className="border-b border-white/10">
              <button onClick={() => setMobileAcc(mobileAcc === 'destinations' ? null : 'destinations')}
                aria-expanded={mobileAcc === 'destinations'}
                className="w-full flex items-center justify-between px-2 py-4 text-[18px] font-display font-semibold text-cream">
                {t('destinations')} {chevron(mobileAcc === 'destinations')}
              </button>
              {mobileAcc === 'destinations' && (
                <div className="border-t border-white/8">
                  {REGIONS.map(r => (
                    <Link key={r.region} href={r.href} onClick={close}
                      className="flex items-center gap-3 pl-6 pr-4 py-3 text-sm text-cream/60 hover:text-cream transition-colors border-b border-white/5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }}/>{r.region}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Attractions accordion */}
            <div className="border-b border-white/10">
              <button onClick={() => setMobileAcc(mobileAcc === 'attractions' ? null : 'attractions')}
                aria-expanded={mobileAcc === 'attractions'}
                className="w-full flex items-center justify-between px-2 py-4 text-[18px] font-display font-semibold text-cream">
                {t('attractions')} {chevron(mobileAcc === 'attractions')}
              </button>
              {mobileAcc === 'attractions' && (
                <div className="border-t border-white/8">
                  {ATTRACTION_TYPES.map(item => (
                    <Link key={item.exp} href={`/search?exp=${encodeURIComponent(item.exp)}`} onClick={close}
                      className="flex items-center gap-3 pl-6 pr-4 py-3 text-sm text-cream/60 hover:text-cream transition-colors border-b border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 opacity-60"/>{item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Events — plain link, real discovery tool since Session 3.2 */}
            <Link href="/events" onClick={close}
              className="flex items-center justify-between px-2 py-4 text-[18px] font-display font-semibold text-cream border-b border-white/10">
              {t('events')}
            </Link>

            {/* Stories accordion */}
            <div className="border-b border-white/10">
              <button onClick={() => setMobileAcc(mobileAcc === 'stories' ? null : 'stories')}
                aria-expanded={mobileAcc === 'stories'}
                className="w-full flex items-center justify-between px-2 py-4 text-[18px] font-display font-semibold text-cream">
                {t('stories')} {chevron(mobileAcc === 'stories')}
              </button>
              {mobileAcc === 'stories' && (
                <div className="border-t border-white/8">
                  {STORY_CATEGORIES.map(c => (
                    <Link key={c.href} href={c.href} onClick={close}
                      className="flex items-center gap-3 pl-6 pr-4 py-3 text-sm text-cream/60 hover:text-cream transition-colors border-b border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0 opacity-60"/>{c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* About / Contact — secondary, still reachable */}
            {[
              { label: t('about'),   href: '/about'   },
              { label: t('contact'), href: '/contact' },
            ].map(i => (
              <Link key={i.label} href={i.href} onClick={close}
                className="flex px-2 py-3.5 text-sm font-sans text-cream/55 hover:text-cream/85 transition-colors border-b border-white/10">{i.label}</Link>
            ))}

            {/* Plan a Trip — prominent CTA */}
            <Link href="/plan-a-trip" onClick={close}
              className="flex items-center justify-center gap-2 my-4 bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] py-3.5 rounded-xl transition-colors">
              {t('planATrip')}
            </Link>

            <div className="flex items-center justify-between px-2 py-4 border-b border-white/10">
              {/* Mobile auth: session-aware */}
              {status === 'loading' ? (
                <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse"/>
              ) : status === 'authenticated' && session?.user ? (
                <Link href="/user-dashboard" onClick={close} className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-crimson/30 flex items-center justify-center ring-2 ring-gold-400/30 shrink-0">
                    {session.user.image ? (
                      <Image src={session.user.image} alt={session.user.name ?? 'User'} width={36} height={36} className="object-cover w-full h-full"/>
                    ) : (
                      <span className="font-display font-bold text-[14px] text-cream">
                        {(session.user.name ?? 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-display font-semibold text-[14px] text-cream group-hover:text-gold-300 transition-colors">
                      {session.user.name?.split(' ')[0] ?? 'Account'}
                    </p>
                    <p className="font-sans text-[14px] uppercase tracking-[0.08em] text-cream/55">My Dashboard</p>
                  </div>
                </Link>
              ) : (
                <Link href="/login" onClick={close}
                  className="flex items-center gap-2 text-[14px] font-display font-semibold text-cream/80 hover:text-cream transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                  {t('signIn')}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <ThemeToggle/>
                <select value={lang}
                  onChange={e => switchLocale(e.target.value)}
                  aria-label="Choose language"
                  className="bg-white/10 text-cream text-[14px] font-sans border border-white/15 rounded-full px-3 py-1.5 focus:outline-none">
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code} className="text-charcoal bg-white">{l.label}</option>
                  ))}
                </select>
              </div>
            </div>


          </div>
        </div>
      )}
    </header>
  )
}
