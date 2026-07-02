'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AttractionSearch({ initialQ }: { initialQ?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(initialQ ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (q) router.push(`/attractions?q=${encodeURIComponent(q)}`)
    else router.push('/attractions')
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg">
      <div className="relative flex-1">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="search"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Search by destination, country, or attraction..."
          className="w-full bg-white/12 hover:bg-white/18 focus:bg-white/22 backdrop-blur border border-white/20 focus:border-white/45 rounded-l-xl pl-11 pr-4 py-3.5 font-sans text-[14px] text-cream placeholder:text-cream/40 outline-none transition-all"
        />
      </div>
      <button type="submit"
        className="shrink-0 bg-crimson hover:bg-crimson/85 text-cream font-mono text-[11px] uppercase tracking-[0.13em] px-5 py-3.5 rounded-r-xl transition-colors">
        Search
      </button>
    </form>
  )
}
