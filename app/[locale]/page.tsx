import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { client } from '@/sanity/lib/client'
import { EditorialSlider } from '@/components/EditorialSlider'
import { TypewriterHero } from '@/components/TypewriterHero'
import { PlanTripCard } from '@/components/PlanTripCard'
import { HeroSearchBar } from '@/components/HeroSearchBar'
import { HeroBackgroundMedia } from '@/components/HeroBackgroundMedia'
import { DestinationsGrid } from '@/components/DestinationsGrid'
import { PopularPills } from '@/components/PopularPills'
import { ExperiencesCarousel } from '@/components/ExperiencesCarousel'
import { FALLBACK_POSTS } from '@/lib/fallbackPosts'
import { stockImage, attractionStockImage, blogStockImage, HERO_VIDEO_CREDIT } from '@/lib/stockImageCredits'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { hreflangAlternates } from '@/lib/hreflang'

export const metadata: Metadata = {
  title: 'MyAfroWaka – Discover Africa Beyond the Stereotype',
  description:
    'Verified travel guides across Africa written by people who live here. Explore destinations, experiences, and insider knowledge from every corner of the continent.',
  alternates: { canonical: 'https://myafrowaka.com', languages: hreflangAlternates('https://myafrowaka.com') },
}

const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MyAfroWaka',
    url: 'https://myafrowaka.com',
    logo: 'https://myafrowaka.com/icon.png',
    sameAs: ['https://twitter.com/myafrowaka_'],
    contactPoint: { '@type': 'ContactPoint', email: 'info@myafrowaka.com', contactType: 'customer support' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MyAfroWaka',
    url: 'https://myafrowaka.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://myafrowaka.com/search?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  },
]

const FEATURED_QUERY = `
  *[_type == "attraction" && contentStatus == "Published"] | order(_updatedAt desc)[0..7]{
    name, "slug": slug.current, type, continentRegion, editorialSummary,
    "country": country->{ name, "slug": slug.current }
  }
`
const GUIDES_QUERY = `
  *[_type == "attraction" && contentStatus == "Published" && defined(articleBody) && length(articleBody) > 0]
  | order(_updatedAt desc)[0..3]{
    name, "slug": slug.current, editorialSummary, continentRegion, type, _updatedAt,
    "country": country->{ name, "slug": slug.current }
  }
`
const POPULAR_QUERY = `*[_type == "attraction" && contentStatus == "Published"][0..29]{ name, "slug": slug.current }`
const LATEST_POSTS_QUERY = `
  *[_type == "post" && contentStatus == "Published"] | order(publishedAt desc)[0..2]{
    title, "slug": slug.current, publishedAt, excerpt, category, tags,
    "author": author->{ name }
  }
`

type GuideItem = {
  name: string; slug: string; continentRegion: string
  editorialSummary: string; image: string; country: string
}
type AttrItem = { slug: string; name: string; editorialSummary?: string; continentRegion?: string; country?: { name: string } }

const EXPERIENCES = [
  { label: 'Safari',    slug: 'safari',  desc: 'The Big Five and beyond',               image: stockImage('1741850820849-1b63a5911606')  },
  { label: 'Culture',   slug: 'culture', desc: 'Living traditions across the continent', image: stockImage('1597212618440-806262de4f6b')  },
  { label: 'Beach',     slug: 'beach',   desc: 'Indian Ocean and Atlantic shores',       image: stockImage('1577455486223-089171b4572f')  },
  { label: 'History',   slug: 'history', desc: 'Ancient kingdoms and World Heritage',    image: stockImage('1640005438758-861043e64aa5')  },
  { label: 'Hiking',    slug: 'hiking',  desc: 'Trails from Simien to Table Mountain',   image: stockImage('1563985336376-568060942b80')  },
  { label: 'Food',      slug: 'food',    desc: 'Tagines, jollof, nyama choma',           image: stockImage('1664992960082-0ea299a9c53e')  },
]

const FALLBACK_GUIDES: GuideItem[] = [
  {
    name: 'Pyramids of Giza: The Complete Travel Guide',
    slug: 'pyramids-of-giza', continentRegion: 'North Africa', country: 'Egypt',
    editorialSummary: 'The last surviving Wonder of the Ancient World, standing on the Giza Plateau outside Cairo. Everything you need to know before you visit.',
    image: stockImage('1736443830251-dda3cb6df76c'),
  },
  {
    name: 'Bwindi Impenetrable Forest: Mountain Gorilla Encounter',
    slug: 'bwindi-impenetrable-national-park', continentRegion: 'East Africa', country: 'Uganda',
    editorialSummary: 'Home to half the world mountain gorilla population, Bwindi covers 321 square kilometres of southwestern Uganda.',
    image: stockImage('1673624522244-8de0d50b8492'),
  },
  {
    name: 'Table Mountain: Everything You Need to Know',
    slug: 'table-mountain', continentRegion: 'Southern Africa', country: 'South Africa',
    editorialSummary: 'Cape Town iconic flat-topped summit rises 1,085 metres above sea level and harbours more plant species than the entire United Kingdom.',
    image: stockImage('1746876269545-c23ecff55722'),
  },
  {
    name: 'Serengeti National Park: The Migration Guide',
    slug: 'serengeti-national-park', continentRegion: 'East Africa', country: 'Tanzania',
    editorialSummary: 'The Great Migration moves 1.5 million wildebeest and 250,000 zebras in a continuous annual circuit across Tanzania and Kenya.',
    image: stockImage('1542729841-c5af4aed2152'),
  },
]

// Session 6.3 (WDOS Performance gate) — first ID was the same graphic
// lion-kill photo flagged in lib/stockImageCredits.ts's comment on
// COUNTRY_IMAGE_IDS.kenya; swapped for the real elephant-family frame.
const GALLERY_IDS = ['hero-savanna-poster', '1760681554227-d7aad73cd57f', '1544298903-35eee5a95b4d', '1635865897833-38bc0f8aee44', '1727023663928-1772e2c7e679', '1558694440-03ade9215d7b']

const attractionImageUrl = attractionStockImage

export default async function HomePage() {
  const [t, tc, [featured, guides, popularRaw, latestPosts]] = await Promise.all([
    getTranslations('home'),
    getTranslations('common'),
    Promise.all([
      client.fetch(FEATURED_QUERY).catch(() => []),
      client.fetch(GUIDES_QUERY).catch(() => []),
      client.fetch<{ name: string; slug: string }[]>(POPULAR_QUERY).catch(() => []),
      client.fetch<typeof FALLBACK_POSTS>(LATEST_POSTS_QUERY).catch(() => []),
    ]),
  ])

  const displayPosts = latestPosts.length > 0 ? latestPosts : FALLBACK_POSTS.slice(0, 3)

  const popularAttractions = popularRaw.map((a: { name: string; slug: string }) => ({ label: a.name, slug: a.slug }))

  const displayGuides: GuideItem[] = guides.length > 0
    ? guides.slice(0, 4).map(
        (g: { name: string; slug: string; continentRegion: string; editorialSummary: string; country?: { name: string } }, i: number): GuideItem => ({
          name: g.name, slug: g.slug, continentRegion: g.continentRegion, editorialSummary: g.editorialSummary,
          image: FALLBACK_GUIDES[i % 4].image, country: g.country?.name ?? 'Africa',
        })
      )
    : FALLBACK_GUIDES

  return (
    <>
      {HOME_JSON_LD.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden">
        {/* Session 6.3 (WDOS Performance gate) — real bug, caught only by
            actually looking at the rendered page: '1531872036218-...' is
            NOT elephants, it's a lioness feeding on a wildebeest carcass —
            a real, previously mislabeled, and graphic image for a travel
            homepage hero (this ID predates this session; it's also used,
            equally wrongly, for Kenya in DestinationsGrid.tsx and East
            Africa in Nav.tsx — flagged separately, not fixed here). Poster
            is now a real frame extracted from the actual hero video below
            (same Pexels source, same license — see HERO_VIDEO_CREDIT),
            so the alt text is finally true and there's no cut when the
            video mounts. This is also what permanently shows for
            prefers-reduced-motion and mobile visitors (video is skipped
            below 1024px — see HeroBackgroundMedia.tsx). */}
        <HeroBackgroundMedia
          imageSrc="/images/stock/hero-savanna-poster.jpg"
          imageAlt="African elephants walking through savanna grassland"
          videoSrc={HERO_VIDEO_CREDIT.file}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-scrim-1/96 via-scrim-2/88 to-scrim-3/55"/>
        <div className="absolute inset-0 bg-gradient-to-t from-scrim-1/60 via-transparent to-scrim-1/15"/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-14 lg:py-20">
          {/* Session 6.3 (WDOS Performance gate) — was items-center: any
              residual height change in the headline column (even a
              sub-pixel one from the animated reveal) re-centers the WHOLE
              row, which measurably moves the much larger Plan Your Trip
              card next to it — Lighthouse attributed 0.1834 of CLS to that
              card alone, by far the single biggest contributor, though the
              card's own content never changes at all. items-start removes
              the coupling: this column's height can no longer move a
              sibling that has nothing to do with it. */}
          <div className="grid lg:grid-cols-7 gap-10 lg:gap-16 items-start">

            <div className="lg:col-span-4">
              {/* Headline — 2 lines on desktop AND mobile */}
              <h1
                className="font-display font-extrabold text-cream mb-7 tracking-hero"
                // "2x bigger" per the owner's request — but a flat 2x on
                // every clamp() value (previously 46/4.2vw/64) also doubled
                // the MOBILE floor to 92px, which broke small screens (a
                // single word barely fit). Keeping the mobile-safe floor
                // and only scaling the vw term + desktop ceiling gets the
                // requested ~2x at desktop widths this was asked about
                // without breaking 375px — confirmed in both sizes below.
                style={{ fontSize: 'clamp(40px, 9vw, 128px)', lineHeight: '0.94' }}
              >
                <TypewriterHero
                  speed={32}
                  lines={[
                    { text: 'Explore ', noBreakAfter: true },
                    { text: 'Africa,', className: 'text-crimson' },
                    { text: ' One Adventure at a Time.' },
                  ]}
                />
              </h1>

              {/* Sub-headline */}
              <p className="font-display font-medium text-cream/75 mb-10 max-w-lg leading-relaxed"
                style={{ fontSize: 'clamp(13px, 1.5vw, 16px)' }}>
                {t('heroSubheadline')}
              </p>

              {/* Search */}
              <HeroSearchBar />

              <div>
                <p className="font-sans text-[14px] uppercase tracking-[0.15em] text-cream/55 mb-3">{t('popularSearches')}</p>
                <PopularPills attractions={popularAttractions} />
              </div>
            </div>

            {/* PlanTripCard — desktop only */}
            <div className="hidden lg:block lg:col-span-3">
              <PlanTripCard />
            </div>
          </div>
        </div>
      </section>

      {/* ══ DESTINATIONS — 6 random countries, 1 row desktop, 2 col mobile ════ */}
      <section className="py-14 lg:py-20 bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial mb-9"
            style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
            {t('whereNext')}
          </h2>

          {/* Client component handles random selection on each load */}
          <DestinationsGrid />

          <div className="mt-10 flex justify-center">
            <Link href="/attractions"
              className="inline-flex items-center gap-2.5 bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all shadow-[0_4px_24px_rgba(180,30,30,0.28)] hover:shadow-[0_8px_36px_rgba(180,30,30,0.38)]">
              {t('allDestinations')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ EDITORIAL SPOTLIGHT ════════════════════════════════════════════════ */}
      <EditorialSlider />

      {/* ══ FEATURED ATTRACTIONS (was: Latest Travel Guides) ══════════════════ */}
      <section className="py-14 lg:py-20 bg-sand dark-flip-surf" id="guides">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-end justify-between mb-9">
            <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
              style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
              {t('featuredAttractions')}
            </h2>
            <Link href="/search"
              className="inline-link link-arrow hidden sm:inline-flex font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted hover:text-crimson transition-colors">
              {tc('browseAll')}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">

            {/* Card 1: Tall photo-first */}
            <Link href={`/attractions/${displayGuides[0].slug}`}
              className="card-zoom group relative rounded-3xl overflow-hidden lg:row-span-2 min-h-[400px] lg:min-h-[580px] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500 flex flex-col">
              {/* Session 6.3 — image-redundant-alt: the guide's name is a visible heading in this same card below. */}
              <Image src={displayGuides[0].image} alt="" fill
                sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw"
                className="object-cover img-editorial img-inner"/>
              <div className="absolute inset-0 bg-gradient-to-t from-ink/97 via-ink/50 to-transparent"/>
              <div className="relative mt-auto p-7 lg:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-display font-bold text-[14px] uppercase tracking-[0.12em] text-gold-400">{displayGuides[0].country}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-cream group-hover:text-gold-300 transition-colors leading-snug mb-3"
                  style={{ letterSpacing: '-0.018em' }}>
                  {displayGuides[0].name}
                </h3>
                <p className="font-sans text-[15px] text-cream/68 leading-relaxed line-clamp-2 mb-5">
                  {displayGuides[0].editorialSummary}
                </p>
                <span className="link-arrow inline-link font-sans text-[14px] uppercase tracking-[0.14em] text-gold-400 group-hover:text-gold-300">
                  {t('readGuide')}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </span>
              </div>
            </Link>

            {/* Cards 2 and 3 */}
            {[displayGuides[1], displayGuides[2]].map((g) => (
              <Link key={g.slug} href={`/attractions/${g.slug}`}
                className="card-zoom group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 flex flex-col">
                <div className="relative h-48 shrink-0 overflow-hidden">
                  {/* Session 6.3 — image-redundant-alt: g.name is a visible heading in this same card below. */}
                  <Image src={g.image} alt="" fill sizes="(max-width:640px) 100vw,50vw"
                    className="object-cover img-editorial img-inner"/>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="font-display font-bold text-[14px] uppercase tracking-[0.12em] text-crimson">{g.country}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2 flex-1"
                    style={{ letterSpacing: '-0.015em' }}>
                    {g.name}
                  </h3>
                  <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2 mb-4">
                    {g.editorialSummary}
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t border-line dark-flip-border">
                    <span className="link-arrow inline-link font-sans text-[14px] text-crimson">
                      Read the guide
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Card 4: Wide horizontal */}
            <Link href={`/attractions/${displayGuides[3].slug}`}
              className="card-zoom group bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300 lg:col-span-2 flex flex-col sm:flex-row">
              <div className="relative h-52 sm:h-auto sm:w-72 lg:w-96 shrink-0 overflow-hidden">
                {/* Session 6.3 — image-redundant-alt: the guide's name is a visible heading in this same card below. */}
                <Image src={displayGuides[3].image} alt="" fill sizes="(max-width:640px) 100vw,384px"
                  className="object-cover img-editorial img-inner"/>
              </div>
              <div className="p-7 lg:p-8 flex flex-col justify-center flex-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="font-display font-bold text-[14px] uppercase tracking-[0.12em] text-crimson">{displayGuides[3].country}</span>
                </div>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-3"
                  style={{ letterSpacing: '-0.018em' }}>
                  {displayGuides[3].name}
                </h3>
                <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-3 mb-5">
                  {displayGuides[3].editorialSummary}
                </p>
                <div className="flex items-center justify-end pt-4 border-t border-line dark-flip-border">
                  <span className="link-arrow inline-link font-sans text-[14px] text-crimson">
                    {t('readTheGuide')}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* View all — prominent solid button */}
          <div className="mt-12 flex justify-center">
            <Link href="/attractions"
              className="inline-flex items-center gap-2.5 bg-ink hover:bg-charcoal text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all shadow-[0_4px_24px_rgba(26,24,19,0.22)] hover:shadow-[0_8px_36px_rgba(26,24,19,0.32)]">
              {t('allAttractions')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ EXPLORE BY EXPERIENCE — 1 row 6 cols desktop, 2 col mobile ════════ */}
      <section className="py-14 lg:py-20 bg-cream dark-flip-bg" id="experiences">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="flex items-end justify-between mb-9">
            <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
              style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
              {t('exploreByExperience')}
            </h2>
          </div>

          <ExperiencesCarousel />
        </div>
      </section>

      {/* ══ LATEST TRAVEL ATTRACTIONS (was: Featured Attractions) ════════════════ */}
      {(featured as AttrItem[]).length > 0 && (
        <section className="py-14 lg:py-20 bg-sand dark-flip-surf">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">

            <div className="flex items-end justify-between mb-9">
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
                {t('latestAttractions')}
              </h2>
              <Link href="/search"
                className="inline-link link-arrow hidden sm:inline-flex font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted hover:text-crimson transition-colors">
                {tc('browseAll')}
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {(featured as AttrItem[]).slice(0, 8).map((a) => (
                <Link key={a.slug} href={`/attractions/${a.slug}`}
                  className="card-zoom group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)] transition-shadow duration-500">
                  {/* Session 6.3 — image-redundant-alt: a.name is a visible heading in this same card below. */}
                  <Image
                    src={attractionImageUrl(a.slug)}
                    alt="" fill
                    sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                    className="object-cover img-editorial img-inner"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/97 via-ink/35 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-display font-bold text-base text-cream group-hover:text-gold-300 transition-colors leading-tight mb-1"
                      style={{ letterSpacing: '-0.015em' }}>
                      {a.name}
                    </h3>
                    {a.editorialSummary && (
                      <p className="font-sans text-[14px] text-cream/70 leading-snug line-clamp-2 mt-1">{a.editorialSummary}</p>
                    )}
                    {a.country?.name && (
                      <p className="font-sans text-[14px] text-cream/60 mt-2">{a.country.name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 flex items-center justify-center gap-2">
              <button disabled aria-label="Previous page"
                className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/65 disabled:opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
              </button>
              {[1, 2, 3, 4, 5].map(n => (
                <Link key={n} href={n === 1 ? '/search' : `/search?page=${n}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-semibold text-[14px] transition-all
                    ${n === 1 ? 'bg-ink text-cream shadow-[var(--shadow-soft)]' : 'border border-line dark-flip-border text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson'}`}>
                  {n}
                </Link>
              ))}
              <span className="font-sans text-[14px] text-charcoal/65 px-1">...</span>
              <Link href="/search?page=9"
                className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center font-display font-semibold text-[14px] text-charcoal/50 dark-flip-muted hover:border-crimson hover:text-crimson transition-all">
                9
              </Link>
              <Link href="/search?page=2" aria-label="Next page"
                className="w-10 h-10 rounded-xl border border-line dark-flip-border flex items-center justify-center text-charcoal/50 dark-flip-muted hover:text-crimson hover:border-crimson transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ FROM THE JOURNAL ════════════════════════════════════════════════════ */}
      <section className="py-14 lg:py-20 bg-sand dark-flip-surf border-t border-line dark-flip-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-9">
            <div>
              <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-2">The Journal</p>
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(22px, 2.8vw, 38px)', lineHeight: '1.0' }}>
                Stories from Across Africa
              </h2>
            </div>

          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {displayPosts.map(post => {
              const coverSrc = blogStockImage(post.slug)
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="group block bg-white dark-flip-card rounded-3xl overflow-hidden border border-line dark-flip-border hover:shadow-[var(--shadow-lift)] hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-52 overflow-hidden bg-sand">
                    {/* Session 6.3 — image-redundant-alt: post.title is a visible heading in this same card below. */}
                    <Image
                      src={coverSrc}
                      alt="" fill
                      sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
                      className="object-cover img-editorial img-inner"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-ink/75 backdrop-blur font-sans text-[14px] uppercase tracking-[0.14em] text-cream/85 px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.tags?.[0] && (
                        <>
                          <span className="font-sans text-[14px] uppercase tracking-[0.14em] text-crimson">{post.tags[0]}</span>
                          <span className="text-charcoal/65 dark-flip-muted">·</span>
                        </>
                      )}
                      <span className="font-sans text-[14px] text-charcoal/55 dark-flip-muted">
                        {new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-charcoal dark-flip-text group-hover:text-crimson transition-colors leading-snug mb-2"
                      style={{ fontSize: 'clamp(14px, 1.5vw, 17px)', letterSpacing: '-0.015em' }}>
                      {post.title}
                    </h3>
                    <p className="font-sans text-[15px] text-charcoal/65 dark-flip-muted leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 pt-4 border-t border-line dark-flip-border flex items-center justify-between">
                      <span className="font-sans text-[14px] text-charcoal/55 dark-flip-muted">{post.author?.name}</span>
                      <span className="font-sans text-[14px] uppercase tracking-[0.12em] text-crimson group-hover:text-crimson/70 transition-colors">
                        Read &#8594;
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/blog"
              className="inline-flex items-center gap-2.5 bg-ink hover:bg-charcoal text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all">
              View All Articles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ INSTAGRAM GALLERY ══════════════════════════════════════════════════ */}
      <section className="py-24 lg:py-28 bg-cream dark-flip-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="font-sans text-[14px] uppercase tracking-[0.22em] text-crimson mb-2">@myafrowaka_</p>
              <h2 className="font-display font-bold text-charcoal dark-flip-text tracking-editorial"
                style={{ fontSize: 'clamp(20px, 2.5vw, 34px)' }}>
                Follow Our Journey
              </h2>
            </div>
            <a href="https://instagram.com/myafrowaka_" target="_blank" rel="noopener noreferrer"
              className="inline-link link-arrow hidden sm:inline-flex font-sans text-[14px] uppercase tracking-[0.16em] text-charcoal/55 dark-flip-muted hover:text-crimson transition-colors">
              Instagram
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {GALLERY_IDS.map(id => (
              <a key={id} href="https://instagram.com/myafrowaka_" target="_blank" rel="noopener noreferrer"
                className="card-zoom group relative aspect-square rounded-xl overflow-hidden bg-sand dark-flip-surf">
                <Image src={stockImage(id)} alt="MyAfroWaka on Instagram" fill sizes="(max-width:640px) 33vw,17vw"
                  className="object-cover img-editorial img-inner"/>
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-5 h-5 text-cream opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═════════════════════════════════════════════════════════ */}
      <section className="relative py-28 lg:py-36 overflow-hidden">
        <Image src={stockImage('1542729841-c5af4aed2152')} alt="" fill className="object-cover img-editorial"/>
        <div className="absolute inset-0 bg-ink/88"/>
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display font-extrabold text-cream mb-6 tracking-hero"
            style={{ fontSize: 'clamp(40px, 4.5vw, 64px)', lineHeight: '0.94' }}>
            Your African Adventure Starts Here.
          </h2>
          <p className="font-sans text-cream/68 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            From ancient wonders to rooftop bars. From gorilla forests to Sahara sand dunes.
            Every journey across this continent starts with knowing where to go.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search"
              className="inline-flex items-center justify-center gap-2 bg-action hover:bg-action-hover text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-all">
              Explore Destinations
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </Link>
            <Link href="/about"
              className="inline-flex items-center justify-center border border-white/25 hover:border-white/55 text-cream/75 hover:text-cream font-display font-bold text-[14px] uppercase tracking-[0.12em] px-10 py-4 rounded-full transition-colors">
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

