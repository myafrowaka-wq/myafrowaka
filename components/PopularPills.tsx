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
    setDisplayed(shuffled.slice(0, 6))
  }, [attractions])

  if (displayed.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {displayed.map(p => (
        <Link
          key={p.slug}
          href={`/attractions/${p.slug}`}
          className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/18 border border-white/12 hover:border-white/25 text-cream/75 hover:text-cream font-mono text-[10px] uppercase tracking-[0.12em] px-4 py-2 rounded-full transition-all"
        >
          <svg className="w-2.5 h-2.5 text-gold-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          {p.label}
        </Link>
      ))}
    </div>
  )
}
