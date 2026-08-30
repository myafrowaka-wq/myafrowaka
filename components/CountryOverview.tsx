import { Link } from '@/i18n/navigation'
import Image from 'next/image'

type StartHereAttraction = {
  name: string; slug: string; type?: string[]; editorialSummary?: string
  city?: { name: string }
}

type CountryOverviewProps = {
  countryName: string
  countrySlug: string
  whenToGo?: string
  knownFor?: string
  surprises?: string
  gettingAround?: string
  visaInfo?: string
  safetyInfo?: string
  startHereAttractions?: StartHereAttraction[]
  attractionImageUrl: (slug: string) => string
}

// Sourced, time-sensitive claims (visa rules, safety advisories) are stored
// with a `[VERIFY, source: X, checked Y]` prefix — the Brain's own editorial
// convention (Layer 1.3) for anything that can go stale. Shown raw, that
// bracket reads as a bug to a real visitor. Parsed here into a proper
// "Source: X · Checked Y" citation line plus the clean claim text, since the
// honesty this is protecting (this changes, confirm before you travel)
// belongs in the UI too, not just the CMS record.
function parseVerify(text?: string): { body: string; citation: string | null } {
  if (!text) return { body: '', citation: null }
  const match = text.match(/^\[VERIFY,\s*([\s\S]+?)\]\s*([\s\S]*)$/)
  if (!match) return { body: text, citation: null }
  const [, meta, body] = match
  return { body, citation: meta.replace(/^source:\s*/i, '') }
}

function OverviewField({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div>
      <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-crimson mb-2">{label}</p>
      <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed">{value}</p>
    </div>
  )
}

function SourcedField({ label, value }: { label: string; value?: string }) {
  const { body, citation } = parseVerify(value)
  if (!body) return null
  return (
    <div>
      <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-crimson mb-2">{label}</p>
      <p className="font-sans text-[15px] text-charcoal/75 dark-flip-muted leading-relaxed">{body}</p>
      {citation && (
        <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted mt-2 italic">
          Source: {citation}. Rules change — confirm with the official source before you travel.
        </p>
      )}
    </div>
  )
}

export function CountryOverview({
  countryName,
  countrySlug,
  whenToGo,
  knownFor,
  surprises,
  gettingAround,
  visaInfo,
  safetyInfo,
  startHereAttractions,
  attractionImageUrl,
}: CountryOverviewProps) {
  const hasOverview = whenToGo || knownFor || surprises || gettingAround
  const hasPractical = visaInfo || safetyInfo
  const hasStartHere = startHereAttractions && startHereAttractions.length > 0

  if (!hasOverview && !hasPractical && !hasStartHere) return null

  return (
    <div className="bg-sand dark-flip-surf border-t border-b border-line dark-flip-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-18">
        <h2 className="font-display font-bold text-charcoal dark-flip-text mb-10"
          style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', letterSpacing: '-0.018em' }}>
          Before You Go: {countryName}
        </h2>

        {hasOverview && (
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mb-12">
            <OverviewField label="When to Go"      value={whenToGo} />
            <OverviewField label="Known For"        value={knownFor} />
            <OverviewField label="What Surprises People" value={surprises} />
            <OverviewField label="Getting Around"   value={gettingAround} />
          </div>
        )}

        {hasPractical && (
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mb-12 pt-10 border-t border-line dark-flip-border">
            <SourcedField label="Visa Position"    value={visaInfo} />
            <SourcedField label="Safety Position"  value={safetyInfo} />
          </div>
        )}

        {hasStartHere && (
          <div className="pt-10 border-t border-line dark-flip-border">
            <p className="font-sans text-[14px] uppercase tracking-[0.16em] text-crimson mb-6">
              Start Here
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {startHereAttractions.map(a => (
                <Link key={a.slug} href={`/attractions/${a.slug}`}
                  className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-40 overflow-hidden bg-cream">
                    {/* Session 6.3 — image-redundant-alt: a.name is a visible heading in this same card below. */}
                    <Image
                      src={attractionImageUrl(a.slug)}
                      alt="" fill
                      sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                      className="object-cover img-editorial img-inner"
                    />
                  </div>
                  <div className="p-4">
                    {a.city && (
                      <p className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson mb-1.5">{a.city.name}</p>
                    )}
                    <h3 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug text-[15px]">
                      {a.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            {startHereAttractions.length < 3 && (
              <Link href={`/destinations/${countrySlug}`}
                className="inline-flex items-center gap-1.5 mt-5 font-sans text-[14px] uppercase tracking-[0.14em] text-crimson/70 hover:text-crimson transition-colors">
                See all attractions in {countryName}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
