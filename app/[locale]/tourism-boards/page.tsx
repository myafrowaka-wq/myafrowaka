import { Link } from '@/i18n/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_TOURISM_BOARDS_QUERY } from '@/sanity/lib/queries'
import { Flag } from '@/components/Flag'
import { hreflangAlternates } from '@/lib/hreflang'

// Session 5.3 — "A quiet feature with a loud payoff." Real, sourced
// profiles only — an authority with no profile here yet just doesn't
// appear, the same honest-emptiness discipline as every other content
// type on this site before real content exists for it.

interface TourismBoard {
  name: string
  slug: string
  coverage?: string
  country?: { name: string; slug: string; countryCode?: string }
}

export const metadata: Metadata = {
  title: { absolute: 'Tourism Boards – MyAfroWaka' }, // Session 6.2 — see app/[locale]/login/page.tsx's comment: opts out of the parent title.template so this doesn't render doubled.
  description: 'Official tourism authorities across Africa, and the events on MyAfroWaka they have verified.',
  alternates: { canonical: 'https://myafrowaka.com/tourism-boards', languages: hreflangAlternates('https://myafrowaka.com/tourism-boards') },
  openGraph: {
    title: 'Tourism Boards – MyAfroWaka',
    description: 'Official tourism authorities across Africa, and the events they have verified.',
    type: 'website',
    url: 'https://myafrowaka.com/tourism-boards',
  },
}

export default async function TourismBoardsPage() {
  const boards = await client.fetch<TourismBoard[]>(ALL_TOURISM_BOARDS_QUERY).catch(() => [])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'MyAfroWaka Tourism Boards',
    description: 'Official tourism authorities across Africa and the events they have verified.',
    url: 'https://myafrowaka.com/tourism-boards',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-ink border-b border-white/8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12">
          <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-gold-400 mb-3">Official Sources</p>
          <h1 className="font-display font-extrabold text-cream"
            style={{ fontSize: 'clamp(30px, 5.5vw, 56px)', lineHeight: '0.95', letterSpacing: '-0.03em' }}>
            Tourism Boards
          </h1>
          <p className="font-sans text-cream/45 mt-4 max-w-xl leading-relaxed"
            style={{ fontSize: 'clamp(13px, 1.3vw, 16px)' }}>
            The real authorities behind Africa&rsquo;s official travel information — and where a board has actually confirmed an event on MyAfroWaka, that verification is here, not just a badge we award ourselves.
          </p>
        </div>
      </div>

      <div className="bg-cream dark-flip-bg min-h-[40vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          {boards.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sand dark-flip-surf border border-line dark-flip-border mb-6">
                <svg className="w-6 h-6 text-charcoal/25 dark-flip-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 className="font-display font-bold text-charcoal dark-flip-text mb-2"
                style={{ fontSize: 'clamp(18px, 2vw, 24px)', letterSpacing: '-0.015em' }}>
                No published tourism board profiles yet
              </h2>
              <p className="font-sans text-sm text-charcoal/45 dark-flip-muted max-w-sm mx-auto leading-relaxed">
                Real, sourced profiles only — nothing here is invented ahead of an actual relationship with the authority it names.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {boards.map(b => (
                <Link key={b.slug} href={`/tourism-boards/${b.slug}`}
                  className="group block bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl p-6 transition-all">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Flag code={b.country?.countryCode} />
                    <span className="font-sans text-[14px] uppercase tracking-[0.14em] text-charcoal/50 dark-flip-muted">
                      {b.country?.name}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-2"
                    style={{ fontSize: 'clamp(15px, 1.6vw, 19px)', letterSpacing: '-0.013em' }}>
                    {b.name}
                  </h2>
                  {b.coverage && (
                    <p className="font-sans text-[14px] text-charcoal/45 dark-flip-muted leading-relaxed line-clamp-2">
                      {b.coverage}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
