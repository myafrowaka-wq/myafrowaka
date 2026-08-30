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
      {/* Session 6.3 (WDOS gate run) — title used to be a plain span with
          no real heading anywhere: looked like a section heading, wasn't
          one in the DOM. The only consumer (attraction detail page) places
          these sections directly after the page's own h1 with nothing else
          in between, so whenever an editor's article body happened to
          contain its own h3 inside a section, that h3 was the first real
          heading axe found after h1 — a genuine skipped-level violation.
          h2 fixes that, but a heading can't go inside a button (button only
          permits phrasing content) — so the h2 wraps the button instead,
          the standard accessible-accordion pattern, rather than the other
          way around. */}
      <h2 className="m-0">
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
            className={`w-4 h-4 text-charcoal/65 dark-flip-muted transition-transform duration-300 shrink-0 ml-4 ${open ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
      </h2>
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
