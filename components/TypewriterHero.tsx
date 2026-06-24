'use client'

import { useState, useEffect } from 'react'

export function TypewriterHero({
  lines,
  speed = 38,
  className = '',
}: {
  lines: { text: string; className?: string }[]
  speed?: number
  className?: string
}) {
  const fullText = lines.map(l => l.text).join('\n')
  const [charIndex, setCharIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (charIndex < fullText.length) {
      const t = setTimeout(() => setCharIndex(i => i + 1), speed)
      return () => clearTimeout(t)
    }
    setDone(true)
  }, [charIndex, fullText, speed])

  // Split the typed chars back into lines
  let remaining = charIndex
  const renderedLines: { text: string; full: string; cls?: string }[] = []
  for (const line of lines) {
    const visible = line.text.slice(0, remaining)
    renderedLines.push({ text: visible, full: line.text, cls: line.className })
    remaining = Math.max(0, remaining - line.text.length)
  }

  return (
    <span className={className}>
      {renderedLines.map((l, i) => (
        <span key={i}>
          {l.cls ? <span className={l.cls}>{l.text}</span> : l.text}
          {i < renderedLines.length - 1 && l.text.length === l.full.length && <br />}
        </span>
      ))}
      {!done && (
        <span className="inline-block w-[3px] h-[0.85em] bg-gold-400 ml-1 align-middle animate-pulse" />
      )}
    </span>
  )
}
