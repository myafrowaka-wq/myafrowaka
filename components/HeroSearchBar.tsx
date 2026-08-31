'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { SearchTypeahead } from '@/components/SearchTypeahead'
import type { Suggestion } from '@/lib/searchIndex'

// Pulled out of the homepage hero (a Server Component) into its own small
// Client Component so the search box can carry real typeahead state — see
// SearchTypeahead.tsx. Free-text Enter/Search-click behaviour (→
// /search?q=...) is unchanged from the plain <form action="/search"> this
// replaces; picking a suggestion goes straight to that attraction or
// country page instead.
export function HeroSearchBar() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    router.push(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : '/search')
  }

  function resolveHref(s: Suggestion) {
    return s.kind === 'country' ? `/destinations/${s.slug}` : `/attractions/${s.slug}`
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-lg mb-6">
      <div className="flex bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-[0_8px_60px_rgba(0,0,0,0.55)]">
        <div className="flex items-center pl-5 pr-3 text-charcoal/65 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <SearchTypeahead
          value={value}
          onChange={setValue}
          placeholder="Egypt, safari, Zanzibar..."
          className="flex-1 py-4 pr-4 text-sm font-sans text-charcoal placeholder-charcoal/35 bg-transparent focus:outline-none"
          resolveHref={resolveHref}
          ariaLabel="Search attractions and countries"
        />
        <button type="submit"
          className="m-1.5 bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.10em] px-5 py-3 rounded-xl transition-all">
          Search
        </button>
      </div>
    </form>
  )
}
