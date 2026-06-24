'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollRevealInit() {
  const pathname = usePathname()

  useEffect(() => {
    const opts = { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }

    /* Reveal sections */
    const sectionIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view')
          sectionIo.unobserve(e.target)
        }
      })
    }, opts)

    /* Reveal images (clip-path wipe) */
    const imageIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view')
          imageIo.unobserve(e.target)
        }
      })
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' })

    /* Stagger children within a parent */
    const staggerIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          Array.from(e.target.children).forEach((child, i) => {
            ;(child as HTMLElement).style.transitionDelay = `${i * 0.07}s`
            child.classList.add('in-view')
          })
          staggerIo.unobserve(e.target)
        }
      })
    }, { threshold: 0.04, rootMargin: '0px 0px -30px 0px' })

    const id = setTimeout(() => {
      document.querySelectorAll('[data-reveal]').forEach(el => sectionIo.observe(el))
      document.querySelectorAll('[data-reveal-image]').forEach(el => imageIo.observe(el))
      document.querySelectorAll('[data-stagger] > *').forEach(el => {
        ;(el as HTMLElement).style.opacity = '0'
        ;(el as HTMLElement).style.transform = 'translateY(4px)'
        ;(el as HTMLElement).style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)'
      })
      document.querySelectorAll('[data-stagger]').forEach(el => staggerIo.observe(el))
    }, 80)

    return () => {
      clearTimeout(id)
      sectionIo.disconnect()
      imageIo.disconnect()
      staggerIo.disconnect()
    }
  }, [pathname])

  return null
}
