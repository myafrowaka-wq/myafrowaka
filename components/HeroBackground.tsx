'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

export function HeroBackground({ src, alt }: { src: string; alt: string }) {
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    if (!mq.matches) return

    const el = imgRef.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const cx = e.clientX / window.innerWidth  - 0.5
      const cy = e.clientY / window.innerHeight - 0.5
      el.style.transform = `translate(${cx * -14}px, ${cy * -10}px) scale(1.06)`
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div
      ref={imgRef}
      className="absolute inset-0 will-change-transform"
      style={{ transition: 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)' }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
        quality={85}
      />
    </div>
  )
}
