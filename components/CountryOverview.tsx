import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { CollapsibleSection } from '@/components/CollapsibleSection'

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
          Source: {citation}. Rules change, confirm with the official source before you travel.
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

  // Owner review (2026-09-06) — this whole block ("everything before the
  // attractions grid") is now a real collapsible accordion, stays closed
  // until someone clicks it, per direct feedback. Reuses the same
  // CollapsibleSection every attraction page's Overview/Getting There/
  // FAQ sections already use, rather than a one-off toggle — same
  // accessible h2-wraps-button pattern, same look.
  return (
    <div className="bg-sand dark-flip-surf border-t border-b border-line dark-flip-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 lg:py-6">
        <CollapsibleSection title={`Before You Go: ${countryName}`} defaultOpen={false}>

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
            {/* Session 6.3 (WDOS T-11, eyebrow cap) — this was eyebrow-
                styled with no heading of its own (unlike the field grid
                above, which is a real definition-list under the section's
                own "Before You Go" <h2>, not a set of separate eyebrows). */}
            <h3 className="font-display font-bold text-[17px] text-charcoal dark-flip-text mb-6">
              Start Here
            </h3>
            {/* Owner review (2026-09-06) — real content added, not just a
                restyle: each card's own editorialSummary existed in the
                data this whole time and was never shown here, so every
                card said only a name and a city. Taller image + type
                badge (matching the pattern already used on the homepage's
                attraction grids) plus that summary line gives someone a
                real reason to click before they do. */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {startHereAttractions.map(a => {
                const typeLabel = a.type?.[0]?.replace('UNESCO World Heritage Site | ', '')
                return (
                  <Link key={a.slug} href={`/attractions/${a.slug}`}
                    className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-48 overflow-hidden bg-cream">
                      {/* Session 6.3 — image-redundant-alt: a.name is a visible heading in this same card below. */}
                      <Image
                        src={attractionImageUrl(a.slug)}
                        alt="" fill
                        sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                        className="object-cover img-editorial img-inner"
                      />
                      {typeLabel && (
                        <span className="absolute top-3 left-3 bg-ink/70 backdrop-blur font-sans text-[14px] uppercase tracking-[0.1em] text-cream/90 px-2.5 py-1 rounded-full">
                          {typeLabel}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      {a.city && (
                        <p className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson mb-1.5">{a.city.name}</p>
                      )}
                      <h3 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug text-[15px] mb-1.5">
                        {a.name}
                      </h3>
                      {a.editorialSummary && (
                        <p className="font-sans text-[14px] text-charcoal/60 dark-flip-muted leading-snug line-clamp-2">
                          {a.editorialSummary}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
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
        </CollapsibleSection>
      </div>
    </div>
  )
}
