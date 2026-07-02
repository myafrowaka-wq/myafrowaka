'use client'
import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight
      setProgress(h <= 0 ? 100 : Math.round((window.scrollY / h) * 100))
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none">
      <div className="h-full bg-crimson transition-none" style={{ width: `${progress}%` }} />
    </div>
  )
}
