'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { loadSuggestionIndex, filterSuggestions, type Suggestion } from '@/lib/searchIndex'

// Shared typeahead behaviour for the hero search bar and PlanTripCard's
// "Where to?" field — real live suggestions as you type (attractions and/or
// countries, pulled from the same published Sanity data every other search
// surface reads), not a third-party search service. Deliberately renders
// only the <input> + its dropdown, not a whole form: each caller keeps its
// own <form onSubmit> and submit button exactly as before, so free-text
// Enter with nothing highlighted still falls through to that existing
// behaviour untouched. Picking a suggestion (click, or Enter while
// highlighted) intercepts that and navigates straight to the real page
// instead — a keyboard-accessible combobox (WAI-ARIA combobox pattern),
// matching the rest of the app's accessibility bar.
export function SearchTypeahead({
  value,
  onChange,
  placeholder,
  className,
  kinds = ['attraction', 'country'],
  resolveHref,
  ariaLabel,
  id,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className: string
  kinds?: Array<Suggestion['kind']>
  resolveHref: (s: Suggestion) => string
  ariaLabel?: string
  id?: string
}) {
  const router = useRouter()
  const listboxId = useId()
  const [index, setIndex] = useState<Suggestion[] | null>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    loadSuggestionIndex().then(list => { if (!cancelled) setIndex(list) })
    return () => { cancelled = true }
  }, [])

  const suggestions = index ? filterSuggestions(index, value, { kinds }) : []

  function selectSuggestion(s: Suggestion) {
    setOpen(false)
    setActiveIndex(-1)
    router.push(resolveHref(s))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="relative flex-1">
      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        aria-label={ariaLabel}
        value={value}
        placeholder={placeholder}
        className={className}
        onChange={e => { onChange(e.target.value); setOpen(true); setActiveIndex(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 120) }}
        onKeyDown={handleKeyDown}
      />
      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 bg-white dark-flip-card border border-line dark-flip-border rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] overflow-hidden z-20 max-h-72 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.kind}-${s.slug}`} role="option" id={`${listboxId}-${i}`} aria-selected={i === activeIndex}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); if (blurTimer.current) clearTimeout(blurTimer.current); selectSuggestion(s) }}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left font-sans text-sm text-charcoal dark-flip-text transition-colors ${i === activeIndex ? 'bg-cream dark-flip-surf' : ''}`}
              >
                <span className="truncate">{s.name}</span>
                <span className="shrink-0 font-sans text-[14px] uppercase tracking-[0.1em] text-charcoal/65 dark-flip-muted">
                  {s.kind === 'country' ? 'Country' : s.countryName ?? 'Attraction'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
