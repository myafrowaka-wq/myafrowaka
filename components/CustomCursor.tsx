'use client'

import { useEffect, useRef } from 'react'

export function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* Only activate on pointer:fine (mouse) devices */
    const mq = window.matchMedia('(pointer: fine)')
    if (!mq.matches) return

    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    dot.style.opacity  = '1'
    ring.style.opacity = '1'

    let mouseX = 0, mouseY = 0
    let ringX  = 0, ringY  = 0
    let raf: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const animate = () => {
      ringX = lerp(ringX, mouseX, 0.12)
      ringY = lerp(ringY, mouseY, 0.12)
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    /* Expand ring on hoverable elements */
    const expand = () => ring.classList.add('cursor-expanded')
    const shrink = () => ring.classList.remove('cursor-expanded')
    const targets = 'a,button,[role="button"],[tabindex]'

    const addListeners = () => {
      document.querySelectorAll<HTMLElement>(targets).forEach(el => {
        el.addEventListener('mouseenter', expand)
        el.addEventListener('mouseleave', shrink)
      })
    }
    addListeners()

    document.addEventListener('mousemove', onMove)
    const mo = new MutationObserver(addListeners)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('mousemove', onMove)
      mo.disconnect()
    }
  }, [])

  return (
    <>
      {/* Small dot — snaps to cursor */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="cursor-dot"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
      {/* Ring — lags behind for depth */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="cursor-ring"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </>
  )
}
