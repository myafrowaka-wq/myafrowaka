import { Link } from '@/i18n/navigation'
import { Flag } from '@/components/Flag'

// Session 4.3 — "a travel passport showing countries visited... Status,
// not points." The plan's explicit alternative to points/badges. Visits
// real data collected back in Session 4.1's profile system
// (userRole.countriesVisited) rather than inventing a new field — the
// passport is a *view* of that data, not a second, competing source of
// truth for the same fact.

interface Country { _id: string; name: string; slug: string; countryCode?: string }

export function TravelPassport({ homeCountry, countriesVisited }: {
  homeCountry?: Country | null
  countriesVisited: Country[]
}) {
  if (countriesVisited.length === 0) {
    return (
      <div className="border border-dashed border-line dark-flip-border rounded-2xl p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mx-auto mb-4 text-gold-600 dark:text-gold-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 000 18M12.5 3a17 17 0 010 18"/>
          </svg>
        </div>
        <p className="font-display font-semibold text-[14px] text-charcoal dark-flip-text mb-1.5">
          Your passport is empty
        </p>
        <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted mb-5 max-w-xs mx-auto leading-relaxed">
          Add the countries you&rsquo;ve visited to your profile below, and they&rsquo;ll show up here.
        </p>
        <Link href="/user-dashboard#profile"
          className="inline-flex items-center gap-2 bg-ink hover:bg-charcoal text-cream font-sans text-[14px] uppercase tracking-[0.14em] px-5 py-2.5 rounded-full transition-colors">
          Edit Profile
        </Link>
      </div>
    )
  }

  return (
    <div>
      <p className="font-sans text-[14px] text-charcoal/55 dark-flip-muted mb-4">
        <span className="font-display font-bold text-charcoal dark-flip-text" style={{ fontSize: '20px' }}>{countriesVisited.length}</span>
        {' '}countr{countriesVisited.length !== 1 ? 'ies' : 'y'} stamped
        {homeCountry && <> &middot; home base: <span className="font-semibold text-charcoal/75 dark-flip-text">{homeCountry.name}</span></>}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {countriesVisited.map(c => (
          <Link key={c._id} href={`/destinations/${c.slug}`}
            className="group flex items-center gap-2.5 bg-white dark-flip-card border border-line dark-flip-border hover:border-gold-300 rounded-xl px-3.5 py-3 transition-all">
            <Flag code={c.countryCode} className="text-lg shrink-0" />
            <span className="font-sans text-sm text-charcoal dark-flip-text group-hover:text-crimson transition-colors truncate">{c.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
