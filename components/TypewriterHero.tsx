'use client'

import { useState, useEffect } from 'react'

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
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // X-11 / M-08: the per-character reveal is driven by setTimeout, not CSS
  // animation, so the global prefers-reduced-motion override in globals.css
  // can't stop it — it has to be checked here and skipped entirely.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setCharIndex(fullText.length)
      setDone(true)
      return
    }
    if (charIndex < fullText.length) {
      const t = setTimeout(() => setCharIndex(i => i + 1), speed)
      return () => clearTimeout(t)
    }
    setDone(true)
  }, [charIndex, fullText, speed, reducedMotion])

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
