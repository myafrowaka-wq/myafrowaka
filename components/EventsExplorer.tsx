'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { Flag } from '@/components/Flag'
import { EventCard, type EventSummary } from '@/components/EventCard'
import {
  EVENT_CATEGORIES, EVENT_REGIONS, EVENT_MONTHS, EVENT_TRAVEL_STYLES, EVENT_VERIFICATION_STATUSES,
  matchesCategory, matchesRegion, matchesCountry, matchesStyle, matchesStatus, matchesMonth,
} from '@/lib/eventFilters'

// Session 3.2 — the real discovery tool the plan asks for: search across
// name/country/city/category, six independent filters (country, region,
// month, category, travel style, verification status), a results grid
// that is structurally its own thing rather than another "eyebrow,
// heading, sub, three cards" section (WDOS L-04). All filtering happens
// client-side against data already fetched server-side by app/events/
// page.tsx — instant, no page reload per filter click, same UX quality as
// /search, but (unlike /search) the page this lives on still carries real
// server-rendered metadata for SEO, because this database is explicitly
// the site's best SEO territory per the plan.

export type { EventSummary }

export interface CountryOption {
  name: string
  slug: string
  countryCode?: string
  continentRegion?: string
}

const CATEGORIES = EVENT_CATEGORIES
const REGIONS = EVENT_REGIONS
const MONTHS = EVENT_MONTHS
const TRAVEL_STYLES = EVENT_TRAVEL_STYLES
const VERIFICATION_STATUSES = EVENT_VERIFICATION_STATUSES

function AccordionSection({
  title, defaultOpen = false, children,
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-line dark-flip-border last:border-none">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-display font-semibold text-[14px] text-charcoal dark-flip-text">{title}</span>
        <svg className={`w-4 h-4 text-charcoal/65 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

function FilterOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-left transition-colors font-sans text-[14px]
        ${active ? 'bg-crimson/8 text-crimson' : 'text-charcoal/65 dark-flip-muted hover:bg-sand dark-flip-surf'}`}>
      <span className="flex-1">{children}</span>
      {active && (
        <svg className="w-3 h-3 text-crimson shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      )}
    </button>
  )
}

interface FilterAccordionsProps {
  category: string; status: string; region: string; country: string; month: string; style: string
  countriesWithEvents: CountryOption[]
  setParam: (key: string, value: string) => void
}

// Shared between the desktop sidebar and the mobile filter sheet, so the
// two never drift out of sync with each other the way the ATTRACTION_IMAGES
// map used to drift across 8 separate files before Session 2.4 fixed that.
function FilterAccordions({ category, status, region, country, month, style, countriesWithEvents, setParam }: FilterAccordionsProps) {
  return (
    <>
      <AccordionSection title="Category" defaultOpen>
        <div className="space-y-1">
          {CATEGORIES.map(c => (
            <FilterOption key={c} active={category === c} onClick={() => setParam('category', category === c ? '' : c)}>{c}</FilterOption>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Verification Status">
        <div className="space-y-1">
          {VERIFICATION_STATUSES.map(s => (
            <FilterOption key={s} active={status === s} onClick={() => setParam('status', status === s ? '' : s)}>{s}</FilterOption>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Region">
        <div className="space-y-1">
          {REGIONS.map(r => (
            <FilterOption key={r} active={region === r} onClick={() => setParam('region', region === r ? '' : r)}>{r}</FilterOption>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Country">
        <div className="space-y-1 max-h-56 overflow-y-auto">
          {countriesWithEvents.length === 0 ? (
            <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted italic py-1">No events published yet.</p>
          ) : countriesWithEvents.map(c => (
            <FilterOption key={c.slug} active={country === c.slug} onClick={() => setParam('country', country === c.slug ? '' : c.slug)}>
              <span className="inline-flex items-center gap-1.5"><Flag code={c.countryCode} />{c.name}</span>
            </FilterOption>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Month">
        <div className="space-y-1">
          {MONTHS.map(m => (
            <FilterOption key={m} active={month === m} onClick={() => setParam('month', month === m ? '' : m)}>{m}</FilterOption>
          ))}
        </div>
      </AccordionSection>

      <AccordionSection title="Travel Style">
        <div className="space-y-1">
          {TRAVEL_STYLES.map(s => (
            <FilterOption key={s} active={style === s} onClick={() => setParam('style', style === s ? '' : s)}>{s}</FilterOption>
          ))}
        </div>
      </AccordionSection>
    </>
  )
}


export function EventsExplorer({ events, countries }: { events: EventSummary[]; countries: CountryOption[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const q        = searchParams.get('q')        ?? ''
  const country  = searchParams.get('country')  ?? ''
  const region   = searchParams.get('region')   ?? ''
  const month    = searchParams.get('month')    ?? ''
  const category = searchParams.get('category') ?? ''
  const style    = searchParams.get('style')    ?? ''
  const status   = searchParams.get('status')   ?? ''

  // The input box needs its own state for snappy per-keystroke feedback
  // ahead of the debounced URL update below, but it also needs to follow
  // q when that changes from anywhere else — the "×" on the search-term
  // chip, the browser back button. Adjusted here during render (React's
  // own recommended pattern — see "Adjusting state when a prop changes",
  // react.dev) rather than in a useEffect, so this can't itself cause the
  // extra render/commit an effect would: https://react.dev/learn/you-might-not-need-an-effect
  const [inputVal, setInputVal] = useState(q)
  const [syncedQ, setSyncedQ] = useState(q)
  if (q !== syncedQ) {
    setSyncedQ(q)
    setInputVal(q)
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // router.replace, not push: this is a faceted-search panel, not a
  // sequence of distinct pages. Six filters plus a debounced search box
  // all pushing history entries would mean six-plus presses of the back
  // button to escape the page entirely — replace keeps "back" meaning
  // "leave /events", the way a filter panel should behave.
  const setParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`/events?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

  const setSearchInput = useCallback((value: string) => {
    setInputVal(value)
    setSyncedQ(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setParam('q', value), 300)
  }, [setParam])

  const clearAll = () => router.replace('/events', { scroll: false })
  const hasFilters = !!(q || country || region || month || category || style || status)

  const filtered = useMemo(() => events.filter(e => {
    if (country && !matchesCountry(e, country)) return false
    if (region && !matchesRegion(e, region)) return false
    if (category && !matchesCategory(e, category)) return false
    if (style && !matchesStyle(e, style)) return false
    if (status && !matchesStatus(e, status)) return false
    if (month && !matchesMonth(e, month)) return false
    if (q) {
      const needle = q.toLowerCase()
      const haystack = [e.name, e.country?.name, e.city?.name, e.category, e.shortDescription].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  }), [events, q, country, region, month, category, style, status])

  // Country options only list countries that actually have at least one
  // published event — offering 54 countries to filter by when only a
  // handful have events would be a database page pretending to be fuller
  // than it is.
  const countriesWithEvents = useMemo(() => {
    const slugsWithEvents = new Set(events.map(e => e.country?.slug).filter(Boolean))
    return countries.filter(c => slugsWithEvents.has(c.slug))
  }, [events, countries])

  return (
    <div className="bg-cream dark-flip-bg min-h-screen">
      {/* Top search bar */}
      <div className="bg-sand dark-flip-surf border-b border-line dark-flip-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted mb-4 flex gap-1">
            <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
            <span>/</span>
            <span className="text-charcoal dark-flip-text">Events</span>
          </nav>

          <h1 className="font-display font-bold text-charcoal dark-flip-text mb-3"
            style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.018em' }}>
            African Events &amp; Festivals
          </h1>
          <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed mb-6 max-w-2xl">
            What is happening across Africa, verified against an official source before it goes live — never a guessed date dressed up as a fact.
          </p>

          <div className="relative max-w-2xl">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/65 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="search"
              value={inputVal}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name, country, city, or category..."
              className="w-full border border-line dark-flip-border bg-white dark-flip-card rounded-xl pl-10 pr-4 py-3.5 text-sm font-sans text-charcoal dark-flip-text placeholder:text-charcoal/65 focus:outline-none focus:border-gold-400 transition-colors"
            />
          </div>

          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              <span className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted">Filters:</span>
              {[
                ['q', q], ['country', countries.find(c => c.slug === country)?.name ?? country],
                ['region', region], ['month', month], ['category', category], ['style', style], ['status', status],
              ].filter(([, v]) => v).map(([key, label]) => (
                <button key={key} onClick={() => setParam(key, '')}
                  className="flex items-center gap-1.5 bg-crimson/10 text-crimson font-sans text-[14px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-crimson/20 hover:bg-crimson/20 transition-colors">
                  {label}
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              ))}
              <button onClick={clearAll}
                className="font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/55 hover:text-crimson transition-colors underline underline-offset-2">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body: filter panel + results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8 items-start">

          <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-24">
            <div className="bg-white dark-flip-card border border-line dark-flip-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-line dark-flip-border">
                <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/55 dark-flip-muted">Filter Events</p>
              </div>
              <div className="px-5">
                <FilterAccordions
                  category={category} status={status} region={region} country={country} month={month} style={style}
                  countriesWithEvents={countriesWithEvents} setParam={setParam}
                />
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/55 dark-flip-muted">
                {filtered.length} event{filtered.length !== 1 ? 's' : ''} found
              </p>
              {/* Mobile-only filter trigger — the sidebar above is desktop-only
                  (hidden md:block), so without this a phone visitor would have
                  zero access to any of the six filters, only the search box.
                  For the site's flagship new discovery feature that's a real
                  gap, not a cosmetic one, even though /search has the same
                  desktop-only sidebar and nobody's fixed that yet either. */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden inline-flex items-center gap-2 border border-line dark-flip-border rounded-full px-4 py-2 font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/70 dark-flip-muted hover:border-crimson hover:text-crimson transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4"/>
                </svg>
                Filters
                {hasFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson"/>
                )}
              </button>
            </div>

            {filtered.length === 0 && events.length === 0 && !hasFilters ? (
              // The honest state: the database genuinely has no published
              // events yet (Session 3.4 writes the first 100). Not a fake
              // "no results for your search" message, and never filled
              // with placeholder cards - a wrong date sent to a real
              // traveller costs more trust than an empty page ever would.
              <div className="text-center py-24">
                <p className="font-display font-bold text-2xl text-charcoal/65 dark-flip-muted mb-3">No events published yet</p>
                <p className="font-sans text-sm text-charcoal/45 dark-flip-muted max-w-md mx-auto leading-relaxed">
                  We verify every date against an official source before it goes live, so this starts empty on purpose. The first events are on their way.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-display font-bold text-3xl text-charcoal/65 dark-flip-muted mb-3">No matches</p>
                <p className="font-sans text-sm text-charcoal/65 dark-flip-muted mb-6">Try a different search term or clear a filter.</p>
                <button onClick={clearAll}
                  className="inline-flex items-center gap-2 border border-line dark-flip-border text-charcoal/50 dark-flip-muted hover:text-crimson hover:border-crimson font-sans text-[14px] uppercase tracking-[0.12em] px-6 py-3 rounded-full transition-colors">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map(e => <EventCard key={e.slug} event={e} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter sheet — the six filters this session exists to build,
          made reachable on a phone. Same FilterAccordions content as the
          desktop sidebar, in a full-screen overlay instead of a fixed rail. */}
      {mobileFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter events"
          onKeyDown={e => { if (e.key === 'Escape') setMobileFiltersOpen(false) }}
          className="md:hidden fixed inset-0 z-50 bg-cream dark-flip-bg flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line dark-flip-border shrink-0">
            <p className="font-display font-bold text-charcoal dark-flip-text text-lg">Filter Events</p>
            <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"
              className="w-9 h-9 rounded-full border border-line dark-flip-border flex items-center justify-center text-charcoal/55 dark-flip-muted hover:border-crimson hover:text-crimson transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <FilterAccordions
              category={category} status={status} region={region} country={country} month={month} style={style}
              countriesWithEvents={countriesWithEvents} setParam={setParam}
            />
          </div>
          <div className="shrink-0 border-t border-line dark-flip-border px-4 sm:px-6 py-4 flex items-center gap-3 bg-cream dark-flip-bg">
            {hasFilters && (
              <button onClick={clearAll}
                className="flex-1 border border-line dark-flip-border rounded-full py-3 font-sans text-[14px] uppercase tracking-[0.12em] text-charcoal/60 dark-flip-muted hover:border-crimson hover:text-crimson transition-colors">
                Clear all
              </button>
            )}
            <button onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 bg-action hover:bg-action-hover text-cream rounded-full py-3 font-display font-bold text-[14px] uppercase tracking-[0.12em] transition-colors">
              Show {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
