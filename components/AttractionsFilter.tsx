'use client'
import { useRouter, useSearchParams } from 'next/navigation'

const FILTER_TYPES = [
  'National Park',
  'Nature Reserve',
  'National Reserve',
  'Natural Wonder',
  'Cultural Site',
  'UNESCO World Heritage Site',
]

export function AttractionsFilter({ activeType }: { activeType?: string }) {
  const router = useRouter()
  const params = useSearchParams()

  function setType(type: string | null) {
    const next = new URLSearchParams(params.toString())
    if (type) next.set('type', type)
    else next.delete('type')
    next.delete('page')
    router.push(`/attractions?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <button
        onClick={() => setType(null)}
        className={`font-mono text-[9px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border transition-all ${
          !activeType
            ? 'bg-crimson text-cream border-crimson'
            : 'border-line dark-flip-border text-charcoal/45 dark-flip-muted hover:border-crimson hover:text-crimson'
        }`}
      >
        All Guides
      </button>
      {FILTER_TYPES.map(type => (
        <button
          key={type}
          onClick={() => setType(activeType === type ? null : type)}
          className={`font-mono text-[9px] uppercase tracking-[0.14em] px-4 py-2 rounded-full border transition-all ${
            activeType === type
              ? 'bg-crimson text-cream border-crimson'
              : 'border-line dark-flip-border text-charcoal/45 dark-flip-muted hover:border-crimson hover:text-crimson'
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  )
}
