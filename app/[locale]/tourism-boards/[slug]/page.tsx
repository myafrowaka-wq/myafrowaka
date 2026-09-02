import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { ALL_TOURISM_BOARD_SLUGS_QUERY, TOURISM_BOARD_BY_SLUG_QUERY } from '@/sanity/lib/queries'
import { Flag } from '@/components/Flag'
import { VerificationBadge } from '@/components/EventCard'
import { hreflangAlternates } from '@/lib/hreflang'
import { twitterCard } from '@/lib/twitterCard'

// Session 5.3 — the actual profile page the plan describes as the real
// outreach opener: "we have built you a profile page, will you verify
// your events calendar?" verifiedEvents is a real reference array, not a
// claim — an event only shows up here once this specific board has
// actually confirmed it.

interface VerifiedEvent {
  name: string; slug: string; category?: string
  dateType?: string; startDate?: string; endDate?: string
  estimatedTiming?: string; verificationStatus?: string
}

interface TourismBoard {
  name: string
  coverage?: string
  officialUrl?: string
  officialEventsCalendarUrl?: string
  pressContactName?: string
  pressContactEmail?: string
  country?: { name: string; slug: string; countryCode?: string }
  verifiedEvents?: VerifiedEvent[]
}

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(ALL_TOURISM_BOARD_SLUGS_QUERY).catch(() => [])
  return slugs
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const board = await client.fetch<TourismBoard | null>(TOURISM_BOARD_BY_SLUG_QUERY, { slug })
  if (!board) return {}
  const canonicalUrl = `https://myafrowaka.com/tourism-boards/${slug}`
  const description = board.coverage || `${board.name}: the official tourism authority for ${board.country?.name ?? 'this destination'}.`
  return {
    // Session 6.2 — see app/[locale]/login/page.tsx's comment: `absolute`
    // stops the parent title.template from double-appending "– MyAfroWaka".
    // openGraph's own title below is untouched — never templated.
    title: { absolute: `${board.name} – MyAfroWaka` },
    description,
    alternates: { canonical: canonicalUrl, languages: hreflangAlternates(canonicalUrl) },
    openGraph: { title: `${board.name} – MyAfroWaka`, description, type: 'website', url: canonicalUrl },
    // Session 6.3 (WDOS SEO gate) — see lib/twitterCard.ts: without this,
    // Twitter cards silently fell back to the layout's generic default.
    twitter: twitterCard({ title: `${board.name} – MyAfroWaka`, description }),
  }
}

export default async function TourismBoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const board = await client.fetch<TourismBoard | null>(TOURISM_BOARD_BY_SLUG_QUERY, { slug })
  if (!board) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentOrganization',
    name: board.name,
    ...(board.officialUrl ? { url: board.officialUrl } : {}),
    ...(board.country ? { areaServed: board.country.name } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="bg-ink border-b border-white/8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-12">
          {board.country && (
            <div className="flex items-center gap-2.5 mb-4">
              <Flag code={board.country.countryCode} />
              <Link href={`/destinations/${board.country.slug}`}
                className="font-sans text-[14px] uppercase tracking-[0.16em] text-gold-400 hover:text-gold-300 transition-colors">
                {board.country.name}
              </Link>
            </div>
          )}
          <h1 className="font-display font-extrabold text-cream"
            style={{ fontSize: 'clamp(26px, 4.5vw, 48px)', lineHeight: '1.05', letterSpacing: '-0.02em' }}>
            {board.name}
          </h1>
          {board.coverage && (
            <p className="font-sans text-cream/55 mt-4 max-w-xl leading-relaxed"
              style={{ fontSize: 'clamp(13px, 1.3vw, 16px)' }}>
              {board.coverage}
            </p>
          )}
        </div>
      </div>

      <div className="bg-cream dark-flip-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10">

          {(board.officialUrl || board.officialEventsCalendarUrl || board.pressContactEmail) && (
            <div className="border border-line dark-flip-border rounded-2xl p-6 space-y-3">
              <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/50 dark-flip-muted mb-2">Official Sources</p>
              {board.officialUrl && (
                <a href={board.officialUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-sm text-crimson hover:text-crimson/70 transition-colors break-all">
                  Official website &#8594;
                </a>
              )}
              {board.officialEventsCalendarUrl && (
                <a href={board.officialEventsCalendarUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-sm text-crimson hover:text-crimson/70 transition-colors break-all">
                  Official events calendar &#8594;
                </a>
              )}
              {board.pressContactEmail && (
                <p className="font-sans text-sm text-charcoal/65 dark-flip-muted">
                  Press contact: {board.pressContactName ? `${board.pressContactName}, ` : ''}
                  <a href={`mailto:${board.pressContactEmail}`} className="text-crimson hover:text-crimson/70 transition-colors">
                    {board.pressContactEmail}
                  </a>
                </p>
              )}
            </div>
          )}

          <div>
            <p className="font-sans text-[14px] uppercase tracking-[0.18em] text-charcoal/50 dark-flip-muted mb-4">
              Events Verified by {board.name}
            </p>
            {board.verifiedEvents && board.verifiedEvents.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {board.verifiedEvents.map(ev => (
                  <Link key={ev.slug} href={`/events/${ev.slug}`}
                    className="block bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-xl p-4 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-display font-bold text-charcoal dark-flip-text text-[15px]">{ev.name}</p>
                      <VerificationBadge status={ev.verificationStatus} />
                    </div>
                    {ev.category && <p className="font-sans text-[14px] text-charcoal/45 dark-flip-muted">{ev.category}</p>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="font-sans text-sm text-charcoal/45 dark-flip-muted italic">
                {board.name}{' '}hasn&rsquo;t verified any events on MyAfroWaka yet. This is exactly the relationship a real profile page exists to start.
              </p>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
