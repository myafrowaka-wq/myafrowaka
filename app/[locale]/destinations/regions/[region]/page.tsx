import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { COUNTRIES_BY_REGION_QUERY, POSTS_BY_REGION_QUERY } from '@/sanity/lib/queries'
import { REGION_COLOR } from '@/lib/regionColors'
import { Flag } from '@/components/Flag'
import { stockImage, countryStockImage, blogStockImage } from '@/lib/stockImageCredits'
import { hreflangAlternates } from '@/lib/hreflang'
import { twitterCard } from '@/lib/twitterCard'

// "Region" isn't a Sanity document type — see lib/regionColors.ts's
// REGION_COLOR for the fixed 6-value taxonomy this whole site already
// treats as canonical (Nav's mega-menu, DestinationsGrid, every attraction/
// event's continentRegion field). This page reads real country and post
// documents filtered by that field, the same source of truth every other
// region-aware view already uses — nothing here is a new, separately
// maintained region list.

const REGIONS = ['North Africa', 'West Africa', 'East Africa', 'Central Africa', 'Southern Africa', 'Indian Ocean Islands'] as const

// Same real, already-sourced/credited stock photo per region Nav.tsx's
// mega-menu already uses (see components/Nav.tsx's own REGIONS constant) —
// reused rather than picking new, unvetted images for a hero nobody's
// checked the licensing on.
const REGION_HERO_IMAGE: Record<string, string> = {
  // Session 6.3 (WDOS Performance gate) — see lib/stockImageCredits.ts's
  // comment on COUNTRY_IMAGE_IDS.kenya: this ID was a graphic lion-kill
  // photo copied here from Nav.tsx's own (also wrong, also now fixed)
  // REGIONS constant, mismatched as this page's own hero banner.
  'East Africa':          stockImage('hero-savanna-poster'),
  'West Africa':          stockImage('1727023663928-1772e2c7e679'),
  'North Africa':         stockImage('1760681554227-d7aad73cd57f'),
  'Southern Africa':      stockImage('1744604030401-b24c5975a574'),
  'Central Africa':       stockImage('1673624522244-8de0d50b8492'),
  'Indian Ocean Islands': stockImage('1513415277900-a62401e19be4'),
}

function toSlug(region: string) {
  return region.toLowerCase().replace(/\s+/g, '-')
}
function fromSlug(slug: string): string | null {
  return REGIONS.find(r => toSlug(r) === slug) ?? null
}
function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface RegionCountry {
  name: string; slug: string; countryCode?: string; continentRegion: string; overview?: string
}
interface RegionPost {
  title: string; slug: string; publishedAt?: string; excerpt?: string; category?: string; countryName?: string
}

async function getRegionData(region: string) {
  const [countries, posts] = await Promise.all([
    client.fetch<RegionCountry[]>(COUNTRIES_BY_REGION_QUERY, { region }).catch(() => []),
    client.fetch<RegionPost[]>(POSTS_BY_REGION_QUERY, { region }).catch(() => []),
  ])
  return { countries, posts }
}

// A completely fixed, finite 6-value taxonomy (not CMS content that grows
// between deploys) — dynamicParams: false makes any other value 404
// immediately rather than attempt an on-demand render. See Session 6.3's
// notes on events/collections/[collection] and guides/[slug]: this
// deliberately avoids the same on-demand-fallback rendering path that was
// found broken on this Next.js version, by never relying on it in the
// first place.
export function generateStaticParams() {
  return REGIONS.map(r => ({ region: toSlug(r) }))
}
export const dynamicParams = false

export async function generateMetadata(
  { params }: { params: Promise<{ region: string }> }
): Promise<Metadata> {
  const { region: regionSlug } = await params
  const region = fromSlug(regionSlug)
  if (!region) return {}
  const title = `${region} Travel Guide – MyAfroWaka`
  const description = `Explore ${region}: real country guides, verified attractions, and stories from across the region.`
  const canonicalUrl = `https://myafrowaka.com/destinations/regions/${regionSlug}`
  return {
    // Session 6.2 — see app/[locale]/login/page.tsx's comment: `absolute`
    // stops the parent title.template from double-appending "– MyAfroWaka".
    title: { absolute: title }, description,
    alternates: { canonical: canonicalUrl, languages: hreflangAlternates(canonicalUrl) },
    openGraph: { title, description, type: 'website', url: canonicalUrl },
    // Session 6.3 (WDOS SEO gate) — see lib/twitterCard.ts: without this,
    // Twitter cards silently fell back to the layout's generic default.
    twitter: twitterCard({ title, description }),
  }
}

export default async function RegionPage(
  { params }: { params: Promise<{ region: string }> }
) {
  const { region: regionSlug } = await params
  const region = fromSlug(regionSlug)
  if (!region) notFound()

  const { countries, posts } = await getRegionData(region)
  const heroImage = REGION_HERO_IMAGE[region]

  return (
    <>
      {/* Hero band */}
      <div className="relative h-[320px] sm:h-[380px] overflow-hidden">
        <Image src={heroImage} alt="" fill sizes="100vw" priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-end pb-10">
          <nav className="font-sans text-[14px] uppercase tracking-[0.14em] text-cream/65 mb-4 flex gap-1">
            <Link href="/" className="hover:text-crimson transition-colors">Home</Link>
            <span>/</span>
            <Link href="/attractions" className="hover:text-crimson transition-colors">Destinations</Link>
            <span>/</span>
            <span className="text-cream">{region}</span>
          </nav>
          <h1 className="font-display font-bold text-cream mb-2" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', letterSpacing: '-0.02em' }}>
            {region}
          </h1>
          <p className="font-sans text-[16px] text-cream/80">
            {countries.length} {countries.length === 1 ? 'country' : 'countries'} · {posts.length} {posts.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
      </div>

      {/* Countries */}
      <section className="bg-cream dark-flip-bg py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial mb-10"
            style={{ fontSize: 'clamp(22px, 2.8vw, 34px)', lineHeight: '1.0' }}>
            Countries in {region}
          </h2>

          {countries.length === 0 ? (
            <p className="font-sans text-sm text-charcoal/65 dark-flip-muted italic">Country guides for this region are being added.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {countries.map(c => (
                <Link key={c.slug} href={`/destinations/${c.slug}`}
                  className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-40 overflow-hidden">
                    <Image src={countryStockImage(c.slug)} alt="" fill sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                      className="object-cover" style={{ backgroundColor: REGION_COLOR[c.continentRegion] }} />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Flag code={c.countryCode ?? ''} />
                      <h3 className="font-display font-bold text-lg text-charcoal dark-flip-text group-hover:text-crimson transition-colors">
                        {c.name}
                      </h3>
                    </div>
                    {c.overview && (
                      <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2">{c.overview}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stories */}
      <section className="bg-sand dark-flip-surf py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial mb-10"
            style={{ fontSize: 'clamp(22px, 2.8vw, 34px)', lineHeight: '1.0' }}>
            Stories from {region}
          </h2>

          {posts.length === 0 ? (
            <p className="font-sans text-sm text-charcoal/65 dark-flip-muted italic">No stories from this region yet.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map(p => (
                <Link key={p.slug} href={`/blog/${p.slug}`}
                  className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image src={blogStockImage(p.slug)} alt="" fill sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    {p.category && <p className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson mb-2">{p.category}</p>}
                    <h3 className="font-display font-bold text-lg text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2">
                      {p.title}
                    </h3>
                    {p.excerpt && <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2 mb-3">{p.excerpt}</p>}
                    <p className="font-sans text-[14px] text-charcoal/65 dark-flip-muted">
                      {[p.countryName, formatDate(p.publishedAt)].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
