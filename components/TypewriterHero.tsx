'use client'

import { useState, useEffect, useLayoutEffect } from 'react'

// SSR-safe layout effect: on the client we want the rewind-to-0 to land
// before the browser paints the full SSR headline (no flash); on the
// server useLayoutEffect would warn, so fall back to useEffect there.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export function TypewriterHero({
  lines,
  speed = 38,
  className = '',
}: {
  lines: { text: string; className?: string; noBreakAfter?: boolean }[]
  speed?: number
  className?: string
}) {
  const fullText = lines.map(l => l.text).join('\n')

  // Start on the FULL text: that's what SSR sends and what a no-JS / slow
  // -hydration visitor sees (no blank headline, clean LCP). The effect
  // below rewinds to 0 and types it out — but only once, only client-side,
  // and only when it's worth doing.
  const [charIndex, setCharIndex] = useState(fullText.length)
  const [done, setDone] = useState(true)

  useIsoLayoutEffect(() => {
    // X-11 / M-08: the reveal is JS, not CSS, so the global
    // prefers-reduced-motion override can't reach it — check it here.
    // Also skip entirely if the tab is hidden at load: an animation
    // nobody is watching would otherwise be frozen by rAF throttling and
    // "finish" only when the visitor finally looks, which is worse than
    // just showing the headline.
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.visibilityState === 'hidden'
    ) {
      return
    }

    // Time-based, driven by requestAnimationFrame off wall-clock elapsed —
    // NOT one setTimeout per character rescheduled through React state,
    // which on a heavy page ran ~5x slower than speed×length under timer
    // throttling and re-render cost. A dropped frame just means the next
    // frame jumps to the right position, so the reveal always completes
    // in fullText.length × speed ms (≈1.3s for the homepage headline).
    setCharIndex(0)
    setDone(false)
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const target = Math.min(fullText.length, Math.floor((now - start) / speed))
      setCharIndex(target)
      if (target < fullText.length) {
        raf = requestAnimationFrame(tick)
      } else {
        setDone(true)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fullText, speed])

  // Split the typed chars back into lines
  let remaining = charIndex
  const renderedLines: { text: string; full: string; cls?: string; noBreakAfter?: boolean }[] = []
  for (const line of lines) {
    const visible = line.text.slice(0, remaining)
    renderedLines.push({ text: visible, full: line.text, cls: line.className, noBreakAfter: line.noBreakAfter })
    remaining = Math.max(0, remaining - line.text.length)
  }

  return (
    // Session 6.3 (WDOS Performance gate) — real, measured bug, not the
    // "minor cosmetic settling" it looked like on a visual pass: Lighthouse
    // found this component responsible for 0.75 of the homepage's 0.757
    // total CLS (X-26 requires < 0.1). The per-character reveal changes how
    // many lines the text wraps across as it grows, shifting the search
    // bar and everything else below it down the page while it types.
    // Fixed with the standard grid-stacking technique: an invisible copy of
    // the FULL final text (same tags/lines/breaks) reserves the real,
    // final height up front via `grid-area: 1 / 1`; the animated reveal
    // stacks in the same cell on top of it, so its own growth never
    // affects the outer box the browser has already laid out.
    <span className={`grid ${className}`}>
      <span aria-hidden="true" className="invisible" style={{ gridArea: '1 / 1' }}>
        {lines.map((l, i) => (
          <span key={i}>
            {l.className ? <span className={l.className}>{l.text}</span> : l.text}
            {i < lines.length - 1 && !l.noBreakAfter && <br />}
          </span>
        ))}
      </span>
      <span style={{ gridArea: '1 / 1' }}>
        {renderedLines.map((l, i) => (
          <span key={i}>
            {l.cls ? <span className={l.cls}>{l.text}</span> : l.text}
            {i < renderedLines.length - 1 && !l.noBreakAfter && l.text.length === l.full.length && <br />}
          </span>
        ))}
        {!done && (
          <span className="inline-block w-[3px] h-[0.85em] bg-gold-400 ml-1 align-middle animate-pulse" />
        )}
      </span>
    </span>
  )
}
