import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Events – MyAfroWaka',
  description: 'Festivals, cultural celebrations, and dated happenings across Africa. Coming to MyAfroWaka soon.',
  alternates: { canonical: 'https://myafrowaka.com/events' },
}

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-cream dark-flip-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
        <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-gold-text dark:text-gold-400 mb-5">
          Events
        </p>
        <h1
          className="font-display font-extrabold text-charcoal dark-flip-text mb-6"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: '0.98', letterSpacing: '-0.025em' }}
        >
          Coming soon.
        </h1>
        <p className="font-sans text-charcoal/70 dark-flip-muted leading-relaxed max-w-xl mx-auto"
          style={{ fontSize: 'clamp(15px, 1.4vw, 17px)' }}>
          We are building a real, dated events calendar: festivals, cultural celebrations, and seasonal happenings
          across Africa, each one verified before it goes live. Not a placeholder grid of stock photos, an actual
          database of things worth planning a trip around.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/blog"
            className="inline-flex items-center gap-2 bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] px-8 py-3.5 rounded-full transition-colors">
            Read Stories From the Continent
          </Link>
          <Link href="/destinations/kenya"
            className="inline-flex items-center gap-2 border border-line dark-flip-border text-charcoal dark-flip-text hover:border-crimson font-display font-bold text-[14px] uppercase tracking-[0.12em] px-8 py-3.5 rounded-full transition-colors">
            Explore Destinations
          </Link>
        </div>
      </div>
    </div>
  )
}
