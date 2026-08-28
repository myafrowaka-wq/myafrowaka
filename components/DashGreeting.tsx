'use client'

import { useState, useEffect } from 'react'

function greetForHour(h: number): string {
  if (h < 5)  return 'Good night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashGreeting({ firstName }: { firstName: string }) {
  const [greeting, setGreeting] = useState('')
  const [date, setDate]         = useState('')

  useEffect(() => {
    const now = new Date()
    setGreeting(greetForHour(now.getHours()))
    setDate(now.toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }))
  }, [])

  return (
    <>
      <p className="font-sans text-[14px] uppercase tracking-[0.24em] text-gold-400/55 mb-1.5">
        {date}
      </p>
      <h1
        className="font-display font-extrabold text-cream"
        style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.025em', lineHeight: '1.1' }}
      >
        {greeting || 'Welcome back'}, {firstName}
      </h1>
    </>
  )
}
