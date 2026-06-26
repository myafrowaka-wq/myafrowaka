'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Pill {
  label: string
  slug: string
}

export function PopularPills({ attractions }: { attractions: Pill[] }) {
  const [displayed, setDisplayed] = useState<Pill[]>([])

  useEffect(() => {
    if (attractions.length === 0) return
    const shuffled = [...attractions].sort(() => Math.random() - 0.5)
    setDisplayed(shuffled.slice(0, 3))
  }, [attractions])

  if (displayed.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {displayed.map(p => (
        <Link
          key={p.slug}
          href={`/attractions/${p.slug}`}
          className="inline-flex items-center gap-1 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/22 text-cream/60 hover:text-cream/85 font-mono text-[8px] uppercase tracking-[0.10em] px-3 py-1.5 rounded-full transition-all"
        >
          <svg className="w-2 h-2 text-gold-400/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <span className="truncate max-w-[120px]">{p.label}</span>
        </Link>
      ))}
    </div>
  )
}
