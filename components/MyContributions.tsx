import { Link } from '@/i18n/navigation'

// Session 4.3 — "contributor credit when someone's tip gets published."
// Needed sanity/schemaTypes/attraction.ts's new submittedByUserId field to
// exist at all (nothing tracked this before this session). Shows every
// attraction this Contributor has submitted, whatever its current status —
// not just the published ones — so someone can see their Draft is still
// waiting on review, not wonder if it vanished.

export interface Contribution {
  name: string
  slug: string
  contentStatus: string
  country?: { name: string } | null
}

const STATUS_STYLE: Record<string, string> = {
  Draft:          'bg-charcoal/8 text-charcoal/55',
  Verified:       'bg-gold-50 text-gold-700 dark:bg-gold-900/20 dark:text-gold-400',
  Published:      'bg-moss-100 text-moss-700 dark:bg-moss-800/30 dark:text-moss-300',
  'Needs Update': 'bg-crimson/8 text-crimson',
  Incomplete:     'bg-ochre-50 text-ochre-700 dark:bg-ochre-900/20 dark:text-ochre-300',
  Archived:       'bg-charcoal/5 text-charcoal/65',
}

export function MyContributions({ contributions }: { contributions: Contribution[] }) {
  if (contributions.length === 0) return null

  const publishedCount = contributions.filter(c => c.contentStatus === 'Published').length

  return (
    <div className="mt-4">
      <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-3">
        Your submissions
        {publishedCount > 0 && (
          <span className="font-normal text-charcoal/45 dark-flip-muted"> &middot; {publishedCount} published — thank you</span>
        )}
      </p>
      <div className="space-y-2">
        {contributions.map(c => (
          <div key={c.slug} className="flex items-center justify-between gap-3 bg-white dark-flip-card border border-line dark-flip-border rounded-xl px-4 py-2.5">
            <div className="min-w-0">
              {c.contentStatus === 'Published' ? (
                <Link href={`/attractions/${c.slug}`} className="font-sans text-sm text-charcoal dark-flip-text hover:text-crimson transition-colors truncate block">
                  {c.name}
                </Link>
              ) : (
                <span className="font-sans text-sm text-charcoal dark-flip-text truncate block">{c.name}</span>
              )}
              {c.country?.name && <span className="font-sans text-[14px] text-charcoal/65 dark-flip-muted">{c.country.name}</span>}
            </div>
            <span className={`shrink-0 font-sans text-[14px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full ${STATUS_STYLE[c.contentStatus] ?? 'bg-charcoal/8 text-charcoal/65'}`}>
              {c.contentStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
