'use client'

import { useState } from 'react'

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-line dark-flip-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 sm:py-5 text-left group"
        aria-expanded={open}
      >
        <span
          className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors"
          style={{ fontSize: 'clamp(15px, 1.7vw, 20px)', letterSpacing: '-0.013em' }}
        >
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-charcoal/30 dark-flip-muted transition-transform duration-300 shrink-0 ml-4 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="pb-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
