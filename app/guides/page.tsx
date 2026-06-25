import Link from 'next/link'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_GUIDES_QUERY } from '@/sanity/lib/queries'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Guide {
  title: string
  slug: string
  focusKeyword?: string
  metaDescription?: string
  itemCount: number
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Travel Guides – MyAfroWaka',
  description: 'Curated best-of guides to attractions across Africa. Ranked lists built from verified field research.',
  openGraph: {
    title: 'Travel Guides – MyAfroWaka',
    description: 'Curated best-of guides to attractions across Africa.',
    type: 'website',
  },
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GuidesPage() {
  const guides = await client.fetch<Guide[]>(ALL_GUIDES_QUERY)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'MyAfroWaka Travel Guides',
    description: 'Curated ranked lists of the best attractions across Africa.',
    url: 'https://myafrowaka.com/guides',
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="bg-ink border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">
          <nav className="flex flex-wrap gap-1 items-center font-mono text-[9px] uppercase tracking-[0.14em] text-cream/35 mb-6">
            <Link href="/" className="hover:text-cream/70 transition-colors">Home</Link>
            <span className="text-cream/15">/</span>
            <span className="text-cream/55">Guides</span>
          </nav>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-400 mb-3">Best-of Africa</p>
          <h1
            className="font-display font-extrabold text-cream"
            style={{ fontSize: 'clamp(30px, 5.5vw, 64px)', lineHeight: '0.92', letterSpacing: '-0.03em' }}
          >
            Travel Guides
          </h1>
          <p className="font-sans text-cream/45 mt-4 max-w-xl leading-relaxed"
            style={{ fontSize: 'clamp(13px, 1.3vw, 16px)' }}>
            Curated ranked lists built from verified field research. Each guide links to full attraction profiles with practical information.
          </p>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="bg-cream dark-flip-bg min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          {guides.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {guides.map((g, i) => (
                <GuideCard key={g.slug} guide={g} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GuideCard({ guide, index }: { guide: Guide; index: number }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <Link href={`/guides/${guide.slug}`}
      className="group relative block bg-cream dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-2xl p-6 hover:shadow-[var(--shadow-soft)] transition-all overflow-hidden">
      <span
        className="absolute top-4 right-5 font-mono font-bold text-[38px] leading-none text-charcoal/5 dark-flip-muted select-none"
        aria-hidden>
        {num}
      </span>
      {guide.focusKeyword && (
        <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-gold-600 mb-3">{guide.focusKeyword}</p>
      )}
      <h2 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors mb-3 pr-8"
        style={{ fontSize: 'clamp(15px, 1.6vw, 19px)', letterSpacing: '-0.013em', lineHeight: '1.2' }}>
        {guide.title}
      </h2>
      {guide.metaDescription && (
        <p className="font-sans text-[12px] text-charcoal/45 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
          {guide.metaDescription}
        </p>
      )}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-charcoal/28 dark-flip-muted">
          {guide.itemCount} {guide.itemCount === 1 ? 'attraction' : 'attractions'}
        </span>
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors">
          Read &#8594;
        </p>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sand dark-flip-surf border border-line dark-flip-border mb-6">
        <svg className="w-6 h-6 text-charcoal/25 dark-flip-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </div>
      <h2 className="font-display font-bold text-charcoal dark-flip-text mb-2"
        style={{ fontSize: 'clamp(18px, 2vw, 24px)', letterSpacing: '-0.015em' }}>
        Guides coming soon
      </h2>
      <p className="font-sans text-sm text-charcoal/45 dark-flip-muted max-w-sm mx-auto mb-8 leading-relaxed">
        Create an Editorial Pillar document in Sanity Studio and set the status to Published to see it here.
      </p>
      <Link href="/search"
        className="font-mono text-[9px] uppercase tracking-[0.14em] text-crimson hover:text-crimson/70 transition-colors">
        Browse all attractions &#8594;
      </Link>
    </div>
  )
}
