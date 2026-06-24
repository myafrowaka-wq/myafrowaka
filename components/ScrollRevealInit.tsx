'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollRevealInit() {
  const pathname = usePathname()

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target) }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    )
    const id = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el))
    }, 60)
    return () => { clearTimeout(id); io.disconnect() }
  }, [pathname])

  return null
}
