'use client'

import { useEffect, useRef } from 'react'

interface ParallaxHeroProps {
  children: React.ReactNode
  factor?: number  // 0.0 = no parallax, 0.4 = strong
}

export function ParallaxHero({ children, factor = 0.25 }: ParallaxHeroProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip parallax on touch devices (better performance)
    if (window.matchMedia('(hover: none)').matches) return

    const el = ref.current
    if (!el) return

    let ticking = false
    const update = () => {
      const top = el.parentElement?.getBoundingClientRect().top ?? 0
      el.style.transform = `translateY(${top * factor}px)`
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [factor])

  return (
    <div
      ref={ref}
      className="absolute inset-0"
      style={{ willChange: 'transform', transform: 'translateY(0)' }}
    >
      {children}
    </div>
  )
}
