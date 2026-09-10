'use client'

import { useEffect } from 'react'
import { usePathname } from '@/i18n/navigation'

// Owner review (2026-09-10) — "when I load this page it kind of loads
// from the bottom and scrolls up. I want it to just load to the top."
//
// Two things caused that. First, `html { scroll-behavior: smooth }` made
// the browser ANIMATE every route-change scroll (removed in globals.css).
// Second, on a client-side navigation the scroll was landing ~66px down
// — the height of the sticky header — because the framework's scroll
// target is the <main> element, which sits just below the header in
// document flow. This pins every navigation to the true top (0,0), so
// the hero of the new page is fully visible from its first pixel.
//
// It deliberately does NOT run when the URL carries a hash (#section) —
// an in-page anchor jump should still land on its target.
export function ScrollReset() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash) return
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
